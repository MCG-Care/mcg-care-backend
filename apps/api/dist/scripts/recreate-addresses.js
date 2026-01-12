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
async function recreateAddresses() {
    try {
        console.log('🔍 Current state:\n');
        const users = await db.execute((0, drizzle_orm_1.sql) `
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
        users.forEach((u) => {
            console.log(`   User ${u.id}: ${u.name} (${u.email}) → primary_address_id = ${u.primary_address_id}`);
        });
        console.log('\n📝 To fix this, you have two options:\n');
        console.log('Option 1: Clear broken references (users will have no primary address)');
        console.log('Option 2: Recreate addresses manually (you need to provide address data)\n');
        console.log('🔧 Clearing broken primary_address_id references...\n');
        await db.execute((0, drizzle_orm_1.sql) `
      UPDATE users
      SET primary_address_id = NULL
      WHERE primary_address_id IS NOT NULL
        AND primary_address_id NOT IN (SELECT id FROM addresses)
    `);
        const cleared = await db.execute((0, drizzle_orm_1.sql) `
      SELECT COUNT(*) as count
      FROM users
      WHERE primary_address_id IS NULL
        AND id IN (${drizzle_orm_1.sql.join(users.map((u) => (0, drizzle_orm_1.sql) `${u.id}`), (0, drizzle_orm_1.sql) `, `)})
    `);
        console.log(`✅ Cleared ${cleared[0].count} broken references\n`);
        console.log('📋 Template to recreate addresses:\n');
        console.log('You can now recreate addresses using the API or this SQL template:\n');
        users.forEach((u, index) => {
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
    }
    catch (error) {
        console.error('❌ Error:', error);
        throw error;
    }
    finally {
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
//# sourceMappingURL=recreate-addresses.js.map