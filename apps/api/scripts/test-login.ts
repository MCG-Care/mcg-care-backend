/**
 * Quick test script to check if login query works
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import * as schema from '../drizzle/schema';

dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const queryClient = postgres(connectionString);
const db = drizzle(queryClient, { schema });

async function testLogin() {
  try {
    console.log('Testing getUserByEmail query...\n');
    
    const email = 'admin@test.com'; // Test with admin email
    
    const results = await db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        password: schema.users.password,
        phoneNo: schema.users.phoneNo,
        role: schema.users.role,
        primaryAddressId: schema.users.primaryAddressId,
        createdAt: schema.users.createdAt,
        updatedAt: schema.users.updatedAt,
        primaryAddress: {
          id: schema.addresses.id,
          name: schema.addresses.name,
          address: schema.addresses.address,
          township: schema.addresses.township,
          city: schema.addresses.city,
          district: schema.addresses.district,
          createdAt: schema.addresses.createdAt,
          updatedAt: schema.addresses.updatedAt,
        },
      })
      .from(schema.users)
      .leftJoin(schema.addresses, eq(schema.users.primaryAddressId, schema.addresses.id))
      .where(eq(schema.users.email, email))
      .limit(1);

    console.log('Query executed successfully!');
    console.log('Results:', JSON.stringify(results, null, 2));
    
    if (results.length > 0) {
      const result = results[0];
      const { primaryAddress, ...user } = result;
      const transformed = {
        ...user,
        address: primaryAddress && primaryAddress.id ? primaryAddress : null,
      };
      console.log('\nTransformed result:', JSON.stringify(transformed, null, 2));
    } else {
      console.log('No user found with that email');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }
  } finally {
    await queryClient.end();
  }
}

testLogin()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
