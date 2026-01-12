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
async function fixAddressRelationships() {
    var _a;
    try {
        console.log('🔍 Finding users with primary addresses...');
        const usersWithAddresses = await db.execute((0, drizzle_orm_1.sql) `
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
        for (const user of usersWithAddresses) {
            try {
                const existing = await db.execute((0, drizzle_orm_1.sql) `
          SELECT user_id FROM addresses WHERE id = ${user.primary_address_id}
        `);
                if (existing.length > 0) {
                    const existingUserId = existing[0].user_id;
                    if (existingUserId === user.id) {
                        console.log(`ℹ️  Address ${user.primary_address_id} already linked to user ${user.id}`);
                        continue;
                    }
                }
                await db.execute((0, drizzle_orm_1.sql) `
          UPDATE addresses
          SET user_id = ${user.id}
          WHERE id = ${user.primary_address_id}
        `);
                updatedCount++;
                console.log(`✅ Updated address ${user.primary_address_id} → user ${user.id}`);
            }
            catch (error) {
                console.error(`❌ Error updating address ${user.primary_address_id} for user ${user.id}:`, error);
                errorCount++;
            }
        }
        console.log('\n📊 Summary:');
        console.log(`   ✅ Successfully updated: ${updatedCount}`);
        console.log(`   ⚠️  Errors/Skipped: ${errorCount}`);
        console.log(`   📝 Total processed: ${usersWithAddresses.length}`);
        console.log('\n🔍 Verifying relationships...');
        const orphanedAddresses = await db.execute((0, drizzle_orm_1.sql) `
      SELECT COUNT(*) as count
      FROM addresses
      WHERE user_id IS NULL
    `);
        const orphanedCount = parseInt(String(((_a = orphanedAddresses[0]) === null || _a === void 0 ? void 0 : _a.count) || '0'));
        if (orphanedCount > 0) {
            console.log(`⚠️  Warning: ${orphanedCount} addresses still have no user_id`);
        }
        else {
            console.log('✅ All addresses are now linked to users!');
        }
        console.log('\n✨ Migration complete!');
    }
    catch (error) {
        console.error('❌ Fatal error:', error);
        throw error;
    }
    finally {
        await queryClient.end();
    }
}
fixAddressRelationships()
    .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
})
    .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
});
//# sourceMappingURL=fix-address-relationships.js.map