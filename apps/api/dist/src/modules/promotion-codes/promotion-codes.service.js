"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
exports.PromotionCodesService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("../../config/database");
const drizzle_orm_1 = require("drizzle-orm");
let PromotionCodesService = class PromotionCodesService {
    async findOne(id, customerId) {
        const result = await database_1.db.query.promotionCodes.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.promotionCodes.id, id),
            with: {
                customerProduct: {
                    columns: { customerId: true },
                },
            },
        });
        if (!result) {
            throw new common_1.NotFoundException(`Promotion code with ID ${id} not found`);
        }
        const customerProduct = result.customerProduct;
        if ((customerProduct === null || customerProduct === void 0 ? void 0 : customerProduct.customerId) !== customerId) {
            throw new common_1.ForbiddenException('You can only view your own promotion codes');
        }
        const { customerProduct: _ } = result, promoCode = __rest(result, ["customerProduct"]);
        return promoCode;
    }
};
exports.PromotionCodesService = PromotionCodesService;
exports.PromotionCodesService = PromotionCodesService = __decorate([
    (0, common_1.Injectable)()
], PromotionCodesService);
//# sourceMappingURL=promotion-codes.service.js.map