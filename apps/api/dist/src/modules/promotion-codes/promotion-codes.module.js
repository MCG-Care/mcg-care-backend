"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotionCodesModule = void 0;
const common_1 = require("@nestjs/common");
const promotion_codes_controller_1 = require("./promotion-codes.controller");
const promotion_codes_service_1 = require("./promotion-codes.service");
let PromotionCodesModule = class PromotionCodesModule {
};
exports.PromotionCodesModule = PromotionCodesModule;
exports.PromotionCodesModule = PromotionCodesModule = __decorate([
    (0, common_1.Module)({
        controllers: [promotion_codes_controller_1.PromotionCodesController],
        providers: [promotion_codes_service_1.PromotionCodesService],
    })
], PromotionCodesModule);
//# sourceMappingURL=promotion-codes.module.js.map