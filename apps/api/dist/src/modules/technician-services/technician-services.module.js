"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnicianServicesModule = void 0;
const common_1 = require("@nestjs/common");
const technician_services_service_1 = require("./technician-services.service");
const technician_services_controller_1 = require("./technician-services.controller");
const auth_module_1 = require("../auth/auth.module");
let TechnicianServicesModule = class TechnicianServicesModule {
};
exports.TechnicianServicesModule = TechnicianServicesModule;
exports.TechnicianServicesModule = TechnicianServicesModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule],
        controllers: [technician_services_controller_1.TechnicianServicesController],
        providers: [technician_services_service_1.TechnicianServicesService],
        exports: [technician_services_service_1.TechnicianServicesService],
    })
], TechnicianServicesModule);
//# sourceMappingURL=technician-services.module.js.map