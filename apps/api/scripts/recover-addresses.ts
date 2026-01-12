/**
 * Recovery script to recreate addresses from user primary_address_id references
 * 
 * This script attempts to recover address data by:
 * 1. Checking if we have any backup/reference data
 * 2. Looking at the migration history
 * 3. Recreating addresses from user primary_address_id if possible
 * 
 * Run with: npx ts-node scripts/recover-addresses.ts
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

async function checkDatabaseState() {
  try {
    console.log('🔍 Checking database state...\n');

    // Check users table
    const users = await db.execute(sql`
      SELECT id, name, email, primary_address_id 
      FROM users 
      ORDER BY id
    `);
    console.log(`📋 Found ${users.length} users`);
    console.log('Users with primary_address_id:');
    users.forEach((u: any) => {
      if (u.primary_address_id) {
        console.log(`   User ${u.id} (${u.name}): primary_address_id = ${u.primary_address_id}`);
      }
    });

    // Check addresses table
    const addresses = await db.execute(sql`
      SELECT * FROM addresses ORDER BY id
    `);
    console.log(`\n📋 Found ${addresses.length} addresses in addresses table`);

    if (addresses.length === 0) {
      console.log('\n⚠️  Addresses table is empty!');
      
      // Check if there are any addresses referenced by users
      const usersWithAddresses = users.filter((u: any) => u.primary_address_id);
      console.log(`\n🔍 Found ${usersWithAddresses.length} users referencing addresses`);
      
      if (usersWithAddresses.length > 0) {
        console.log('\n❌ Problem: Users reference addresses that no longer exist!');
        console.log('   This likely happened during the migration.');
        console.log('\n💡 Options to recover:');
        console.log('   1. Check database backups');
        console.log('   2. Check if addresses were moved to another table');
        console.log('   3. Manually recreate addresses (you\'ll need to provide address data)');
        
        // Check for any backup tables or old table names
        console.log('\n🔍 Checking for backup tables...');
        const tables = await db.execute(sql`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
            AND table_name LIKE '%address%'
          ORDER BY table_name
        `);
        console.log('Tables with "address" in name:');
        tables.forEach((t: any) => {
          console.log(`   - ${t.table_name}`);
        });
      }
    } else {
      console.log('\n✅ Addresses found:');
      addresses.forEach((a: any) => {
        console.log(`   Address ${a.id}: user_id=${a.user_id}, address="${a.address}", township="${a.township}"`);
      });
    }

    // Check migration history if possible
    console.log('\n🔍 Checking for migration metadata...');
    try {
      const migrations = await db.execute(sql`
        SELECT * FROM drizzle.__drizzle_migrations ORDER BY created_at DESC LIMIT 5
      `);
      console.log(`Found ${migrations.length} recent migrations`);
    } catch (e) {
      console.log('Could not access migration history');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await queryClient.end();
  }
}

checkDatabaseState()
  .then(() => {
    console.log('\n✅ Check complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
