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
async function checkDatabaseState() {
    try {
        console.log('🔍 Checking database state...\n');
        const users = await db.execute((0, drizzle_orm_1.sql) `
      SELECT id, name, email, primary_address_id 
      FROM users 
      ORDER BY id
    `);
        console.log(`📋 Found ${users.length} users`);
        console.log('Users with primary_address_id:');
        users.forEach((u) => {
            if (u.primary_address_id) {
                console.log(`   User ${u.id} (${u.name}): primary_address_id = ${u.primary_address_id}`);
            }
        });
        const addresses = await db.execute((0, drizzle_orm_1.sql) `
      SELECT * FROM addresses ORDER BY id
    `);
        console.log(`\n📋 Found ${addresses.length} addresses in addresses table`);
        if (addresses.length === 0) {
            console.log('\n⚠️  Addresses table is empty!');
            const usersWithAddresses = users.filter((u) => u.primary_address_id);
            console.log(`\n🔍 Found ${usersWithAddresses.length} users referencing addresses`);
            if (usersWithAddresses.length > 0) {
                console.log('\n❌ Problem: Users reference addresses that no longer exist!');
                console.log('   This likely happened during the migration.');
                console.log('\n💡 Options to recover:');
                console.log('   1. Check database backups');
                console.log('   2. Check if addresses were moved to another table');
                console.log('   3. Manually recreate addresses (you\'ll need to provide address data)');
                console.log('\n🔍 Checking for backup tables...');
                const tables = await db.execute((0, drizzle_orm_1.sql) `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
            AND table_name LIKE '%address%'
          ORDER BY table_name
        `);
                console.log('Tables with "address" in name:');
                tables.forEach((t) => {
                    console.log(`   - ${t.table_name}`);
                });
            }
        }
        else {
            console.log('\n✅ Addresses found:');
            addresses.forEach((a) => {
                console.log(`   Address ${a.id}: user_id=${a.user_id}, address="${a.address}", township="${a.township}"`);
            });
        }
        console.log('\n🔍 Checking for migration metadata...');
        try {
            const migrations = await db.execute((0, drizzle_orm_1.sql) `
        SELECT * FROM drizzle.__drizzle_migrations ORDER BY created_at DESC LIMIT 5
      `);
            console.log(`Found ${migrations.length} recent migrations`);
        }
        catch (e) {
            console.log('Could not access migration history');
        }
    }
    catch (error) {
        console.error('❌ Error:', error);
        throw error;
    }
    finally {
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
//# sourceMappingURL=recover-addresses.js.map