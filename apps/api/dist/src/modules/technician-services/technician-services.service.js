"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnicianServicesService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("../../config/database");
const drizzle_orm_1 = require("drizzle-orm");
let TechnicianServicesService = class TechnicianServicesService {
    async assignServices(assignServiceDto) {
        const { technicianId, serviceIds } = assignServiceDto;
        const technician = await database_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.users.id, technicianId),
        });
        if (!technician) {
            throw new common_1.NotFoundException(`Technician with ID ${technicianId} not found`);
        }
        if (technician.role !== 'technician') {
            throw new common_1.BadRequestException(`User with ID ${technicianId} is not a technician`);
        }
        const services = await database_1.db.query.serviceTypes.findMany({
            where: (serviceTypes, { inArray }) => inArray(serviceTypes.id, serviceIds),
        });
        if (services.length !== serviceIds.length) {
            throw new common_1.NotFoundException('One or more service IDs are invalid');
        }
        const existingServices = await database_1.db.query.technicianServices.findMany({
            where: (0, drizzle_orm_1.eq)(database_1.schema.technicianServices.technicianId, technicianId),
        });
        const existingServiceIds = existingServices.map((s) => s.serviceId);
        const newServiceIds = serviceIds.filter((id) => !existingServiceIds.includes(id));
        if (newServiceIds.length === 0) {
            throw new common_1.BadRequestException('All specified services are already assigned to this technician');
        }
        const values = newServiceIds.map((serviceId) => ({
            technicianId,
            serviceId,
        }));
        await database_1.db.insert(database_1.schema.technicianServices).values(values);
        return this.getTechnicianServices(technicianId);
    }
    async getTechnicianServices(technicianId) {
        const technician = await database_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.users.id, technicianId),
        });
        if (!technician) {
            throw new common_1.NotFoundException(`Technician with ID ${technicianId} not found`);
        }
        if (technician.role !== 'technician') {
            throw new common_1.BadRequestException(`User with ID ${technicianId} is not a technician`);
        }
        const technicianServices = await database_1.db.query.technicianServices.findMany({
            where: (0, drizzle_orm_1.eq)(database_1.schema.technicianServices.technicianId, technicianId),
            with: {
                service: true,
            },
        });
        return {
            technicianId,
            technicianName: technician.name,
            services: technicianServices.map((ts) => ts.service),
        };
    }
    async getTechniciansForService(serviceId) {
        const service = await database_1.db.query.serviceTypes.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.serviceTypes.id, serviceId),
        });
        if (!service) {
            throw new common_1.NotFoundException(`Service with ID ${serviceId} not found`);
        }
        const technicianServices = await database_1.db.query.technicianServices.findMany({
            where: (0, drizzle_orm_1.eq)(database_1.schema.technicianServices.serviceId, serviceId),
            with: {
                technician: {
                    with: {
                        address: true,
                    },
                },
            },
        });
        return {
            serviceId,
            serviceName: service.name,
            technicians: technicianServices.map((ts) => ts.technician),
        };
    }
    async removeService(technicianId, serviceId) {
        const technicianService = await database_1.db.query.technicianServices.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.schema.technicianServices.technicianId, technicianId), (0, drizzle_orm_1.eq)(database_1.schema.technicianServices.serviceId, serviceId)),
        });
        if (!technicianService) {
            throw new common_1.NotFoundException(`Service ${serviceId} is not assigned to technician ${technicianId}`);
        }
        await database_1.db
            .delete(database_1.schema.technicianServices)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.schema.technicianServices.technicianId, technicianId), (0, drizzle_orm_1.eq)(database_1.schema.technicianServices.serviceId, serviceId)));
        return { message: 'Service removed from technician successfully' };
    }
    async getAllTechniciansWithServices() {
        const technicians = await database_1.db.query.users.findMany({
            where: (0, drizzle_orm_1.eq)(database_1.schema.users.role, 'technician'),
            with: {
                technicianServices: {
                    with: {
                        service: true,
                    },
                },
                primaryAddress: true,
            },
        });
        return technicians.map((tech) => ({
            id: tech.id,
            name: tech.name,
            email: tech.email,
            phoneNo: tech.phoneNo,
            address: tech.primaryAddress,
            services: tech.technicianServices.map((ts) => ts.service),
        }));
    }
};
exports.TechnicianServicesService = TechnicianServicesService;
exports.TechnicianServicesService = TechnicianServicesService = __decorate([
    (0, common_1.Injectable)()
], TechnicianServicesService);
//# sourceMappingURL=technician-services.service.js.map