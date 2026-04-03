import { relations, sql } from 'drizzle-orm';
import {
	boolean,
	index,
	integer,
	jsonb,
	numeric,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid
} from 'drizzle-orm/pg-core';
import { account, session, user, verification } from './auth.schema';

export { account, session, user, verification };

export const orderStatusEnum = pgEnum('order_status', [
	'pending',
	'confirmed',
	'processing',
	'completed',
	'cancelled'
]);

export const category = pgTable(
	'category',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		name: text('name').notNull(),
		slug: text('slug').notNull().unique(),
		description: text('description').notNull().default(''),
		image: text('image').notNull().default(''),
		featured: boolean('featured').notNull().default(false),
		sortOrder: integer('sort_order').notNull().default(0),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date())
	},
	(table) => [index('category_slug_idx').on(table.slug)]
);

export const product = pgTable(
	'product',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		categoryId: uuid('category_id')
			.notNull()
			.references(() => category.id, { onDelete: 'restrict' }),
		externalId: integer('external_id'),
		code: text('code').notNull().default(''),
		barcode: text('barcode').notNull().default(''),
		name: text('name').notNull(),
		slug: text('slug').notNull().unique(),
		sku: text('sku').notNull().unique(),
		shortDescription: text('short_description').notNull().default(''),
		description: text('description').notNull().default(''),
		color: text('color').notNull().default(''),
		material: text('material').notNull().default(''),
		xDim: text('x_dim').notNull().default(''),
		yDim: text('y_dim').notNull().default(''),
		qty: integer('qty').notNull().default(0),
		price: numeric('price', { precision: 10, scale: 2 }).notNull(),
		currency: text('currency').notNull().default('USD'),
		compareAtPrice: numeric('compare_at_price', { precision: 10, scale: 2 }),
		image: text('image').notNull().default(''),
		gallery: jsonb('gallery')
			.$type<string[]>()
			.notNull()
			.default(sql`'[]'::jsonb`),
		details: jsonb('details')
			.$type<
				Array<{
					itemid: number | null;
					itemcode: string;
					itembarcode: string;
					itembarcodeid: string | null;
					itemname: string;
					itemdescription: string;
					xdim: string;
					ydim: string;
					qty: number;
					salesprice: number;
					currencycode: string;
					isdim: number;
				}>
			>()
			.notNull()
			.default(sql`'[]'::jsonb`),
		isFeatured: boolean('is_featured').notNull().default(false),
		onSale: boolean('on_sale').notNull().default(false),
		isPublished: boolean('is_published').notNull().default(true),
		inventory: integer('inventory').notNull().default(0),
		sortOrder: integer('sort_order').notNull().default(0),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date())
	},
	(table) => [
		index('product_slug_idx').on(table.slug),
		index('product_category_idx').on(table.categoryId),
		index('product_sale_idx').on(table.onSale),
		index('product_featured_idx').on(table.isFeatured)
	]
);

export const order = pgTable(
	'order',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		orderNumber: text('order_number').notNull().unique(),
		status: orderStatusEnum('status').notNull().default('pending'),
		customerName: text('customer_name').notNull(),
		customerPhone: text('customer_phone').notNull(),
		customerEmail: text('customer_email').notNull().default(''),
		customerCity: text('customer_city').notNull().default(''),
		customerAddress: text('customer_address').notNull(),
		notes: text('notes').notNull().default(''),
		whatsappMessage: text('whatsapp_message').notNull().default(''),
		subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
		total: numeric('total', { precision: 10, scale: 2 }).notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date())
	},
	(table) => [
		index('order_number_idx').on(table.orderNumber),
		index('order_status_idx').on(table.status)
	]
);

export const orderItem = pgTable(
	'order_item',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		orderId: uuid('order_id')
			.notNull()
			.references(() => order.id, { onDelete: 'cascade' }),
		productId: uuid('product_id')
			.notNull()
			.references(() => product.id, { onDelete: 'restrict' }),
		productName: text('product_name').notNull(),
		productSlug: text('product_slug').notNull(),
		productImage: text('product_image').notNull().default(''),
		selectedBarcode: text('selected_barcode').notNull().default(''),
		selectedXDim: text('selected_x_dim').notNull().default(''),
		selectedYDim: text('selected_y_dim').notNull().default(''),
		unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
		quantity: integer('quantity').notNull(),
		lineTotal: numeric('line_total', { precision: 10, scale: 2 }).notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		index('order_item_order_idx').on(table.orderId),
		index('order_item_product_idx').on(table.productId)
	]
);

export const wishlistItem = pgTable(
	'wishlist_item',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		productId: uuid('product_id')
			.notNull()
			.references(() => product.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		index('wishlist_item_user_idx').on(table.userId),
		index('wishlist_item_product_idx').on(table.productId),
		index('wishlist_item_user_product_idx').on(table.userId, table.productId)
	]
);

export const categoryRelations = relations(category, ({ many }) => ({
	products: many(product)
}));

export const productRelations = relations(product, ({ one, many }) => ({
	category: one(category, {
		fields: [product.categoryId],
		references: [category.id]
	}),
	orderItems: many(orderItem),
	wishlistItems: many(wishlistItem)
}));

export const orderRelations = relations(order, ({ many }) => ({
	items: many(orderItem)
}));

export const orderItemRelations = relations(orderItem, ({ one }) => ({
	order: one(order, {
		fields: [orderItem.orderId],
		references: [order.id]
	}),
	product: one(product, {
		fields: [orderItem.productId],
		references: [product.id]
	})
}));

export const wishlistItemRelations = relations(wishlistItem, ({ one }) => ({
	user: one(user, {
		fields: [wishlistItem.userId],
		references: [user.id]
	}),
	product: one(product, {
		fields: [wishlistItem.productId],
		references: [product.id]
	})
}));

export const userWishlistRelations = relations(user, ({ many }) => ({
	wishlistItems: many(wishlistItem)
}));
