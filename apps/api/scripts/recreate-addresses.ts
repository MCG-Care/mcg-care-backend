/**
 * Script to help recover/recreate addresses
 * 
 * Option 1: Clear broken primary_address_id references
 * Option 2: Template to recreate addresses manually
 * 
 * Run with: npx ts-node scripts/recreate-addresses.ts
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { sql } from 'drizzle-orm';

dotenv.config();

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  console.error('DATABASE_URL is not defined in environment variables.');
  process.exit(1);
}

const queryClient = postgres(connectionString);
const db = drizzle(queryClient);

async function recreateAddresses() {
  try {
    console.log('🔍 Current state:\n');

    // Get users with broken address references
    const users = await db.execute(sql`
      SELECT id, name, email, primary_address_id 
      FROM users 
      WHERE primary_address_id IS NOT NULL
      ORDER BY id
    `);

    console.log(`Found ${users.length} users with primary_address_id references\n`);

    if (users.length === 0) {
      console.log('✅ No broken references found. All good!');
      await queryClient.end();
      return;
    }

    console.log('⚠️  These users have primary_address_id pointing to non-existent addresses:\n');
    users.forEach((u: any) => {
      console.log(`   User ${u.id}: ${u.name} (${u.email}) → primary_address_id = ${u.primary_address_id}`);
    });

    console.log('\n📝 To fix this, you have two options:\n');
    console.log('Option 1: Clear broken references (users will have no primary address)');
    console.log('Option 2: Recreate addresses manually (you need to provide address data)\n');

    // For now, let's clear the broken references to prevent errors
    console.log('🔧 Clearing broken primary_address_id references...\n');

    await db.execute(sql`
      UPDATE users
      SET primary_address_id = NULL
      WHERE primary_address_id IS NOT NULL
        AND primary_address_id NOT IN (SELECT id FROM addresses)
    `);

    const cleared = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM users
      WHERE primary_address_id IS NULL
        AND id IN (${sql.join(users.map((u: any) => sql`${u.id}`), sql`, `)})
    `);

    console.log(`✅ Cleared ${(cleared[0] as any).count} broken references\n`);

    console.log('📋 Template to recreate addresses:\n');
    console.log('You can now recreate addresses using the API or this SQL template:\n');
    
    users.forEach((u: any, index: number) => {
      console.log(`-- Address for User ${u.id} (${u.name})`);
      console.log(`INSERT INTO addresses (user_id, name, address, township, city, district, created_at, updated_at)`);
      console.log(`VALUES (`);
      console.log(`  ${u.id},`);
      console.log(`  'Home',  -- Change this nickname`);
      console.log(`  '123 Main St',  -- Change this`);
      console.log(`  'Mayangone',  -- Change this`);
      console.log(`  'Yangon',  -- Change this`);
      console.log(`  'Yangon',  -- Change this`);
      console.log(`  NOW(),`);
      console.log(`  NOW()`);
      console.log(`);`);
      console.log(`UPDATE users SET primary_address_id = (SELECT id FROM addresses WHERE user_id = ${u.id} ORDER BY id DESC LIMIT 1) WHERE id = ${u.id};`);
      console.log('');
    });

    console.log('💡 Or use the API endpoint:');
    console.log('   POST /users/:id/addresses');
    console.log('   Then: PATCH /users/:id/primary-address/:addressId\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await queryClient.end();
  }
}

recreateAddresses()
  .then(() => {
    console.log('✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
