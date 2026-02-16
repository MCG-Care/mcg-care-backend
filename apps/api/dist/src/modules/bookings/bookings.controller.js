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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const bookings_service_1 = require("./bookings.service");
const create_booking_dto_1 = require("./dto/create-booking.dto");
const update_booking_dto_1 = require("./dto/update-booking.dto");
const query_bookings_dto_1 = require("./dto/query-bookings.dto");
const availability_query_dto_1 = require("./dto/availability-query.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let BookingsController = class BookingsController {
    constructor(bookingsService) {
        this.bookingsService = bookingsService;
    }
    async create(createBookingDto, images, user) {
        if (user.role !== 'customer') {
            throw new common_1.BadRequestException('Only customers can create bookings');
        }
        if (images && images.length > 0) {
            this.validateImages(images);
        }
        return this.bookingsService.create(user.id, createBookingDto, images);
    }
    async findAll(query, user) {
        return this.bookingsService.findAll(user.id, user.role, query);
    }
    async getAvailability(query, user) {
        if (user.role !== 'customer') {
            throw new common_1.BadRequestException('Only customers can check availability');
        }
        return this.bookingsService.getAvailability(user.id, query);
    }
    async findOne(id, user) {
        return this.bookingsService.findOne(id, user.id, user.role);
    }
    async update(id, updateBookingDto, images, user) {
        if (images && images.length > 0) {
            this.validateImages(images);
        }
        return this.bookingsService.update(id, user.id, user.role, updateBookingDto, images);
    }
    async remove(id, user) {
        return this.bookingsService.remove(id, user.id, user.role);
    }
    async removeImage(bookingId, imageId, user) {
        return this.bookingsService.removeImage(bookingId, imageId, user.id, user.role);
    }
    validateImages(files) {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024;
        for (const file of files) {
            if (!allowedMimeTypes.includes(file.mimetype)) {
                throw new common_1.BadRequestException(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, and WebP images are allowed.`);
            }
            if (file.size > maxSize) {
                throw new common_1.BadRequestException(`File ${file.originalname} is too large. Maximum size is 5MB.`);
            }
        }
    }
};
exports.BookingsController = BookingsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new booking (Customer only)' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', 10)),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_booking_dto_1.CreateBookingDto, Array, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all bookings (filtered by user role)' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_bookings_dto_1.QueryBookingsDto, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('availability'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get available timeslots per day for next 30 days (Customer only)',
        description: 'Returns available time slots for each day where at least one technician from the same district can perform all selected services. ' +
            'Query parameters: airconId (required), serviceIds (required, can be comma-separated or multiple params), addressId (optional), date (optional, YYYY-MM-DD format). ' +
            'If date is provided, returns availability only for that date; otherwise returns 30 days. ' +
            'Example: /bookings/availability?airconId=1&serviceIds=1&serviceIds=2&addressId=3&date=2026-01-20',
    }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [availability_query_dto_1.AvailabilityQueryDto, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "getAvailability", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get booking by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Booking ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update booking',
        description: 'Update booking status, description, or fees. Technicians can optionally attach images (e.g. proof of customer location) when changing status to "inprogress". Send as multipart/form-data with "images" field for image uploads, or application/json for status/description/fees only.',
    }),
    (0, swagger_1.ApiConsumes)('application/json', 'multipart/form-data'),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Booking ID' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', 10)),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_booking_dto_1.UpdateBookingDto, Array, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete booking' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Booking ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)(':bookingId/images/:imageId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove image from booking' }),
    (0, swagger_1.ApiParam)({ name: 'bookingId', description: 'Booking ID' }),
    (0, swagger_1.ApiParam)({ name: 'imageId', description: 'Image ID' }),
    __param(0, (0, common_1.Param)('bookingId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('imageId', common_1.ParseIntPipe)),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "removeImage", null);
exports.BookingsController = BookingsController = __decorate([
    (0, swagger_1.ApiTags)('bookings'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('bookings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [bookings_service_1.BookingsService])
], BookingsController);
//# sourceMappingURL=bookings.controller.js.map