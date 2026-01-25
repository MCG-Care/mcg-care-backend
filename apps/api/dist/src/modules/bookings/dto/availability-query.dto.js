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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityQueryDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class AvailabilityQueryDto {
}
exports.AvailabilityQueryDto = AvailabilityQueryDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], AvailabilityQueryDto.prototype, "airconId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.IsInt)({ each: true }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (Array.isArray(value)) {
            return value.map((id) => {
                const num = typeof id === 'string' ? parseInt(id.trim(), 10) : Number(id);
                return isNaN(num) ? null : num;
            }).filter((id) => id !== null);
        }
        if (typeof value === 'string') {
            if (value.includes(',')) {
                return value.split(',').map((id) => {
                    const num = parseInt(id.trim(), 10);
                    return isNaN(num) ? null : num;
                }).filter((id) => id !== null);
            }
            const num = parseInt(value.trim(), 10);
            return isNaN(num) ? [] : [num];
        }
        const num = Number(value);
        return isNaN(num) ? [] : [num];
    }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Array)
], AvailabilityQueryDto.prototype, "serviceIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], AvailabilityQueryDto.prototype, "addressId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AvailabilityQueryDto.prototype, "date", void 0);
//# sourceMappingURL=availability-query.dto.js.map