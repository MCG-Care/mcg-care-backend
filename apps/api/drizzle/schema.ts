import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  pgEnum,
  date,
  decimal,
  boolean,
  time,
  uniqueIndex,
  index,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================
// ENUMS
// ============================================

export const userRoleEnum = pgEnum('user_role', [
  'customer',
  'technician',
  'admin',
]);

export const productTypeEnum = pgEnum('product_type', [
  'split',
  'window',
  'cassette',
  'portable',
  'central',
]);

export const bookingStatusEnum = pgEnum('booking_status', [
  'pending',
  'inprogress',
  'done',
  'unsuccessful',
]);

export const timeOffRequestStatusEnum = pgEnum('time_off_request_status', [
  'pending',
  'approved',
  'rejected',
]);

// ============================================
// TABLES
// ============================================

// Addresses Table
// Note: Circular reference with users table - TypeScript errors are expected but runtime works fine
// @ts-ignore - Circular reference with users table (defined below). Drizzle handles this correctly at runtime.
export const addresses = pgTable(
  'addresses',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      // @ts-ignore - Circular reference: users is defined below, but Drizzle handles this at runtime
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name'), // Optional nickname for the address (e.g., "Home", "Office")
    address: text('address'),
    township: text('township').notNull(),
    city: text('city').notNull(),
    district: text('district').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    districtIdx: index('addresses_district_idx').on(table.district),
    userIdIdx: index('addresses_user_id_idx').on(table.userId),
  }),
);

// Users Table
// @ts-ignore - Circular reference with addresses table (defined above). Drizzle handles this correctly at runtime.
export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    phoneNo: text('phone_no').notNull(),
    primaryAddressId: integer('primary_address_id')
      // @ts-ignore - Circular reference: addresses is defined above, but Drizzle handles this at runtime
      .references(() => addresses.id, {
        onDelete: 'set null',
      }),
    role: userRoleEnum('role').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex('users_email_idx').on(table.email),
    roleIdx: index('users_role_idx').on(table.role),
  }),
);

// Products Table
export const products = pgTable(
  'products',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    productModel: text('product_model').notNull().unique(),
    brand: text('brand').notNull(),
    price: decimal('price', { precision: 10, scale: 2 }),
    description: text('description'),
    capacity: decimal('capacity', { precision: 6, scale: 2 }),
    type: productTypeEnum('type').notNull(),
    energyRating: integer('energy_rating'),
    coolingPower: integer('cooling_power'),
    refrigerant: text('refrigerant'),
    warranty: integer('warranty'), // in years
    tagline: text('tagline'),
    voltageAverage: integer('voltage_average'),
    voltageCount: integer('voltage_count'),
    releaseDate: date('release_date'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    productModelIdx: uniqueIndex('products_product_model_idx').on(
      table.productModel,
    ),
  }),
);

// Product Images Table
export const productImages = pgTable('product_images', {
  id: serial('id').primaryKey(),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Customer Products (Registered Aircons) Table
export const customerProducts = pgTable(
  'customer_products',
  {
    id: serial('id').primaryKey(),
    customerId: integer('customer_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'restrict' }),
    name: text('name').notNull(), // nickname like "bedroom aircon"
    purchaseDate: date('purchase_date'),
    qrUrl: text('qr_url').unique(),
    purchaseCode: text('purchase_code').unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    customerIdIdx: index('customer_products_customer_id_idx').on(
      table.customerId,
    ),
    productIdIdx: index('customer_products_product_id_idx').on(table.productId),
    qrUrlIdx: uniqueIndex('customer_products_qr_url_idx').on(table.qrUrl),
    purchaseCodeIdx: uniqueIndex('customer_products_purchase_code_idx').on(
      table.purchaseCode,
    ),
  }),
);

// Timeslots Table (Technician Availability)
export const timeslots = pgTable(
  'timeslots',
  {
    id: serial('id').primaryKey(),
    technicianId: integer('technician_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    slots: integer('slots').array().notNull(), // Array of available hours [9,10,11,12,13,14,15,16]
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    technicianDateIdx: uniqueIndex('timeslots_technician_date_idx').on(
      table.technicianId,
      table.date,
    ),
    dateIdx: index('timeslots_date_idx').on(table.date),
  }),
);

// Time Off Requests Table (Technician requests to block off time)
export const timeOffRequests = pgTable(
  'time_off_requests',
  {
    id: serial('id').primaryKey(),
    technicianId: integer('technician_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    startDate: date('start_date').notNull(), // Start date of time off (YYYY-MM-DD)
    endDate: date('end_date').notNull(), // End date of time off (YYYY-MM-DD)
    startSlot: integer('start_slot').notNull(), // Starting hour (e.g., 9 for 9am)
    endSlot: integer('end_slot').notNull(), // Ending hour (e.g., 16 for 4pm, or 12 for 12pm)
    isFullDay: boolean('is_full_day').default(false).notNull(), // True if blocking entire day (9-16)
    reason: text('reason'), // Optional reason for time off
    status: timeOffRequestStatusEnum('status').default('pending').notNull(),
    reviewerId: integer('reviewer_id').references(() => users.id, { onDelete: 'set null' }), // Admin who reviewed the request
    reviewedAt: timestamp('reviewed_at'), // When the request was reviewed
    reviewNote: text('review_note'), // Optional note from admin
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    technicianIdIdx: index('time_off_requests_technician_id_idx').on(table.technicianId),
    statusIdx: index('time_off_requests_status_idx').on(table.status),
    dateRangeIdx: index('time_off_requests_date_range_idx').on(table.startDate, table.endDate),
  }),
);

// Service Types Table
export const serviceTypes = pgTable(
  'service_types',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull().unique(),
    description: text('description'),
    serviceFee: decimal('service_fee', { precision: 10, scale: 2 }).notNull(),
    duration: integer('duration').notNull(), // in minutes
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    nameIdx: uniqueIndex('service_types_name_idx').on(table.name),
  }),
);

// Technician Services Table (Which services a technician can perform)
export const technicianServices = pgTable(
  'technician_services',
  {
    technicianId: integer('technician_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    serviceId: integer('service_id')
      .notNull()
      .references(() => serviceTypes.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.technicianId, table.serviceId] }),
    technicianIdIdx: index('technician_services_technician_id_idx').on(
      table.technicianId,
    ),
    serviceIdIdx: index('technician_services_service_id_idx').on(
      table.serviceId,
    ),
  }),
);

// Promotion Codes Table
export const promotionCodes = pgTable(
  'promotion_codes',
  {
    id: serial('id').primaryKey(),
    customerProductId: integer('customer_product_id')
      .notNull()
      .references(() => customerProducts.id, { onDelete: 'cascade' }),
    serviceTypeId: integer('service_type_id')
      .notNull()
      .references(() => serviceTypes.id, { onDelete: 'cascade' }),
    code: text('code').notNull().unique(),
    discountPercentage: integer('discount_percentage').notNull(), // 5-15%
    expiresAt: date('expires_at').notNull(),
    isUsed: boolean('is_used').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    codeIdx: uniqueIndex('promotion_codes_code_idx').on(table.code),
    customerProductIdIdx: index('promotion_codes_customer_product_id_idx').on(
      table.customerProductId,
    ),
    serviceTypeIdIdx: index('promotion_codes_service_type_id_idx').on(
      table.serviceTypeId,
    ),
    isUsedIdx: index('promotion_codes_is_used_idx').on(table.isUsed),
  }),
);

// Maintenance Reminders Table
export const maintenanceReminders = pgTable(
  'maintenance_reminders',
  {
    id: serial('id').primaryKey(),
    customerId: integer('customer_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    customerProductId: integer('customer_product_id')
      .notNull()
      .references(() => customerProducts.id, { onDelete: 'cascade' }),
    serviceTypeId: integer('service_type_id')
      .notNull()
      .references(() => serviceTypes.id, { onDelete: 'cascade' }),
    promotionCodeId: integer('promotion_code_id')
      .notNull()
      .references(() => promotionCodes.id, { onDelete: 'cascade' }),
    reminderDate: date('reminder_date').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    customerIdIdx: index('maintenance_reminders_customer_id_idx').on(
      table.customerId,
    ),
    customerProductIdIdx: index('maintenance_reminders_customer_product_id_idx').on(
      table.customerProductId,
    ),
    reminderDateIdx: index('maintenance_reminders_reminder_date_idx').on(
      table.reminderDate,
    ),
  }),
);

// Bookings Table
export const bookings = pgTable(
  'bookings',
  {
    id: serial('id').primaryKey(),
    technicianId: integer('technician_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    airconId: integer('aircon_id')
      .notNull()
      .references(() => customerProducts.id, { onDelete: 'cascade' }),
    addressId: integer('address_id')
      // @ts-ignore - Circular reference: addresses is defined above, but Drizzle handles this at runtime
      .references(() => addresses.id, { onDelete: 'set null' }), // Address used for this booking (optional - null means primary address was used)
    promoCodeId: integer('promo_code_id').references(() => promotionCodes.id, {
      onDelete: 'set null',
    }), // Applied promotion code (optional)
    bookingOnDate: date('booking_on_date').notNull(), // When the booking was made
    bookingForDate: date('booking_for_date').notNull(), // When the service is scheduled
    bookingTime: time('booking_time').notNull(), // Start time of service
    duration: integer('duration').notNull(), // in minutes
    fees: decimal('fees', { precision: 10, scale: 2 }).notNull(),
    status: bookingStatusEnum('status').default('pending').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    airconIdIdx: index('bookings_aircon_id_idx').on(table.airconId),
    technicianIdIdx: index('bookings_technician_id_idx').on(table.technicianId),
    statusIdx: index('bookings_status_idx').on(table.status),
    bookingForDateTimeIdx: index('bookings_booking_for_date_time_idx').on(
      table.bookingForDate,
      table.bookingTime,
    ),
    bookingForDateTechnicianIdx: index(
      'bookings_booking_for_date_technician_idx',
    ).on(table.bookingForDate, table.technicianId),
    promoCodeIdIdx: index('bookings_promo_code_id_idx').on(table.promoCodeId),
  }),
);

// Booking Services Table (Service types requested in a booking)
export const bookingServices = pgTable(
  'booking_services',
  {
    bookingId: integer('booking_id')
      .notNull()
      .references(() => bookings.id, { onDelete: 'cascade' }),
    serviceId: integer('service_id')
      .notNull()
      .references(() => serviceTypes.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.bookingId, table.serviceId] }),
  }),
);

// Booking Images Table
export const bookingImages = pgTable('booking_images', {
  id: serial('id').primaryKey(),
  bookingId: integer('booking_id')
    .notNull()
    .references(() => bookings.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Service Logs Table (Notes written by technician)
export const serviceLogs = pgTable(
  'service_logs',
  {
    id: serial('id').primaryKey(),
    bookingId: integer('booking_id')
      .notNull()
      .unique()
      .references(() => bookings.id, { onDelete: 'cascade' }),
    note: text('note').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    bookingIdIdx: uniqueIndex('service_logs_booking_id_idx').on(
      table.bookingId,
    ),
  }),
);

// Feedbacks Table
export const feedbacks = pgTable(
  'feedbacks',
  {
    id: serial('id').primaryKey(),
    bookingId: integer('booking_id')
      .notNull()
      .unique()
      .references(() => bookings.id, { onDelete: 'cascade' }),
    rating: integer('rating').notNull(),
    satisfaction: integer('satisfaction'),
    issueResolved: boolean('issue_resolved'),
    note: text('note'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    bookingIdIdx: uniqueIndex('feedbacks_booking_id_idx').on(table.bookingId),
  }),
);

// Forum Posts Table
export const forumPosts = pgTable(
  'forum_posts',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    content: text('content').notNull(),
    likeCount: integer('like_count').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    userIdIdx: index('forum_posts_user_id_idx').on(table.userId),
  }),
);

// Forum Comments Table
export const forumComments = pgTable(
  'forum_comments',
  {
    id: serial('id').primaryKey(),
    postId: integer('post_id')
      .notNull()
      .references(() => forumPosts.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    likeCount: integer('like_count').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    postIdIdx: index('forum_comments_post_id_idx').on(table.postId),
  }),
);

// Forum Post Images Table
export const forumPostImages = pgTable('forum_post_images', {
  id: serial('id').primaryKey(),
  postId: integer('post_id')
    .notNull()
    .references(() => forumPosts.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Forum Post Likes Table (Junction table for tracking who liked which posts)
export const forumPostLikes = pgTable(
  'forum_post_likes',
  {
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    postId: integer('post_id')
      .notNull()
      .references(() => forumPosts.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.postId] }),
    userIdIdx: index('forum_post_likes_user_id_idx').on(table.userId),
    postIdIdx: index('forum_post_likes_post_id_idx').on(table.postId),
  }),
);

// Forum Comment Likes Table (Junction table for tracking who liked which comments)
export const forumCommentLikes = pgTable(
  'forum_comment_likes',
  {
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    commentId: integer('comment_id')
      .notNull()
      .references(() => forumComments.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.commentId] }),
    userIdIdx: index('forum_comment_likes_user_id_idx').on(table.userId),
    commentIdIdx: index('forum_comment_likes_comment_id_idx').on(table.commentId),
  }),
);

// ============================================
// RELATIONS (for Drizzle ORM query builder)
// ============================================

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  primaryAddress: one(addresses, {
    fields: [users.primaryAddressId],
    references: [addresses.id],
  }),
  addresses: many(addresses),
  customerProducts: many(customerProducts),
  bookingsAsTechnician: many(bookings),
  technicianServices: many(technicianServices),
  timeslots: many(timeslots),
  timeOffRequestsAsTechnician: many(timeOffRequests, { relationName: 'technicianTimeOffRequests' }),
  timeOffRequestsAsReviewer: many(timeOffRequests, { relationName: 'reviewedTimeOffRequests' }),
  maintenanceReminders: many(maintenanceReminders),
  forumPosts: many(forumPosts),
  forumComments: many(forumComments),
  forumPostLikes: many(forumPostLikes),
  forumCommentLikes: many(forumCommentLikes),
}));

export const productsRelations = relations(products, ({ many }) => ({
  productImages: many(productImages),
  customerProducts: many(customerProducts),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const customerProductsRelations = relations(
  customerProducts,
  ({ one, many }) => ({
    customer: one(users, {
      fields: [customerProducts.customerId],
      references: [users.id],
    }),
    product: one(products, {
      fields: [customerProducts.productId],
      references: [products.id],
    }),
    bookings: many(bookings),
    promotionCodes: many(promotionCodes),
    maintenanceReminders: many(maintenanceReminders),
  }),
);

export const timeslotsRelations = relations(timeslots, ({ one }) => ({
  technician: one(users, {
    fields: [timeslots.technicianId],
    references: [users.id],
  }),
}));

export const timeOffRequestsRelations = relations(timeOffRequests, ({ one }) => ({
  technician: one(users, {
    fields: [timeOffRequests.technicianId],
    references: [users.id],
    relationName: 'technicianTimeOffRequests',
  }),
  reviewer: one(users, {
    fields: [timeOffRequests.reviewerId],
    references: [users.id],
    relationName: 'reviewedTimeOffRequests',
  }),
}));

export const serviceTypesRelations = relations(serviceTypes, ({ many }) => ({
  technicianServices: many(technicianServices),
  bookingServices: many(bookingServices),
  promotionCodes: many(promotionCodes),
  maintenanceReminders: many(maintenanceReminders),
}));

export const technicianServicesRelations = relations(
  technicianServices,
  ({ one }) => ({
    technician: one(users, {
      fields: [technicianServices.technicianId],
      references: [users.id],
    }),
    service: one(serviceTypes, {
      fields: [technicianServices.serviceId],
      references: [serviceTypes.id],
    }),
  }),
);

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  technician: one(users, {
    fields: [bookings.technicianId],
    references: [users.id],
  }),
  aircon: one(customerProducts, {
    fields: [bookings.airconId],
    references: [customerProducts.id],
  }),
  promoCode: one(promotionCodes, {
    fields: [bookings.promoCodeId],
    references: [promotionCodes.id],
  }),
  bookingServices: many(bookingServices),
  bookingImages: many(bookingImages),
  serviceLog: one(serviceLogs),
  feedback: one(feedbacks),
}));

export const bookingServicesRelations = relations(
  bookingServices,
  ({ one }) => ({
    booking: one(bookings, {
      fields: [bookingServices.bookingId],
      references: [bookings.id],
    }),
    service: one(serviceTypes, {
      fields: [bookingServices.serviceId],
      references: [serviceTypes.id],
    }),
  }),
);

export const bookingImagesRelations = relations(bookingImages, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingImages.bookingId],
    references: [bookings.id],
  }),
}));

export const serviceLogsRelations = relations(serviceLogs, ({ one }) => ({
  booking: one(bookings, {
    fields: [serviceLogs.bookingId],
    references: [bookings.id],
  }),
}));

export const feedbacksRelations = relations(feedbacks, ({ one }) => ({
  booking: one(bookings, {
    fields: [feedbacks.bookingId],
    references: [bookings.id],
  }),
}));

export const forumPostsRelations = relations(forumPosts, ({ one, many }) => ({
  user: one(users, {
    fields: [forumPosts.userId],
    references: [users.id],
  }),
  comments: many(forumComments),
  images: many(forumPostImages),
  likes: many(forumPostLikes),
}));

export const forumCommentsRelations = relations(forumComments, ({ one, many }) => ({
  post: one(forumPosts, {
    fields: [forumComments.postId],
    references: [forumPosts.id],
  }),
  user: one(users, {
    fields: [forumComments.userId],
    references: [users.id],
  }),
  likes: many(forumCommentLikes),
}));

export const forumPostImagesRelations = relations(forumPostImages, ({ one }) => ({
  post: one(forumPosts, {
    fields: [forumPostImages.postId],
    references: [forumPosts.id],
  }),
}));

export const forumPostLikesRelations = relations(forumPostLikes, ({ one }) => ({
  user: one(users, {
    fields: [forumPostLikes.userId],
    references: [users.id],
  }),
  post: one(forumPosts, {
    fields: [forumPostLikes.postId],
    references: [forumPosts.id],
  }),
}));

export const forumCommentLikesRelations = relations(forumCommentLikes, ({ one }) => ({
  user: one(users, {
    fields: [forumCommentLikes.userId],
    references: [users.id],
  }),
  comment: one(forumComments, {
    fields: [forumCommentLikes.commentId],
    references: [forumComments.id],
  }),
}));

export const promotionCodesRelations = relations(
  promotionCodes,
  ({ one, many }) => ({
    customerProduct: one(customerProducts, {
      fields: [promotionCodes.customerProductId],
      references: [customerProducts.id],
    }),
    serviceType: one(serviceTypes, {
      fields: [promotionCodes.serviceTypeId],
      references: [serviceTypes.id],
    }),
    maintenanceReminder: one(maintenanceReminders),
    bookings: many(bookings),
  }),
);

export const maintenanceRemindersRelations = relations(
  maintenanceReminders,
  ({ one }) => ({
    customer: one(users, {
      fields: [maintenanceReminders.customerId],
      references: [users.id],
    }),
    customerProduct: one(customerProducts, {
      fields: [maintenanceReminders.customerProductId],
      references: [customerProducts.id],
    }),
    serviceType: one(serviceTypes, {
      fields: [maintenanceReminders.serviceTypeId],
      references: [serviceTypes.id],
    }),
    promotionCode: one(promotionCodes, {
      fields: [maintenanceReminders.promotionCodeId],
      references: [promotionCodes.id],
    }),
  }),
);

