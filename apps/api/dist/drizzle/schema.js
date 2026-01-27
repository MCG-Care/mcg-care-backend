"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maintenanceRemindersRelations = exports.promotionCodesRelations = exports.forumCommentLikesRelations = exports.forumPostLikesRelations = exports.forumPostImagesRelations = exports.forumCommentsRelations = exports.forumPostsRelations = exports.feedbacksRelations = exports.serviceLogsRelations = exports.bookingImagesRelations = exports.bookingServicesRelations = exports.bookingsRelations = exports.technicianServicesRelations = exports.serviceTypesRelations = exports.timeOffRequestsRelations = exports.timeslotsRelations = exports.customerProductsRelations = exports.productImagesRelations = exports.productsRelations = exports.usersRelations = exports.addressesRelations = exports.forumCommentLikes = exports.forumPostLikes = exports.forumPostImages = exports.forumComments = exports.forumPosts = exports.feedbacks = exports.serviceLogs = exports.bookingImages = exports.bookingServices = exports.bookings = exports.maintenanceReminders = exports.promotionCodes = exports.technicianServices = exports.serviceTypes = exports.timeOffRequests = exports.timeslots = exports.customerProducts = exports.productImages = exports.products = exports.users = exports.addresses = exports.timeOffRequestStatusEnum = exports.bookingStatusEnum = exports.productTypeEnum = exports.userRoleEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.userRoleEnum = (0, pg_core_1.pgEnum)('user_role', [
    'customer',
    'technician',
    'admin',
]);
exports.productTypeEnum = (0, pg_core_1.pgEnum)('product_type', [
    'split',
    'window',
    'cassette',
    'portable',
    'central',
]);
exports.bookingStatusEnum = (0, pg_core_1.pgEnum)('booking_status', [
    'pending',
    'inprogress',
    'done',
    'unsuccessful',
]);
exports.timeOffRequestStatusEnum = (0, pg_core_1.pgEnum)('time_off_request_status', [
    'pending',
    'approved',
    'rejected',
]);
exports.addresses = (0, pg_core_1.pgTable)('addresses', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    name: (0, pg_core_1.text)('name'),
    address: (0, pg_core_1.text)('address'),
    township: (0, pg_core_1.text)('township').notNull(),
    city: (0, pg_core_1.text)('city').notNull(),
    district: (0, pg_core_1.text)('district').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    districtIdx: (0, pg_core_1.index)('addresses_district_idx').on(table.district),
    userIdIdx: (0, pg_core_1.index)('addresses_user_id_idx').on(table.userId),
}));
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    email: (0, pg_core_1.text)('email').notNull().unique(),
    password: (0, pg_core_1.text)('password').notNull(),
    phoneNo: (0, pg_core_1.text)('phone_no').notNull(),
    primaryAddressId: (0, pg_core_1.integer)('primary_address_id')
        .references(() => exports.addresses.id, {
        onDelete: 'set null',
    }),
    role: (0, exports.userRoleEnum)('role').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    emailIdx: (0, pg_core_1.uniqueIndex)('users_email_idx').on(table.email),
    roleIdx: (0, pg_core_1.index)('users_role_idx').on(table.role),
}));
exports.products = (0, pg_core_1.pgTable)('products', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    productModel: (0, pg_core_1.text)('product_model').notNull().unique(),
    brand: (0, pg_core_1.text)('brand').notNull(),
    price: (0, pg_core_1.decimal)('price', { precision: 10, scale: 2 }),
    description: (0, pg_core_1.text)('description'),
    capacity: (0, pg_core_1.decimal)('capacity', { precision: 6, scale: 2 }),
    type: (0, exports.productTypeEnum)('type').notNull(),
    energyRating: (0, pg_core_1.integer)('energy_rating'),
    coolingPower: (0, pg_core_1.integer)('cooling_power'),
    refrigerant: (0, pg_core_1.text)('refrigerant'),
    warranty: (0, pg_core_1.integer)('warranty'),
    tagline: (0, pg_core_1.text)('tagline'),
    voltageAverage: (0, pg_core_1.integer)('voltage_average'),
    voltageCount: (0, pg_core_1.integer)('voltage_count'),
    releaseDate: (0, pg_core_1.date)('release_date'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    productModelIdx: (0, pg_core_1.uniqueIndex)('products_product_model_idx').on(table.productModel),
}));
exports.productImages = (0, pg_core_1.pgTable)('product_images', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    productId: (0, pg_core_1.integer)('product_id')
        .notNull()
        .references(() => exports.products.id, { onDelete: 'cascade' }),
    url: (0, pg_core_1.text)('url').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.customerProducts = (0, pg_core_1.pgTable)('customer_products', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    customerId: (0, pg_core_1.integer)('customer_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    productId: (0, pg_core_1.integer)('product_id')
        .notNull()
        .references(() => exports.products.id, { onDelete: 'restrict' }),
    name: (0, pg_core_1.text)('name').notNull(),
    purchaseDate: (0, pg_core_1.date)('purchase_date'),
    qrUrl: (0, pg_core_1.text)('qr_url').unique(),
    purchaseCode: (0, pg_core_1.text)('purchase_code').unique(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    customerIdIdx: (0, pg_core_1.index)('customer_products_customer_id_idx').on(table.customerId),
    productIdIdx: (0, pg_core_1.index)('customer_products_product_id_idx').on(table.productId),
    qrUrlIdx: (0, pg_core_1.uniqueIndex)('customer_products_qr_url_idx').on(table.qrUrl),
    purchaseCodeIdx: (0, pg_core_1.uniqueIndex)('customer_products_purchase_code_idx').on(table.purchaseCode),
}));
exports.timeslots = (0, pg_core_1.pgTable)('timeslots', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    technicianId: (0, pg_core_1.integer)('technician_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    date: (0, pg_core_1.date)('date').notNull(),
    slots: (0, pg_core_1.integer)('slots').array().notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    technicianDateIdx: (0, pg_core_1.uniqueIndex)('timeslots_technician_date_idx').on(table.technicianId, table.date),
    dateIdx: (0, pg_core_1.index)('timeslots_date_idx').on(table.date),
}));
exports.timeOffRequests = (0, pg_core_1.pgTable)('time_off_requests', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    technicianId: (0, pg_core_1.integer)('technician_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    startDate: (0, pg_core_1.date)('start_date').notNull(),
    endDate: (0, pg_core_1.date)('end_date').notNull(),
    startSlot: (0, pg_core_1.integer)('start_slot').notNull(),
    endSlot: (0, pg_core_1.integer)('end_slot').notNull(),
    isFullDay: (0, pg_core_1.boolean)('is_full_day').default(false).notNull(),
    reason: (0, pg_core_1.text)('reason'),
    status: (0, exports.timeOffRequestStatusEnum)('status').default('pending').notNull(),
    reviewerId: (0, pg_core_1.integer)('reviewer_id').references(() => exports.users.id, { onDelete: 'set null' }),
    reviewedAt: (0, pg_core_1.timestamp)('reviewed_at'),
    reviewNote: (0, pg_core_1.text)('review_note'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    technicianIdIdx: (0, pg_core_1.index)('time_off_requests_technician_id_idx').on(table.technicianId),
    statusIdx: (0, pg_core_1.index)('time_off_requests_status_idx').on(table.status),
    dateRangeIdx: (0, pg_core_1.index)('time_off_requests_date_range_idx').on(table.startDate, table.endDate),
}));
exports.serviceTypes = (0, pg_core_1.pgTable)('service_types', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull().unique(),
    description: (0, pg_core_1.text)('description'),
    serviceFee: (0, pg_core_1.decimal)('service_fee', { precision: 10, scale: 2 }).notNull(),
    duration: (0, pg_core_1.integer)('duration').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    nameIdx: (0, pg_core_1.uniqueIndex)('service_types_name_idx').on(table.name),
}));
exports.technicianServices = (0, pg_core_1.pgTable)('technician_services', {
    technicianId: (0, pg_core_1.integer)('technician_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    serviceId: (0, pg_core_1.integer)('service_id')
        .notNull()
        .references(() => exports.serviceTypes.id, { onDelete: 'cascade' }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => ({
    pk: (0, pg_core_1.primaryKey)({ columns: [table.technicianId, table.serviceId] }),
    technicianIdIdx: (0, pg_core_1.index)('technician_services_technician_id_idx').on(table.technicianId),
    serviceIdIdx: (0, pg_core_1.index)('technician_services_service_id_idx').on(table.serviceId),
}));
exports.promotionCodes = (0, pg_core_1.pgTable)('promotion_codes', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    customerProductId: (0, pg_core_1.integer)('customer_product_id')
        .notNull()
        .references(() => exports.customerProducts.id, { onDelete: 'cascade' }),
    serviceTypeId: (0, pg_core_1.integer)('service_type_id')
        .notNull()
        .references(() => exports.serviceTypes.id, { onDelete: 'cascade' }),
    code: (0, pg_core_1.text)('code').notNull().unique(),
    discountPercentage: (0, pg_core_1.integer)('discount_percentage').notNull(),
    expiresAt: (0, pg_core_1.date)('expires_at').notNull(),
    isUsed: (0, pg_core_1.boolean)('is_used').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    codeIdx: (0, pg_core_1.uniqueIndex)('promotion_codes_code_idx').on(table.code),
    customerProductIdIdx: (0, pg_core_1.index)('promotion_codes_customer_product_id_idx').on(table.customerProductId),
    serviceTypeIdIdx: (0, pg_core_1.index)('promotion_codes_service_type_id_idx').on(table.serviceTypeId),
    isUsedIdx: (0, pg_core_1.index)('promotion_codes_is_used_idx').on(table.isUsed),
}));
exports.maintenanceReminders = (0, pg_core_1.pgTable)('maintenance_reminders', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    customerId: (0, pg_core_1.integer)('customer_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    customerProductId: (0, pg_core_1.integer)('customer_product_id')
        .notNull()
        .references(() => exports.customerProducts.id, { onDelete: 'cascade' }),
    serviceTypeId: (0, pg_core_1.integer)('service_type_id')
        .notNull()
        .references(() => exports.serviceTypes.id, { onDelete: 'cascade' }),
    promotionCodeId: (0, pg_core_1.integer)('promotion_code_id')
        .notNull()
        .references(() => exports.promotionCodes.id, { onDelete: 'cascade' }),
    reminderDate: (0, pg_core_1.date)('reminder_date').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    customerIdIdx: (0, pg_core_1.index)('maintenance_reminders_customer_id_idx').on(table.customerId),
    customerProductIdIdx: (0, pg_core_1.index)('maintenance_reminders_customer_product_id_idx').on(table.customerProductId),
    reminderDateIdx: (0, pg_core_1.index)('maintenance_reminders_reminder_date_idx').on(table.reminderDate),
}));
exports.bookings = (0, pg_core_1.pgTable)('bookings', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    technicianId: (0, pg_core_1.integer)('technician_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    airconId: (0, pg_core_1.integer)('aircon_id')
        .notNull()
        .references(() => exports.customerProducts.id, { onDelete: 'cascade' }),
    addressId: (0, pg_core_1.integer)('address_id')
        .references(() => exports.addresses.id, { onDelete: 'set null' }),
    promoCodeId: (0, pg_core_1.integer)('promo_code_id').references(() => exports.promotionCodes.id, {
        onDelete: 'set null',
    }),
    bookingOnDate: (0, pg_core_1.date)('booking_on_date').notNull(),
    bookingForDate: (0, pg_core_1.date)('booking_for_date').notNull(),
    bookingTime: (0, pg_core_1.time)('booking_time').notNull(),
    duration: (0, pg_core_1.integer)('duration').notNull(),
    fees: (0, pg_core_1.decimal)('fees', { precision: 10, scale: 2 }).notNull(),
    status: (0, exports.bookingStatusEnum)('status').default('pending').notNull(),
    description: (0, pg_core_1.text)('description'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    airconIdIdx: (0, pg_core_1.index)('bookings_aircon_id_idx').on(table.airconId),
    technicianIdIdx: (0, pg_core_1.index)('bookings_technician_id_idx').on(table.technicianId),
    statusIdx: (0, pg_core_1.index)('bookings_status_idx').on(table.status),
    bookingForDateTimeIdx: (0, pg_core_1.index)('bookings_booking_for_date_time_idx').on(table.bookingForDate, table.bookingTime),
    bookingForDateTechnicianIdx: (0, pg_core_1.index)('bookings_booking_for_date_technician_idx').on(table.bookingForDate, table.technicianId),
    promoCodeIdIdx: (0, pg_core_1.index)('bookings_promo_code_id_idx').on(table.promoCodeId),
}));
exports.bookingServices = (0, pg_core_1.pgTable)('booking_services', {
    bookingId: (0, pg_core_1.integer)('booking_id')
        .notNull()
        .references(() => exports.bookings.id, { onDelete: 'cascade' }),
    serviceId: (0, pg_core_1.integer)('service_id')
        .notNull()
        .references(() => exports.serviceTypes.id, { onDelete: 'restrict' }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => ({
    pk: (0, pg_core_1.primaryKey)({ columns: [table.bookingId, table.serviceId] }),
}));
exports.bookingImages = (0, pg_core_1.pgTable)('booking_images', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    bookingId: (0, pg_core_1.integer)('booking_id')
        .notNull()
        .references(() => exports.bookings.id, { onDelete: 'cascade' }),
    url: (0, pg_core_1.text)('url').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.serviceLogs = (0, pg_core_1.pgTable)('service_logs', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    bookingId: (0, pg_core_1.integer)('booking_id')
        .notNull()
        .unique()
        .references(() => exports.bookings.id, { onDelete: 'cascade' }),
    note: (0, pg_core_1.text)('note').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => ({
    bookingIdIdx: (0, pg_core_1.uniqueIndex)('service_logs_booking_id_idx').on(table.bookingId),
}));
exports.feedbacks = (0, pg_core_1.pgTable)('feedbacks', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    bookingId: (0, pg_core_1.integer)('booking_id')
        .notNull()
        .unique()
        .references(() => exports.bookings.id, { onDelete: 'cascade' }),
    rating: (0, pg_core_1.integer)('rating').notNull(),
    satisfaction: (0, pg_core_1.integer)('satisfaction'),
    issueResolved: (0, pg_core_1.boolean)('issue_resolved'),
    note: (0, pg_core_1.text)('note'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => ({
    bookingIdIdx: (0, pg_core_1.uniqueIndex)('feedbacks_booking_id_idx').on(table.bookingId),
}));
exports.forumPosts = (0, pg_core_1.pgTable)('forum_posts', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    title: (0, pg_core_1.text)('title').notNull(),
    content: (0, pg_core_1.text)('content').notNull(),
    likeCount: (0, pg_core_1.integer)('like_count').default(0).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
}, (table) => ({
    userIdIdx: (0, pg_core_1.index)('forum_posts_user_id_idx').on(table.userId),
}));
exports.forumComments = (0, pg_core_1.pgTable)('forum_comments', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    postId: (0, pg_core_1.integer)('post_id')
        .notNull()
        .references(() => exports.forumPosts.id, { onDelete: 'cascade' }),
    userId: (0, pg_core_1.integer)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    content: (0, pg_core_1.text)('content').notNull(),
    likeCount: (0, pg_core_1.integer)('like_count').default(0).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    postIdIdx: (0, pg_core_1.index)('forum_comments_post_id_idx').on(table.postId),
}));
exports.forumPostImages = (0, pg_core_1.pgTable)('forum_post_images', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    postId: (0, pg_core_1.integer)('post_id')
        .notNull()
        .references(() => exports.forumPosts.id, { onDelete: 'cascade' }),
    url: (0, pg_core_1.text)('url').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.forumPostLikes = (0, pg_core_1.pgTable)('forum_post_likes', {
    userId: (0, pg_core_1.integer)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    postId: (0, pg_core_1.integer)('post_id')
        .notNull()
        .references(() => exports.forumPosts.id, { onDelete: 'cascade' }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => ({
    pk: (0, pg_core_1.primaryKey)({ columns: [table.userId, table.postId] }),
    userIdIdx: (0, pg_core_1.index)('forum_post_likes_user_id_idx').on(table.userId),
    postIdIdx: (0, pg_core_1.index)('forum_post_likes_post_id_idx').on(table.postId),
}));
exports.forumCommentLikes = (0, pg_core_1.pgTable)('forum_comment_likes', {
    userId: (0, pg_core_1.integer)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    commentId: (0, pg_core_1.integer)('comment_id')
        .notNull()
        .references(() => exports.forumComments.id, { onDelete: 'cascade' }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => ({
    pk: (0, pg_core_1.primaryKey)({ columns: [table.userId, table.commentId] }),
    userIdIdx: (0, pg_core_1.index)('forum_comment_likes_user_id_idx').on(table.userId),
    commentIdIdx: (0, pg_core_1.index)('forum_comment_likes_comment_id_idx').on(table.commentId),
}));
exports.addressesRelations = (0, drizzle_orm_1.relations)(exports.addresses, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.addresses.userId],
        references: [exports.users.id],
    }),
}));
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ one, many }) => ({
    primaryAddress: one(exports.addresses, {
        fields: [exports.users.primaryAddressId],
        references: [exports.addresses.id],
    }),
    addresses: many(exports.addresses),
    customerProducts: many(exports.customerProducts),
    bookingsAsTechnician: many(exports.bookings),
    technicianServices: many(exports.technicianServices),
    timeslots: many(exports.timeslots),
    timeOffRequestsAsTechnician: many(exports.timeOffRequests, { relationName: 'technicianTimeOffRequests' }),
    timeOffRequestsAsReviewer: many(exports.timeOffRequests, { relationName: 'reviewedTimeOffRequests' }),
    maintenanceReminders: many(exports.maintenanceReminders),
    forumPosts: many(exports.forumPosts),
    forumComments: many(exports.forumComments),
    forumPostLikes: many(exports.forumPostLikes),
    forumCommentLikes: many(exports.forumCommentLikes),
}));
exports.productsRelations = (0, drizzle_orm_1.relations)(exports.products, ({ many }) => ({
    productImages: many(exports.productImages),
    customerProducts: many(exports.customerProducts),
}));
exports.productImagesRelations = (0, drizzle_orm_1.relations)(exports.productImages, ({ one }) => ({
    product: one(exports.products, {
        fields: [exports.productImages.productId],
        references: [exports.products.id],
    }),
}));
exports.customerProductsRelations = (0, drizzle_orm_1.relations)(exports.customerProducts, ({ one, many }) => ({
    customer: one(exports.users, {
        fields: [exports.customerProducts.customerId],
        references: [exports.users.id],
    }),
    product: one(exports.products, {
        fields: [exports.customerProducts.productId],
        references: [exports.products.id],
    }),
    bookings: many(exports.bookings),
    promotionCodes: many(exports.promotionCodes),
    maintenanceReminders: many(exports.maintenanceReminders),
}));
exports.timeslotsRelations = (0, drizzle_orm_1.relations)(exports.timeslots, ({ one }) => ({
    technician: one(exports.users, {
        fields: [exports.timeslots.technicianId],
        references: [exports.users.id],
    }),
}));
exports.timeOffRequestsRelations = (0, drizzle_orm_1.relations)(exports.timeOffRequests, ({ one }) => ({
    technician: one(exports.users, {
        fields: [exports.timeOffRequests.technicianId],
        references: [exports.users.id],
        relationName: 'technicianTimeOffRequests',
    }),
    reviewer: one(exports.users, {
        fields: [exports.timeOffRequests.reviewerId],
        references: [exports.users.id],
        relationName: 'reviewedTimeOffRequests',
    }),
}));
exports.serviceTypesRelations = (0, drizzle_orm_1.relations)(exports.serviceTypes, ({ many }) => ({
    technicianServices: many(exports.technicianServices),
    bookingServices: many(exports.bookingServices),
    promotionCodes: many(exports.promotionCodes),
    maintenanceReminders: many(exports.maintenanceReminders),
}));
exports.technicianServicesRelations = (0, drizzle_orm_1.relations)(exports.technicianServices, ({ one }) => ({
    technician: one(exports.users, {
        fields: [exports.technicianServices.technicianId],
        references: [exports.users.id],
    }),
    service: one(exports.serviceTypes, {
        fields: [exports.technicianServices.serviceId],
        references: [exports.serviceTypes.id],
    }),
}));
exports.bookingsRelations = (0, drizzle_orm_1.relations)(exports.bookings, ({ one, many }) => ({
    technician: one(exports.users, {
        fields: [exports.bookings.technicianId],
        references: [exports.users.id],
    }),
    aircon: one(exports.customerProducts, {
        fields: [exports.bookings.airconId],
        references: [exports.customerProducts.id],
    }),
    promoCode: one(exports.promotionCodes, {
        fields: [exports.bookings.promoCodeId],
        references: [exports.promotionCodes.id],
    }),
    bookingServices: many(exports.bookingServices),
    bookingImages: many(exports.bookingImages),
    serviceLog: one(exports.serviceLogs),
    feedback: one(exports.feedbacks),
}));
exports.bookingServicesRelations = (0, drizzle_orm_1.relations)(exports.bookingServices, ({ one }) => ({
    booking: one(exports.bookings, {
        fields: [exports.bookingServices.bookingId],
        references: [exports.bookings.id],
    }),
    service: one(exports.serviceTypes, {
        fields: [exports.bookingServices.serviceId],
        references: [exports.serviceTypes.id],
    }),
}));
exports.bookingImagesRelations = (0, drizzle_orm_1.relations)(exports.bookingImages, ({ one }) => ({
    booking: one(exports.bookings, {
        fields: [exports.bookingImages.bookingId],
        references: [exports.bookings.id],
    }),
}));
exports.serviceLogsRelations = (0, drizzle_orm_1.relations)(exports.serviceLogs, ({ one }) => ({
    booking: one(exports.bookings, {
        fields: [exports.serviceLogs.bookingId],
        references: [exports.bookings.id],
    }),
}));
exports.feedbacksRelations = (0, drizzle_orm_1.relations)(exports.feedbacks, ({ one }) => ({
    booking: one(exports.bookings, {
        fields: [exports.feedbacks.bookingId],
        references: [exports.bookings.id],
    }),
}));
exports.forumPostsRelations = (0, drizzle_orm_1.relations)(exports.forumPosts, ({ one, many }) => ({
    user: one(exports.users, {
        fields: [exports.forumPosts.userId],
        references: [exports.users.id],
    }),
    comments: many(exports.forumComments),
    images: many(exports.forumPostImages),
    likes: many(exports.forumPostLikes),
}));
exports.forumCommentsRelations = (0, drizzle_orm_1.relations)(exports.forumComments, ({ one, many }) => ({
    post: one(exports.forumPosts, {
        fields: [exports.forumComments.postId],
        references: [exports.forumPosts.id],
    }),
    user: one(exports.users, {
        fields: [exports.forumComments.userId],
        references: [exports.users.id],
    }),
    likes: many(exports.forumCommentLikes),
}));
exports.forumPostImagesRelations = (0, drizzle_orm_1.relations)(exports.forumPostImages, ({ one }) => ({
    post: one(exports.forumPosts, {
        fields: [exports.forumPostImages.postId],
        references: [exports.forumPosts.id],
    }),
}));
exports.forumPostLikesRelations = (0, drizzle_orm_1.relations)(exports.forumPostLikes, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.forumPostLikes.userId],
        references: [exports.users.id],
    }),
    post: one(exports.forumPosts, {
        fields: [exports.forumPostLikes.postId],
        references: [exports.forumPosts.id],
    }),
}));
exports.forumCommentLikesRelations = (0, drizzle_orm_1.relations)(exports.forumCommentLikes, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.forumCommentLikes.userId],
        references: [exports.users.id],
    }),
    comment: one(exports.forumComments, {
        fields: [exports.forumCommentLikes.commentId],
        references: [exports.forumComments.id],
    }),
}));
exports.promotionCodesRelations = (0, drizzle_orm_1.relations)(exports.promotionCodes, ({ one, many }) => ({
    customerProduct: one(exports.customerProducts, {
        fields: [exports.promotionCodes.customerProductId],
        references: [exports.customerProducts.id],
    }),
    serviceType: one(exports.serviceTypes, {
        fields: [exports.promotionCodes.serviceTypeId],
        references: [exports.serviceTypes.id],
    }),
    maintenanceReminder: one(exports.maintenanceReminders),
    bookings: many(exports.bookings),
}));
exports.maintenanceRemindersRelations = (0, drizzle_orm_1.relations)(exports.maintenanceReminders, ({ one }) => ({
    customer: one(exports.users, {
        fields: [exports.maintenanceReminders.customerId],
        references: [exports.users.id],
    }),
    customerProduct: one(exports.customerProducts, {
        fields: [exports.maintenanceReminders.customerProductId],
        references: [exports.customerProducts.id],
    }),
    serviceType: one(exports.serviceTypes, {
        fields: [exports.maintenanceReminders.serviceTypeId],
        references: [exports.serviceTypes.id],
    }),
    promotionCode: one(exports.promotionCodes, {
        fields: [exports.maintenanceReminders.promotionCodeId],
        references: [exports.promotionCodes.id],
    }),
}));
//# sourceMappingURL=schema.js.map