import type { CategorySummary, ProductDetailSummary, ProductSummary } from '$lib/types';

export type ProductImportRow = {
	Id: number | null;
	Code: string;
	Barcode: string;
	Name: string;
	Desc: string;
	XDim: string;
	YDim: string;
	Qty: number;
	Price: number;
	Currency: string;
	Details: ProductDetailSummary[];
	CategorySlug?: string;
	Slug?: string;
	SKU?: string;
	ShortDescription?: string;
	Image?: string;
	Gallery?: string[];
	IsFeatured?: boolean;
	OnSale?: boolean;
	IsPublished?: boolean;
	SortOrder?: number;
	CompareAtPrice?: number | null;
	Color?: string;
	Material?: string;
};

function asString(value: unknown) {
	return typeof value === 'string' ? value.trim() : '';
}

function asNumber(value: unknown) {
	if (typeof value === 'number' && Number.isFinite(value)) return value;
	if (typeof value === 'string' && value.trim()) {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : 0;
	}
	return 0;
}

function asNullableNumber(value: unknown) {
	if (value === null || value === undefined || value === '') return null;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : null;
}

function asBool(value: unknown, fallback = false) {
	if (typeof value === 'boolean') return value;
	if (typeof value === 'string') {
		const normalized = value.trim().toLowerCase();
		if (['true', '1', 'yes'].includes(normalized)) return true;
		if (['false', '0', 'no'].includes(normalized)) return false;
	}
	return fallback;
}

function normalizeDetail(value: unknown): ProductDetailSummary | null {
	if (!value || typeof value !== 'object') return null;
	const detail = value as Record<string, unknown>;

	return {
		itemid: asNullableNumber(detail.itemid ?? detail.ItemId),
		itemcode: asString(detail.itemcode ?? detail.ItemCode),
		itembarcode: asString(detail.itembarcode ?? detail.ItemBarcode),
		itembarcodeid:
			detail.itembarcodeid === null || detail.itembarcodeid === undefined
				? null
				: asString(detail.itembarcodeid ?? detail.ItemBarcodeId) || null,
		itemname: asString(detail.itemname ?? detail.ItemName),
		itemdescription: asString(detail.itemdescription ?? detail.ItemDescription),
		xdim: asString(detail.xdim ?? detail.XDim),
		ydim: asString(detail.ydim ?? detail.YDim),
		qty: asNumber(detail.qty ?? detail.Qty),
		salesprice: asNumber(detail.salesprice ?? detail.SalesPrice),
		currencycode: asString(detail.currencycode ?? detail.CurrencyCode) || 'USD',
		isdim: asNumber(detail.isdim ?? detail.IsDim)
	};
}

export function normalizeProductImportRow(value: unknown): ProductImportRow | null {
	if (!value || typeof value !== 'object') return null;
	const row = value as Record<string, unknown>;
	const name = asString(row.Name ?? row.name);
	const code = asString(row.Code ?? row.code);

	if (!name && !code) {
		return null;
	}

	const rawDetails = row.Details ?? row.details;
	const details = Array.isArray(rawDetails)
		? rawDetails.map(normalizeDetail).filter((detail) => detail !== null)
		: [];
	const rawGallery = row.Gallery ?? row.gallery;
	const gallery = Array.isArray(rawGallery)
		? rawGallery.map((item: unknown) => asString(item)).filter(Boolean)
		: asString(rawGallery)
				.split(',')
				.map((item) => item.trim())
				.filter(Boolean);

	return {
		Id: asNullableNumber(row.Id ?? row.id),
		Code: code,
		Barcode: asString(row.Barcode ?? row.barcode),
		Name: name,
		Desc: asString(row.Desc ?? row.desc ?? row.Description ?? row.description),
		XDim: asString(row.XDim ?? row.xdim),
		YDim: asString(row.YDim ?? row.ydim),
		Qty: asNumber(row.Qty ?? row.qty ?? row.Inventory ?? row.inventory),
		Price: asNumber(row.Price ?? row.price),
		Currency: asString(row.Currency ?? row.currency) || 'USD',
		Details: details,
		CategorySlug: asString(row.CategorySlug ?? row.categorySlug),
		Slug: asString(row.Slug ?? row.slug),
		SKU: asString(row.SKU ?? row.sku),
		ShortDescription: asString(row.ShortDescription ?? row.shortDescription),
		Image: asString(row.Image ?? row.image),
		Gallery: gallery,
		IsFeatured: asBool(row.IsFeatured ?? row.isFeatured),
		OnSale: asBool(row.OnSale ?? row.onSale),
		IsPublished: asBool(row.IsPublished ?? row.isPublished, true),
		SortOrder: asNumber(row.SortOrder ?? row.sortOrder),
		CompareAtPrice: asNullableNumber(row.CompareAtPrice ?? row.compareAtPrice),
		Color: asString(row.Color ?? row.color),
		Material: asString(row.Material ?? row.material)
	};
}

export async function readProductJsonRows(file: File) {
	const contents = await file.text();
	const trimmed = contents.trim();

	if (!trimmed) {
		return [];
	}

	let parsed: unknown;

	if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
		parsed = JSON.parse(trimmed);
	} else {
		const matches = [...trimmed.matchAll(/data\s*=\s*(\{[\s\S]*?\})(?=\s*data\s*=|$)/g)];
		parsed = matches.map((match) => JSON.parse(match[1]));
	}

	const rows = Array.isArray(parsed)
		? parsed
		: parsed && typeof parsed === 'object' && Array.isArray((parsed as { data?: unknown[] }).data)
			? (parsed as { data: unknown[] }).data
			: [parsed];

	return rows.map(normalizeProductImportRow).filter((row) => row !== null);
}

export function toProductJsonRow(product: ProductSummary) {
	return {
		Id: product.externalId,
		Code: product.code,
		Barcode: product.barcode,
		Name: product.name,
		Desc: product.description,
		XDim: product.xDim,
		YDim: product.yDim,
		Qty: product.qty,
		Price: product.price,
		Currency: product.currency,
		Details: product.details,
		CategorySlug: product.categorySlug,
		Slug: product.slug,
		SKU: product.sku,
		ShortDescription: product.shortDescription,
		Image: product.image,
		Gallery: product.gallery,
		IsFeatured: product.isFeatured,
		OnSale: product.onSale,
		IsPublished: product.isPublished,
		SortOrder: product.sortOrder,
		CompareAtPrice: product.compareAtPrice,
		Color: product.color,
		Material: product.material
	};
}

export function resolveImportCategoryId(row: ProductImportRow, categories: CategorySummary[]) {
	const requestedSlug = row.CategorySlug?.trim();
	if (requestedSlug) {
		const matched = categories.find((item) => item.slug === requestedSlug);
		if (matched) return matched.id;
	}

	return categories[0]?.id ?? null;
}
