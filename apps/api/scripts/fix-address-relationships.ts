/**
 * Migration script to restore address relationships after schema migration
 * 
 * This script:
 * 1. Finds all users with primary_address_id
 * 2. Updates the corresponding addresses to set user_id
 * 3. Restores the one-to-many relationship
 * 
 * Run with: npx ts-node scripts/fix-address-relationships.ts
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

async function fixAddressRelationships() {
  try {
    console.log('🔍 Finding users with primary addresses...');

    // Find all users that have a primary_address_id
    const usersWithAddresses = await db.execute(sql`
      SELECT id, primary_address_id 
      FROM users 
      WHERE primary_address_id IS NOT NULL
    `);

    console.log(`📋 Found ${usersWithAddresses.length} users with primary addresses`);

    if (usersWithAddresses.length === 0) {
      console.log('✅ No users with addresses found. Nothing to fix.');
      await queryClient.end();
      return;
    }

    let updatedCount = 0;
    let errorCount = 0;

    // Update each address to link it to its user
    for (const user of usersWithAddresses) {
      try {
        // Check if address already has correct user_id
        const existing = await db.execute(sql`
          SELECT user_id FROM addresses WHERE id = ${user.primary_address_id}
        `);
        
        if (existing.length > 0) {
          const existingUserId = (existing[0] as any).user_id;
          if (existingUserId === user.id) {
            console.log(`ℹ️  Address ${user.primary_address_id} already linked to user ${user.id}`);
            continue;
          }
        }

        // Update the address
        await db.execute(sql`
          UPDATE addresses
          SET user_id = ${user.id}
          WHERE id = ${user.primary_address_id}
        `);

        updatedCount++;
        console.log(`✅ Updated address ${user.primary_address_id} → user ${user.id}`);
      } catch (error) {
        console.error(`❌ Error updating address ${user.primary_address_id} for user ${user.id}:`, error);
        errorCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Successfully updated: ${updatedCount}`);
    console.log(`   ⚠️  Errors/Skipped: ${errorCount}`);
    console.log(`   📝 Total processed: ${usersWithAddresses.length}`);

    // Verify the fix
    console.log('\n🔍 Verifying relationships...');
    const orphanedAddresses = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM addresses
      WHERE user_id IS NULL
    `);

    const orphanedCount = parseInt(String((orphanedAddresses[0] as any)?.count || '0'));
    if (orphanedCount > 0) {
      console.log(`⚠️  Warning: ${orphanedCount} addresses still have no user_id`);
    } else {
      console.log('✅ All addresses are now linked to users!');
    }

    console.log('\n✨ Migration complete!');
  } catch (error) {
    console.error('❌ Fatal error:', error);
    throw error;
  } finally {
    await queryClient.end();
  }
}

// Run the migration
fixAddressRelationships()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
