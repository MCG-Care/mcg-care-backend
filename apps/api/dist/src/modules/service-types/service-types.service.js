"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceTypesService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("../../config/database");
const drizzle_orm_1 = require("drizzle-orm");
let ServiceTypesService = class ServiceTypesService {
    async create(createServiceTypeDto) {
        var _a, _b;
        const existingService = await database_1.db.query.serviceTypes.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.serviceTypes.name, createServiceTypeDto.name),
        });
        if (existingService) {
            throw new common_1.BadRequestException(`Service type with name "${createServiceTypeDto.name}" already exists`);
        }
        const [newServiceType] = await database_1.db
            .insert(database_1.schema.serviceTypes)
            .values({
            name: createServiceTypeDto.name,
            description: createServiceTypeDto.description,
            serviceFee: createServiceTypeDto.serviceFee.toString(),
            duration: createServiceTypeDto.duration,
            generatesReminder: (_a = createServiceTypeDto.generatesReminder) !== null && _a !== void 0 ? _a : false,
            reminderIntervalMonths: createServiceTypeDto.generatesReminder
                ? ((_b = createServiceTypeDto.reminderIntervalMonths) !== null && _b !== void 0 ? _b : 6)
                : null,
        })
            .returning();
        return newServiceType;
    }
    async findAll(query) {
        const { page = 1, limit = 30, search } = query;
        const offset = (page - 1) * limit;
        const whereCondition = search
            ? (0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(database_1.schema.serviceTypes.name, `%${search}%`), (0, drizzle_orm_1.ilike)(database_1.schema.serviceTypes.description, `%${search}%`))
            : undefined;
        const [{ count }] = await database_1.db
            .select({ count: (0, drizzle_orm_1.sql) `cast(count(*) as int)` })
            .from(database_1.schema.serviceTypes)
            .where(whereCondition);
        const serviceTypes = await database_1.db.query.serviceTypes.findMany({
            where: whereCondition,
            limit,
            offset,
            orderBy: [(0, drizzle_orm_1.desc)(database_1.schema.serviceTypes.createdAt)],
        });
        return {
            data: serviceTypes,
            pagination: {
                page,
                limit,
                total: count,
                totalPages: Math.ceil(count / limit),
            },
        };
    }
    async findOne(id) {
        const serviceType = await database_1.db.query.serviceTypes.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.serviceTypes.id, id),
        });
        if (!serviceType) {
            throw new common_1.NotFoundException(`Service type with ID ${id} not found`);
        }
        return serviceType;
    }
    async update(id, updateServiceTypeDto) {
        var _a, _b;
        await this.findOne(id);
        if (updateServiceTypeDto.name) {
            const duplicateService = await database_1.db.query.serviceTypes.findFirst({
                where: (0, drizzle_orm_1.eq)(database_1.schema.serviceTypes.name, updateServiceTypeDto.name),
            });
            if (duplicateService && duplicateService.id !== id) {
                throw new common_1.BadRequestException(`Service type with name "${updateServiceTypeDto.name}" already exists`);
            }
        }
        const updateData = Object.assign(Object.assign({}, updateServiceTypeDto), { serviceFee: (_a = updateServiceTypeDto.serviceFee) === null || _a === void 0 ? void 0 : _a.toString(), updatedAt: new Date() });
        if (updateServiceTypeDto.generatesReminder !== undefined) {
            updateData.generatesReminder = updateServiceTypeDto.generatesReminder;
            updateData.reminderIntervalMonths = updateServiceTypeDto.generatesReminder
                ? ((_b = updateServiceTypeDto.reminderIntervalMonths) !== null && _b !== void 0 ? _b : 6)
                : null;
        }
        else if (updateServiceTypeDto.reminderIntervalMonths !== undefined) {
            updateData.reminderIntervalMonths = updateServiceTypeDto.reminderIntervalMonths;
        }
        const [updatedServiceType] = await database_1.db
            .update(database_1.schema.serviceTypes)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(database_1.schema.serviceTypes.id, id))
            .returning();
        return updatedServiceType;
    }
    async remove(id) {
        await this.findOne(id);
        await database_1.db.delete(database_1.schema.serviceTypes).where((0, drizzle_orm_1.eq)(database_1.schema.serviceTypes.id, id));
        return { message: 'Service type deleted successfully' };
    }
};
exports.ServiceTypesService = ServiceTypesService;
exports.ServiceTypesService = ServiceTypesService = __decorate([
    (0, common_1.Injectable)()
], ServiceTypesService);
//# sourceMappingURL=service-types.service.js.map