"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../config/database.module");
const database_1 = require("../../config/database");
const drizzle_orm_1 = require("drizzle-orm");
let UsersService = class UsersService {
    constructor(db) {
        this.db = db;
    }
    async getAllUsers() {
        const results = await this.db
            .select({
            id: database_1.schema.users.id,
            name: database_1.schema.users.name,
            email: database_1.schema.users.email,
            phoneNo: database_1.schema.users.phoneNo,
            role: database_1.schema.users.role,
            addressId: database_1.schema.users.addressId,
            createdAt: database_1.schema.users.createdAt,
            updatedAt: database_1.schema.users.updatedAt,
            address: {
                id: database_1.schema.addresses.id,
                address: database_1.schema.addresses.address,
                township: database_1.schema.addresses.township,
                city: database_1.schema.addresses.city,
                district: database_1.schema.addresses.district,
                createdAt: database_1.schema.addresses.createdAt,
                updatedAt: database_1.schema.addresses.updatedAt,
            },
        })
            .from(database_1.schema.users)
            .leftJoin(database_1.schema.addresses, (0, drizzle_orm_1.eq)(database_1.schema.users.addressId, database_1.schema.addresses.id));
        return results.map((result) => {
            const { address } = result, user = __rest(result, ["address"]);
            return Object.assign(Object.assign({}, user), { address: address && address.id ? address : null });
        });
    }
    async getUserById(id, includeRating = false) {
        const results = await this.db
            .select({
            id: database_1.schema.users.id,
            name: database_1.schema.users.name,
            email: database_1.schema.users.email,
            phoneNo: database_1.schema.users.phoneNo,
            role: database_1.schema.users.role,
            addressId: database_1.schema.users.addressId,
            createdAt: database_1.schema.users.createdAt,
            updatedAt: database_1.schema.users.updatedAt,
            address: {
                id: database_1.schema.addresses.id,
                address: database_1.schema.addresses.address,
                township: database_1.schema.addresses.township,
                city: database_1.schema.addresses.city,
                district: database_1.schema.addresses.district,
                createdAt: database_1.schema.addresses.createdAt,
                updatedAt: database_1.schema.addresses.updatedAt,
            },
        })
            .from(database_1.schema.users)
            .leftJoin(database_1.schema.addresses, (0, drizzle_orm_1.eq)(database_1.schema.users.addressId, database_1.schema.addresses.id))
            .where((0, drizzle_orm_1.eq)(database_1.schema.users.id, id))
            .limit(1);
        const result = results[0] || null;
        if (!result)
            return null;
        const { address } = result, user = __rest(result, ["address"]);
        const userWithAddress = Object.assign(Object.assign({}, user), { address: address && address.id ? address : null });
        if (includeRating && user.role === 'technician') {
            try {
                const ratingData = await this.getTechnicianAverageRating(id);
                return Object.assign(Object.assign({}, userWithAddress), { averageRating: ratingData.averageRatingRounded, totalFeedbacks: ratingData.totalFeedbacks });
            }
            catch (error) {
                return userWithAddress;
            }
        }
        return userWithAddress;
    }
    async getUserByEmail(email) {
        const results = await this.db
            .select({
            id: database_1.schema.users.id,
            name: database_1.schema.users.name,
            email: database_1.schema.users.email,
            password: database_1.schema.users.password,
            phoneNo: database_1.schema.users.phoneNo,
            role: database_1.schema.users.role,
            addressId: database_1.schema.users.addressId,
            createdAt: database_1.schema.users.createdAt,
            updatedAt: database_1.schema.users.updatedAt,
            address: {
                id: database_1.schema.addresses.id,
                address: database_1.schema.addresses.address,
                township: database_1.schema.addresses.township,
                city: database_1.schema.addresses.city,
                district: database_1.schema.addresses.district,
                createdAt: database_1.schema.addresses.createdAt,
                updatedAt: database_1.schema.addresses.updatedAt,
            },
        })
            .from(database_1.schema.users)
            .leftJoin(database_1.schema.addresses, (0, drizzle_orm_1.eq)(database_1.schema.users.addressId, database_1.schema.addresses.id))
            .where((0, drizzle_orm_1.eq)(database_1.schema.users.email, email))
            .limit(1);
        const result = results[0] || null;
        if (!result)
            return null;
        const { address } = result, user = __rest(result, ["address"]);
        return Object.assign(Object.assign({}, user), { address: address && address.id ? address : null });
    }
    async createUser(data) {
        const result = await this.db.insert(database_1.schema.users).values(data).returning();
        const user = result[0];
        if (user) {
            return this.getUserById(user.id);
        }
        return user;
    }
    async createAddress(dto) {
        const result = await this.db.insert(database_1.schema.addresses).values(dto).returning();
        return result[0];
    }
    async updateUser(id, data) {
        const result = await this.db
            .update(database_1.schema.users)
            .set(Object.assign(Object.assign({}, data), { updatedAt: new Date() }))
            .where((0, drizzle_orm_1.eq)(database_1.schema.users.id, id))
            .returning();
        if (result[0]) {
            return this.getUserById(id);
        }
        return null;
    }
    async deleteUser(id) {
        const user = await this.getUserById(id);
        await this.db.delete(database_1.schema.users).where((0, drizzle_orm_1.eq)(database_1.schema.users.id, id));
        return user;
    }
    async getTechnicianAverageRating(technicianId) {
        var _a, _b;
        const user = await this.getUserById(technicianId);
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${technicianId} not found`);
        }
        if (user.role !== 'technician') {
            throw new common_1.NotFoundException(`User with ID ${technicianId} is not a technician`);
        }
        const result = await this.db
            .select({
            averageRating: (0, drizzle_orm_1.sql) `COALESCE(AVG(${database_1.schema.feedbacks.rating})::numeric, 0)`,
            totalFeedbacks: (0, drizzle_orm_1.sql) `COUNT(${database_1.schema.feedbacks.id})::int`,
        })
            .from(database_1.schema.bookings)
            .innerJoin(database_1.schema.feedbacks, (0, drizzle_orm_1.eq)(database_1.schema.feedbacks.bookingId, database_1.schema.bookings.id))
            .where((0, drizzle_orm_1.eq)(database_1.schema.bookings.technicianId, technicianId));
        const avgRating = ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.averageRating) ? parseFloat(result[0].averageRating.toString()) : 0;
        const totalFeedbacks = ((_b = result[0]) === null || _b === void 0 ? void 0 : _b.totalFeedbacks) || 0;
        return {
            technicianId,
            averageRating: avgRating,
            totalFeedbacks,
            averageRatingRounded: Math.round(avgRating * 100) / 100,
        };
    }
    async getAllTechnicianRatings() {
        const technicians = await this.db
            .select()
            .from(database_1.schema.users)
            .where((0, drizzle_orm_1.eq)(database_1.schema.users.role, 'technician'));
        const ratings = await Promise.all(technicians.map(async (technician) => {
            var _a, _b;
            const result = await this.db
                .select({
                averageRating: (0, drizzle_orm_1.sql) `COALESCE(AVG(${database_1.schema.feedbacks.rating})::numeric, 0)`,
                totalFeedbacks: (0, drizzle_orm_1.sql) `COUNT(${database_1.schema.feedbacks.id})::int`,
            })
                .from(database_1.schema.bookings)
                .innerJoin(database_1.schema.feedbacks, (0, drizzle_orm_1.eq)(database_1.schema.feedbacks.bookingId, database_1.schema.bookings.id))
                .where((0, drizzle_orm_1.eq)(database_1.schema.bookings.technicianId, technician.id));
            const avgRating = ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.averageRating)
                ? parseFloat(result[0].averageRating.toString())
                : 0;
            const totalFeedbacks = ((_b = result[0]) === null || _b === void 0 ? void 0 : _b.totalFeedbacks) || 0;
            return {
                technicianId: technician.id,
                technicianName: technician.name,
                averageRating: avgRating,
                averageRatingRounded: Math.round(avgRating * 100) / 100,
                totalFeedbacks,
            };
        }));
        return ratings;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DB_PROVIDER)),
    __metadata("design:paramtypes", [Object])
], UsersService);
//# sourceMappingURL=user.service.js.map