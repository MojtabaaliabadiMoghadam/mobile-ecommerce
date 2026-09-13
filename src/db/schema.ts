import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  numeric,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ---------- Enums ----------
export const userRoleEnum = pgEnum("user_role", ["customer", "admin", "manager", "support"]);
export const loyaltyTierEnum = pgEnum("loyalty_tier", ["bronze", "silver", "gold"]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending_payment",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);
export const paymentStatusEnum = pgEnum("payment_status", ["unpaid", "paid", "failed", "refunded"]);
export const paymentMethodEnum = pgEnum("payment_method", ["zarinpal", "cod", "in_store"]);
export const shippingMethodEnum = pgEnum("shipping_method", ["post", "express", "pickup"]);
export const discountTypeEnum = pgEnum("discount_type", ["percent", "fixed"]);

// ---------- Users ----------
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 190 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").notNull().default("customer"),
    permissions: jsonb("permissions").$type<string[]>().notNull().default([]),
    loyaltyPoints: integer("loyalty_points").notNull().default(0),
    loyaltyTier: loyaltyTierEnum("loyalty_tier").notNull().default("bronze"),
    personalCoupon: varchar("personal_coupon", { length: 40 }),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)]
);

export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 80 }).notNull(),
  receiverName: varchar("receiver_name", { length: 120 }).notNull(),
  receiverPhone: varchar("receiver_phone", { length: 20 }).notNull(),
  province: varchar("province", { length: 80 }).notNull(),
  city: varchar("city", { length: 80 }).notNull(),
  postalCode: varchar("postal_code", { length: 20 }).notNull(),
  line: text("line").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------- Catalog ----------
export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  logo: text("logo"),
  description: text("description"),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  parentId: integer("parent_id"),
  description: text("description"),
  image: text("image"),
  metaTitle: varchar("meta_title", { length: 190 }),
  metaDescription: text("meta_description"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 190 }).notNull(),
    slug: varchar("slug", { length: 220 }).notNull().unique(),
    sku: varchar("sku", { length: 60 }),
    brandId: integer("brand_id").references(() => brands.id, { onDelete: "set null" }),
    categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
    shortDescription: text("short_description"),
    description: text("description"),
    basePrice: integer("base_price").notNull(), // تومان
    compareAtPrice: integer("compare_at_price"),
    discountPercent: integer("discount_percent").notNull().default(0),
    specs: jsonb("specs").$type<Record<string, string>>().notNull().default({}),
    isFeatured: boolean("is_featured").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    salesCount: integer("sales_count").notNull().default(0),
    viewsCount: integer("views_count").notNull().default(0),
    ratingAvg: numeric("rating_avg", { precision: 3, scale: 2 }).notNull().default("0"),
    ratingCount: integer("rating_count").notNull().default(0),
    metaTitle: varchar("meta_title", { length: 190 }),
    metaDescription: text("meta_description"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("products_brand_idx").on(t.brandId), index("products_category_idx").on(t.categoryId)]
);

export const productImages = pgTable("product_images", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  alt: varchar("alt", { length: 190 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  color: varchar("color", { length: 60 }).notNull(),
  colorHex: varchar("color_hex", { length: 10 }).notNull().default("#000000"),
  storage: varchar("storage", { length: 20 }).notNull(), // e.g. 256GB
  ram: varchar("ram", { length: 20 }).notNull(), // e.g. 8GB
  price: integer("price").notNull(),
  stock: integer("stock").notNull().default(0),
  sku: varchar("sku", { length: 80 }),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  authorName: varchar("author_name", { length: 120 }).notNull(),
  rating: integer("rating").notNull(),
  title: varchar("title", { length: 190 }),
  body: text("body").notNull(),
  isApproved: boolean("is_approved").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const wishlists = pgTable(
  "wishlists",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("wishlist_unique").on(t.userId, t.productId)]
);

// ---------- Orders ----------
export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 40 }).notNull().unique(),
  type: discountTypeEnum("type").notNull().default("percent"),
  value: integer("value").notNull(),
  minOrder: integer("min_order").notNull().default(0),
  maxDiscount: integer("max_discount"),
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").notNull().default(0),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }), // اختصاصی
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("order_number", { length: 30 }).notNull().unique(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  status: orderStatusEnum("status").notNull().default("pending_payment"),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("unpaid"),
  paymentMethod: paymentMethodEnum("payment_method").notNull().default("zarinpal"),
  shippingMethod: shippingMethodEnum("shipping_method").notNull().default("post"),
  paymentRef: varchar("payment_ref", { length: 80 }),
  paymentAuthority: varchar("payment_authority", { length: 80 }),
  subtotal: integer("subtotal").notNull(),
  discount: integer("discount").notNull().default(0),
  shippingCost: integer("shipping_cost").notNull().default(0),
  total: integer("total").notNull(),
  couponCode: varchar("coupon_code", { length: 40 }),
  pointsEarned: integer("points_earned").notNull().default(0),
  shippingAddress: jsonb("shipping_address").$type<{
    receiverName: string;
    receiverPhone: string;
    province: string;
    city: string;
    postalCode: string;
    line: string;
  }>(),
  trackingCode: varchar("tracking_code", { length: 60 }),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id, { onDelete: "set null" }),
  variantId: integer("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
  productName: varchar("product_name", { length: 190 }).notNull(),
  variantLabel: varchar("variant_label", { length: 120 }).notNull(),
  image: text("image"),
  unitPrice: integer("unit_price").notNull(),
  quantity: integer("quantity").notNull(),
});

export const orderStatusHistory = pgTable("order_status_history", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  status: orderStatusEnum("status").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const loyaltyTransactions = pgTable("loyalty_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  points: integer("points").notNull(),
  reason: varchar("reason", { length: 190 }).notNull(),
  orderId: integer("order_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------- CMS / Settings ----------
export const banners = pgTable("banners", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 190 }).notNull(),
  subtitle: text("subtitle"),
  image: text("image").notNull(),
  link: text("link"),
  position: varchar("position", { length: 40 }).notNull().default("hero"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 190 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  content: text("content").notNull(),
  metaTitle: varchar("meta_title", { length: 190 }),
  metaDescription: text("meta_description"),
  isPublished: boolean("is_published").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  key: varchar("key", { length: 80 }).primaryKey(),
  value: text("value").notNull(),
});

export const paymentGateways = pgTable("payment_gateways", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 40 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  config: jsonb("config").$type<Record<string, string>>().notNull().default({}),
  sortOrder: integer("sort_order").notNull().default(0),
});

// ---------- Articles / Blog ----------
export const articleCategories = pgTable("article_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 140 }).notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const articles = pgTable(
  "articles",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 220 }).notNull(),
    slug: varchar("slug", { length: 240 }).notNull().unique(),
    excerpt: text("excerpt"),
    content: text("content").notNull(),
    coverImage: text("cover_image"),
    categoryId: integer("category_id").references(() => articleCategories.id, { onDelete: "set null" }),
    authorName: varchar("author_name", { length: 120 }).notNull().default("مدیر سایت"),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    isPublished: boolean("is_published").notNull().default(false),
    viewsCount: integer("views_count").notNull().default(0),
    metaTitle: varchar("meta_title", { length: 220 }),
    metaDescription: text("meta_description"),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("articles_category_idx").on(t.categoryId), index("articles_published_idx").on(t.isPublished, t.publishedAt)]
);

// ---------- Media Library (uploaded images) ----------
export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  filename: varchar("filename", { length: 190 }).notNull(),
  originalName: varchar("original_name", { length: 190 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  size: integer("size").notNull().default(0),
  url: text("url").notNull(),
  width: integer("width"),
  height: integer("height"),
  alt: varchar("alt", { length: 190 }),
  uploadedBy: integer("uploaded_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------- Relations ----------
export const productsRelations = relations(products, ({ one, many }) => ({
  brand: one(brands, { fields: [products.brandId], references: [brands.id] }),
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  images: many(productImages),
  variants: many(productVariants),
  reviews: many(reviews),
}));
export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}));
export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, { fields: [productVariants.productId], references: [products.id] }),
}));
export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
}));
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
  history: many(orderStatusHistory),
}));
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
}));
export const orderStatusHistoryRelations = relations(orderStatusHistory, ({ one }) => ({
  order: one(orders, { fields: [orderStatusHistory.orderId], references: [orders.id] }),
}));
export const articlesRelations = relations(articles, ({ one }) => ({
  category: one(articleCategories, { fields: [articles.categoryId], references: [articleCategories.id] }),
}));

export type Product = typeof products.$inferSelect;
export type ProductVariant = typeof productVariants.$inferSelect;
export type ProductImage = typeof productImages.$inferSelect;
export type Brand = typeof brands.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type User = typeof users.$inferSelect;
export type Address = typeof addresses.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type Banner = typeof banners.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type ArticleCategory = typeof articleCategories.$inferSelect;
export type MediaItem = typeof media.$inferSelect;
export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
