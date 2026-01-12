/**
 * Batch script to recreate addresses for all users
 * 
 * This script will:
 * 1. Get all users without addresses
 * 2. Create a default address for each user
 * 3. Set it as their primary address
 * 
 * Run with: npx ts-node scripts/batch-recreate-addresses.ts
 * 
 * To customize addresses, edit the DEFAULT_ADDRESS object below
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

// Default address data - customize these values
const DEFAULT_ADDRESS = {
  name: 'Home', // Default nickname
  address: '123 Main Street', // Default street address
  township: 'Mayangone', // Default township
  city: 'Yangon', // Default city
  district: 'Yangon', // Default district
};

async function batchRecreateAddresses() {
  try {
    console.log('🔍 Finding users without addresses...\n');

    // Get all users that don't have any addresses
    const usersWithoutAddresses = await db.execute(sql`
      SELECT u.id, u.name, u.email, u.primary_address_id
      FROM users u
      LEFT JOIN addresses a ON a.user_id = u.id
      WHERE a.id IS NULL
      ORDER BY u.id
    `);

    if (usersWithoutAddresses.length === 0) {
      console.log('✅ All users already have addresses!');
      await queryClient.end();
      return;
    }

    console.log(`📋 Found ${usersWithoutAddresses.length} users without addresses:\n`);
    usersWithoutAddresses.forEach((u: any) => {
      console.log(`   User ${u.id}: ${u.name} (${u.email})`);
    });

    console.log(`\n🔧 Creating addresses with default data:`);
    console.log(`   Name: ${DEFAULT_ADDRESS.name}`);
    console.log(`   Address: ${DEFAULT_ADDRESS.address}`);
    console.log(`   Township: ${DEFAULT_ADDRESS.township}`);
    console.log(`   City: ${DEFAULT_ADDRESS.city}`);
    console.log(`   District: ${DEFAULT_ADDRESS.district}\n`);

    let createdCount = 0;
    let errorCount = 0;

    for (const user of usersWithoutAddresses) {
      try {
        // Generate a name from the address if default name is generic
        let addressName = DEFAULT_ADDRESS.name;
        if (DEFAULT_ADDRESS.name === 'Home') {
          // Use first part of address or township as name
          addressName = DEFAULT_ADDRESS.address.substring(0, 30);
          if (DEFAULT_ADDRESS.address.length > 30) {
            addressName += '...';
          }
        }

        // Insert the address
        const result = await db.execute(sql`
          INSERT INTO addresses (user_id, name, address, township, city, district, created_at, updated_at)
          VALUES (
            ${user.id},
            ${addressName},
            ${DEFAULT_ADDRESS.address},
            ${DEFAULT_ADDRESS.township},
            ${DEFAULT_ADDRESS.city},
            ${DEFAULT_ADDRESS.district},
            NOW(),
            NOW()
          )
          RETURNING id
        `);

        const newAddressId = (result[0] as any).id;

        // Set as primary address
        await db.execute(sql`
          UPDATE users
          SET primary_address_id = ${newAddressId}
          WHERE id = ${user.id}
        `);

        createdCount++;
        console.log(`✅ Created address ${newAddressId} for User ${user.id} (${user.name})`);
      } catch (error) {
        console.error(`❌ Error creating address for User ${user.id}:`, error);
        errorCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Successfully created: ${createdCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📝 Total processed: ${usersWithoutAddresses.length}`);

    // Verify
    console.log('\n🔍 Verifying...');
    const usersStillWithoutAddresses = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM users u
      LEFT JOIN addresses a ON a.user_id = u.id
      WHERE a.id IS NULL
    `);

    const remaining = parseInt(String((usersStillWithoutAddresses[0] as any).count || '0'));
    if (remaining === 0) {
      console.log('✅ All users now have addresses!');
    } else {
      console.log(`⚠️  ${remaining} users still don't have addresses`);
    }

    console.log('\n💡 Note: All addresses were created with default values.');
    console.log('   You can update them later using:');
    console.log('   - PATCH /users/:id/addresses/:addressId');
    console.log('   - Or directly in the database\n');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    throw error;
  } finally {
    await queryClient.end();
  }
}

batchRecreateAddresses()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
