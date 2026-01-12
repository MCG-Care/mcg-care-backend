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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const postgres_js_1 = require("drizzle-orm/postgres-js");
const postgres_1 = __importDefault(require("postgres"));
const dotenv = __importStar(require("dotenv"));
const drizzle_orm_1 = require("drizzle-orm");
const schema = __importStar(require("../drizzle/schema"));
dotenv.config();
const connectionString = process.env.DATABASE_URL;
const queryClient = (0, postgres_1.default)(connectionString);
const db = (0, postgres_js_1.drizzle)(queryClient, { schema });
async function testLogin() {
    try {
        console.log('Testing getUserByEmail query...\n');
        const email = 'admin@test.com';
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
            .leftJoin(schema.addresses, (0, drizzle_orm_1.eq)(schema.users.primaryAddressId, schema.addresses.id))
            .where((0, drizzle_orm_1.eq)(schema.users.email, email))
            .limit(1);
        console.log('Query executed successfully!');
        console.log('Results:', JSON.stringify(results, null, 2));
        if (results.length > 0) {
            const result = results[0];
            const { primaryAddress } = result, user = __rest(result, ["primaryAddress"]);
            const transformed = Object.assign(Object.assign({}, user), { address: primaryAddress && primaryAddress.id ? primaryAddress : null });
            console.log('\nTransformed result:', JSON.stringify(transformed, null, 2));
        }
        else {
            console.log('No user found with that email');
        }
    }
    catch (error) {
        console.error('❌ Error:', error);
        if (error instanceof Error) {
            console.error('Message:', error.message);
            console.error('Stack:', error.stack);
        }
    }
    finally {
        await queryClient.end();
    }
}
testLogin()
    .then(() => process.exit(0))
    .catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=test-login.js.map