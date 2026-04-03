import { and, asc, count, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { category, product } from '$lib/server/db/schema';
import type {
	CategorySummary,
	OrderSummary,
	ProductDetailSummary,
	ProductSummary
} from '$lib/types';

export type ProductSearchResult = {
	id: string;
	name: string;
	slug: string;
	image: string;
	categoryName: string;
	price: number;
	currency: string;
};

export type CatalogFilters = {
	category?: string | null;
	onSale?: boolean;
	query?: string | null;
	sort?: string | null;
	featuredOnly?: boolean;
};

function asNumber(value: string | null) {
	return value === null ? null : Number(value);
}

type ProductRow = {
	id: string;
	categoryId: string;
	externalId: number | null;
	code: string;
	barcode: string;
	name: string;
	slug: string;
	sku: string;
	shortDescription: string;
	description: string;
	color: string;
	material: string;
	xDim: string;
	yDim: string;
	qty: number;
	price: string;
	currency: string;
	compareAtPrice: string | null;
	image: string;
	gallery: string[];
	details: ProductDetailSummary[];
	isFeatured: boolean;
	onSale: boolean;
	isPublished: boolean;
	inventory: number;
	sortOrder: number;
	createdAt: Date;
	categoryName: string;
	categorySlug: string;
};

function mapProduct(row: ProductRow): ProductSummary {
	const qty = row.qty > 0 || row.inventory === 0 ? row.qty : row.inventory;

	return {
		id: row.id,
		categoryId: row.categoryId,
		categoryName: row.categoryName,
		categorySlug: row.categorySlug,
		externalId: row.externalId,
		code: row.code || row.sku,
		barcode: row.barcode || row.code || row.sku,
		name: row.name,
		slug: row.slug,
		sku: row.sku,
		shortDescription: row.shortDescription,
		description: row.description,
		color: row.color,
		material: row.material,
		xDim: row.xDim || row.color,
		yDim: row.yDim,
		qty,
		currency: row.currency,
		details: row.details,
		price: Number(row.price),
		compareAtPrice: asNumber(row.compareAtPrice),
		image: row.image,
		gallery: row.gallery,
		isFeatured: row.isFeatured,
		onSale: row.onSale,
		isPublished: row.isPublished,
		inventory: qty,
		sortOrder: row.sortOrder,
		createdAt: row.createdAt.toISOString()
	};
}

export async function getCategories() {
	const rows = await db
		.select({
			id: category.id,
			name: category.name,
			slug: category.slug,
			description: category.description,
			image: category.image,
			featured: category.featured,
			sortOrder: category.sortOrder,
			productCount: count(product.id)
		})
		.from(category)
		.leftJoin(product, and(eq(product.categoryId, category.id), eq(product.isPublished, true)))
		.groupBy(
			category.id,
			category.name,
			category.slug,
			category.description,
			category.image,
			category.featured,
			category.sortOrder
		)
		.orderBy(asc(category.sortOrder), asc(category.name));

	return rows satisfies CategorySummary[];
}

function buildOrder(sort: string | null | undefined) {
	switch (sort) {
		case 'price-asc':
			return [asc(sql`CAST(${product.price} AS numeric)`), asc(product.name)];
		case 'price-desc':
			return [desc(sql`CAST(${product.price} AS numeric)`), asc(product.name)];
		case 'name':
			return [asc(product.name)];
		case 'newest':
			return [desc(product.createdAt)];
		default:
			return [desc(product.isFeatured), asc(product.sortOrder), desc(product.createdAt)];
	}
}

export async function getProducts(filters: CatalogFilters = {}) {
	const conditions = [eq(product.isPublished, true)];

	if (filters.category) {
		conditions.push(eq(category.slug, filters.category));
	}

	if (filters.onSale) {
		conditions.push(eq(product.onSale, true));
	}

	if (filters.featuredOnly) {
		conditions.push(eq(product.isFeatured, true));
	}

	if (filters.query) {
		const search = `%${filters.query}%`;
		conditions.push(
			or(
				ilike(product.name, search),
				ilike(product.shortDescription, search),
				ilike(category.name, search)
			)!
		);
	}

	const rows = await db
		.select({
			id: product.id,
			categoryId: product.categoryId,
			externalId: product.externalId,
			code: product.code,
			barcode: product.barcode,
			name: product.name,
			slug: product.slug,
			sku: product.sku,
			shortDescription: product.shortDescription,
			description: product.description,
			color: product.color,
			material: product.material,
			xDim: product.xDim,
			yDim: product.yDim,
			qty: product.qty,
			price: product.price,
			currency: product.currency,
			compareAtPrice: product.compareAtPrice,
			image: product.image,
			gallery: product.gallery,
			details: product.details,
			isFeatured: product.isFeatured,
			onSale: product.onSale,
			isPublished: product.isPublished,
			inventory: product.inventory,
			sortOrder: product.sortOrder,
			createdAt: product.createdAt,
			categoryName: category.name,
			categorySlug: category.slug
		})
		.from(product)
		.innerJoin(category, eq(product.categoryId, category.id))
		.where(and(...conditions))
		.orderBy(...buildOrder(filters.sort));

	return rows.map(mapProduct);
}

export async function getProductBySlug(slug: string) {
	const rows = await db
		.select({
			id: product.id,
			categoryId: product.categoryId,
			externalId: product.externalId,
			code: product.code,
			barcode: product.barcode,
			name: product.name,
			slug: product.slug,
			sku: product.sku,
			shortDescription: product.shortDescription,
			description: product.description,
			color: product.color,
			material: product.material,
			xDim: product.xDim,
			yDim: product.yDim,
			qty: product.qty,
			price: product.price,
			currency: product.currency,
			compareAtPrice: product.compareAtPrice,
			image: product.image,
			gallery: product.gallery,
			details: product.details,
			isFeatured: product.isFeatured,
			onSale: product.onSale,
			isPublished: product.isPublished,
			inventory: product.inventory,
			sortOrder: product.sortOrder,
			createdAt: product.createdAt,
			categoryName: category.name,
			categorySlug: category.slug
		})
		.from(product)
		.innerJoin(category, eq(product.categoryId, category.id))
		.where(and(eq(product.slug, slug), eq(product.isPublished, true)))
		.limit(1);

	return rows[0] ? mapProduct(rows[0]) : null;
}

export async function getProductsByIds(productIds: string[]) {
	if (!productIds.length) {
		return [] as ProductSummary[];
	}

	const rows = await db
		.select({
			id: product.id,
			categoryId: product.categoryId,
			externalId: product.externalId,
			code: product.code,
			barcode: product.barcode,
			name: product.name,
			slug: product.slug,
			sku: product.sku,
			shortDescription: product.shortDescription,
			description: product.description,
			color: product.color,
			material: product.material,
			xDim: product.xDim,
			yDim: product.yDim,
			qty: product.qty,
			price: product.price,
			currency: product.currency,
			compareAtPrice: product.compareAtPrice,
			image: product.image,
			gallery: product.gallery,
			details: product.details,
			isFeatured: product.isFeatured,
			onSale: product.onSale,
			isPublished: product.isPublished,
			inventory: product.inventory,
			sortOrder: product.sortOrder,
			createdAt: product.createdAt,
			categoryName: category.name,
			categorySlug: category.slug
		})
		.from(product)
		.innerJoin(category, eq(product.categoryId, category.id))
		.where(and(inArray(product.id, productIds), eq(product.isPublished, true)));

	const mapped = rows.map(mapProduct);
	const byId = new Map(mapped.map((item) => [item.id, item]));

	return productIds
		.map((id) => byId.get(id))
		.filter((item): item is ProductSummary => Boolean(item));
}

export async function searchProducts(query: string, limit = 6) {
	const trimmed = query.trim();
	if (!trimmed) {
		return [] as ProductSearchResult[];
	}

	const search = `%${trimmed}%`;

	const rows = await db
		.select({
			id: product.id,
			name: product.name,
			slug: product.slug,
			image: product.image,
			categoryName: category.name,
			price: product.price,
			currency: product.currency
		})
		.from(product)
		.innerJoin(category, eq(product.categoryId, category.id))
		.where(
			and(
				eq(product.isPublished, true),
				or(
					ilike(product.name, search),
					ilike(product.shortDescription, search),
					ilike(product.description, search),
					ilike(category.name, search),
					ilike(product.code, search),
					ilike(product.barcode, search)
				)!
			)
		)
		.orderBy(desc(product.isFeatured), asc(product.sortOrder), asc(product.name))
		.limit(limit);

	return rows.map((row) => ({
		id: row.id,
		name: row.name,
		slug: row.slug,
		image: row.image,
		categoryName: row.categoryName,
		price: Number(row.price),
		currency: row.currency
	}));
}

export async function getAdminProducts() {
	const rows = await db
		.select({
			id: product.id,
			categoryId: product.categoryId,
			externalId: product.externalId,
			code: product.code,
			barcode: product.barcode,
			name: product.name,
			slug: product.slug,
			sku: product.sku,
			shortDescription: product.shortDescription,
			description: product.description,
			color: product.color,
			material: product.material,
			xDim: product.xDim,
			yDim: product.yDim,
			qty: product.qty,
			price: product.price,
			currency: product.currency,
			compareAtPrice: product.compareAtPrice,
			image: product.image,
			gallery: product.gallery,
			details: product.details,
			isFeatured: product.isFeatured,
			onSale: product.onSale,
			isPublished: product.isPublished,
			inventory: product.inventory,
			sortOrder: product.sortOrder,
			createdAt: product.createdAt,
			categoryName: category.name,
			categorySlug: category.slug
		})
		.from(product)
		.innerJoin(category, eq(product.categoryId, category.id))
		.orderBy(desc(product.createdAt));

	return rows.map(mapProduct);
}

export async function getAdminOrders() {
	const rows = await db.query.order.findMany({
		with: {
			items: true
		},
		orderBy: (orders, { desc }) => [desc(orders.createdAt)]
	});

	return rows.map((row) => ({
		id: row.id,
		orderNumber: row.orderNumber,
		status: row.status,
		customerName: row.customerName,
		customerPhone: row.customerPhone,
		customerEmail: row.customerEmail,
		customerCity: row.customerCity,
		customerAddress: row.customerAddress,
		notes: row.notes,
		subtotal: Number(row.subtotal),
		total: Number(row.total),
		createdAt: row.createdAt.toISOString(),
		items: row.items.map((item) => ({
			id: item.id,
			productId: item.productId,
			productName: item.productName,
			productSlug: item.productSlug,
			productImage: item.productImage,
			unitPrice: Number(item.unitPrice),
			quantity: item.quantity,
			lineTotal: Number(item.lineTotal)
		}))
	})) satisfies OrderSummary[];
}
