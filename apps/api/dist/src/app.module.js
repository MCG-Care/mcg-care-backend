"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const user_module_1 = require("./modules/users/user.module");
const auth_module_1 = require("./modules/auth/auth.module");
const products_module_1 = require("./modules/products/products.module");
const forum_module_1 = require("./modules/forum/forum.module");
const customer_products_module_1 = require("./modules/customer-products/customer-products.module");
const service_types_module_1 = require("./modules/service-types/service-types.module");
const technician_services_module_1 = require("./modules/technician-services/technician-services.module");
const timeslots_module_1 = require("./modules/timeslots/timeslots.module");
const bookings_module_1 = require("./modules/bookings/bookings.module");
const service_logs_module_1 = require("./modules/service-logs/service-logs.module");
const feedbacks_module_1 = require("./modules/feedbacks/feedbacks.module");
const maintenance_reminders_module_1 = require("./modules/maintenance-reminders/maintenance-reminders.module");
const database_module_1 = require("./config/database.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            schedule_1.ScheduleModule.forRoot(),
            auth_module_1.AuthModule,
            database_module_1.DatabaseModule,
            user_module_1.UsersModule,
            products_module_1.ProductsModule,
            forum_module_1.ForumModule,
            customer_products_module_1.CustomerProductsModule,
            service_types_module_1.ServiceTypesModule,
            technician_services_module_1.TechnicianServicesModule,
            timeslots_module_1.TimeslotsModule,
            bookings_module_1.BookingsModule,
            service_logs_module_1.ServiceLogsModule,
            feedbacks_module_1.FeedbacksModule,
            maintenance_reminders_module_1.MaintenanceRemindersModule,
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map