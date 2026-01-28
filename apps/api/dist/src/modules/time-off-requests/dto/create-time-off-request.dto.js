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
exports.CreateTimeOffRequestDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateTimeOffRequestDto {
}
exports.CreateTimeOffRequestDto = CreateTimeOffRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Start date of time off (YYYY-MM-DD)',
        example: '2026-01-27',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateTimeOffRequestDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'End date of time off (YYYY-MM-DD)',
        example: '2026-01-29',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateTimeOffRequestDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Starting hour slot (9-16)',
        example: 9,
        minimum: 9,
        maximum: 16,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(9),
    (0, class_validator_1.Max)(16),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateTimeOffRequestDto.prototype, "startSlot", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Ending hour slot (9-16)',
        example: 16,
        minimum: 9,
        maximum: 16,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(9),
    (0, class_validator_1.Max)(16),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateTimeOffRequestDto.prototype, "endSlot", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether this is a full day request (9am-4pm)',
        example: true,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Type)(() => Boolean),
    __metadata("design:type", Boolean)
], CreateTimeOffRequestDto.prototype, "isFullDay", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Reason for time off request',
        example: 'Personal appointment',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTimeOffRequestDto.prototype, "reason", void 0);
//# sourceMappingURL=create-time-off-request.dto.js.map