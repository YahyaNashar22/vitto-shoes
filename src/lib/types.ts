import type { ORDER_STATUSES } from './constants';

export type CategorySummary = {
	id: string;
	name: string;
	slug: string;
	description: string;
	image: string;
	featured: boolean;
	sortOrder: number;
	productCount?: number;
};

export type ProductDetailSummary = {
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
};

export type ProductSummary = {
	id: string;
	categoryId: string;
	categoryName: string;
	categorySlug: string;
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
	currency: string;
	details: ProductDetailSummary[];
	price: number;
	compareAtPrice: number | null;
	image: string;
	gallery: string[];
	isFeatured: boolean;
	onSale: boolean;
	isPublished: boolean;
	inventory: number;
	sortOrder: number;
	createdAt: string;
};

export type CartItem = {
	productId: string;
	name: string;
	slug: string;
	image: string;
	price: number;
	quantity: number;
	categoryName: string;
};

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderSummary = {
	id: string;
	orderNumber: string;
	status: OrderStatus;
	customerName: string;
	customerPhone: string;
	customerEmail: string;
	customerCity: string;
	customerAddress: string;
	notes: string;
	subtotal: number;
	total: number;
	createdAt: string;
	items: Array<{
		id: string;
		productId: string;
		productName: string;
		productSlug: string;
		productImage: string;
		unitPrice: number;
		quantity: number;
		lineTotal: number;
	}>;
};
