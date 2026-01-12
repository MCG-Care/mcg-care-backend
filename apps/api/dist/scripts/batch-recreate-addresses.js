"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const postgres_js_1 = require("drizzle-orm/postgres-js");
const postgres_1 = __importDefault(require("postgres"));
const dotenv = __importStar(require("dotenv"));
const drizzle_orm_1 = require("drizzle-orm");
dotenv.config();
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('DATABASE_URL is not defined in environment variables.');
    process.exit(1);
}
const queryClient = (0, postgres_1.default)(connectionString);
const db = (0, postgres_js_1.drizzle)(queryClient);
const DEFAULT_ADDRESS = {
    name: 'Home',
    address: '123 Main Street',
    township: 'Mayangone',
    city: 'Yangon',
    district: 'Yangon',
};
async function batchRecreateAddresses() {
    try {
        console.log('🔍 Finding users without addresses...\n');
        const usersWithoutAddresses = await db.execute((0, drizzle_orm_1.sql) `
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
        usersWithoutAddresses.forEach((u) => {
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
                let addressName = DEFAULT_ADDRESS.name;
                if (DEFAULT_ADDRESS.name === 'Home') {
                    addressName = DEFAULT_ADDRESS.address.substring(0, 30);
                    if (DEFAULT_ADDRESS.address.length > 30) {
                        addressName += '...';
                    }
                }
                const result = await db.execute((0, drizzle_orm_1.sql) `
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
                const newAddressId = result[0].id;
                await db.execute((0, drizzle_orm_1.sql) `
          UPDATE users
          SET primary_address_id = ${newAddressId}
          WHERE id = ${user.id}
        `);
                createdCount++;
                console.log(`✅ Created address ${newAddressId} for User ${user.id} (${user.name})`);
            }
            catch (error) {
                console.error(`❌ Error creating address for User ${user.id}:`, error);
                errorCount++;
            }
        }
        console.log('\n📊 Summary:');
        console.log(`   ✅ Successfully created: ${createdCount}`);
        console.log(`   ❌ Errors: ${errorCount}`);
        console.log(`   📝 Total processed: ${usersWithoutAddresses.length}`);
        console.log('\n🔍 Verifying...');
        const usersStillWithoutAddresses = await db.execute((0, drizzle_orm_1.sql) `
      SELECT COUNT(*) as count
      FROM users u
      LEFT JOIN addresses a ON a.user_id = u.id
      WHERE a.id IS NULL
    `);
        const remaining = parseInt(String(usersStillWithoutAddresses[0].count || '0'));
        if (remaining === 0) {
            console.log('✅ All users now have addresses!');
        }
        else {
            console.log(`⚠️  ${remaining} users still don't have addresses`);
        }
        console.log('\n💡 Note: All addresses were created with default values.');
        console.log('   You can update them later using:');
        console.log('   - PATCH /users/:id/addresses/:addressId');
        console.log('   - Or directly in the database\n');
    }
    catch (error) {
        console.error('❌ Fatal error:', error);
        throw error;
    }
    finally {
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
//# sourceMappingURL=batch-recreate-addresses.js.map