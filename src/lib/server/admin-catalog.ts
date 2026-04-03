import { eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { category, product } from '$lib/server/db/schema';
import { getAdminProducts, getCategories } from '$lib/server/catalog';
import { readWorkbookRows } from '$lib/server/excel';
import {
	readProductJsonRows,
	resolveImportCategoryId,
	type ProductImportRow
} from '$lib/server/product-json';
import {
	getEffectiveUploadBytes,
	getMaxUploadLabel,
	saveUploadedImage,
	saveUploadedImages,
	UploadError
} from '$lib/server/uploads';
import { slugify } from '$lib/utils';
import type { ProductDetailSummary } from '$lib/types';

const CATEGORY_PARENT_GROUPS = ['men', 'women', 'kids'] as const;

function asString(formData: FormData, key: string) {
	return formData.get(key)?.toString().trim() ?? '';
}

function asNumber(formData: FormData, key: string) {
	return Number(formData.get(key)?.toString() ?? 0);
}

function asBool(formData: FormData, key: string) {
	return formData.get(key) === 'on' || formData.get(key) === 'true' || formData.get(key) === '1';
}

function asCategoryParentGroup(formData: FormData, key: string) {
	const value = asString(formData, key).toLowerCase();
	return CATEGORY_PARENT_GROUPS.includes(value as (typeof CATEGORY_PARENT_GROUPS)[number])
		? (value as (typeof CATEGORY_PARENT_GROUPS)[number])
		: 'women';
}

function parseDetails(raw: string) {
	if (!raw.trim()) return [];

	try {
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function sanitizeDetail(detail: Record<string, unknown>): ProductDetailSummary {
	return {
		itemid: typeof detail.itemid === 'number' ? detail.itemid : Number(detail.itemid ?? 0) || null,
		itemcode: String(detail.itemcode ?? ''),
		itembarcode: String(detail.itembarcode ?? ''),
		itembarcodeid: detail.itembarcodeid ? String(detail.itembarcodeid) : null,
		itemname: String(detail.itemname ?? ''),
		itemdescription: String(detail.itemdescription ?? ''),
		xdim: String(detail.xdim ?? ''),
		ydim: String(detail.ydim ?? ''),
		qty: Number(detail.qty ?? 0),
		salesprice: Number(detail.salesprice ?? 0),
		currencycode: String(detail.currencycode ?? 'USD'),
		isdim: Number(detail.isdim ?? 1) || 1,
		image: detail.image ? String(detail.image) : undefined,
		gallery: Array.isArray(detail.gallery)
			? detail.gallery.map((item) => String(item)).filter(Boolean)
			: undefined
	};
}

async function buildProductDetailsFromFormData(
	formData: FormData,
	existingDetails: ProductDetailSummary[] = []
) {
	const variantColors = formData.getAll('variantColor').map((value) => value.toString().trim());
	const variantSizes = formData.getAll('variantSize').map((value) => value.toString().trim());
	const variantQtys = formData.getAll('variantQty').map((value) => Number(value.toString() || 0));
	const variantPrices = formData
		.getAll('variantPrice')
		.map((value) => Number(value.toString() || 0));
	const variantBarcodes = formData.getAll('variantBarcode').map((value) => value.toString().trim());
	const variantImageFiles = formData.getAll('variantImageFile');
	const variantImageExisting = formData
		.getAll('variantImageExisting')
		.map((value) => value.toString().trim());

	const rowCount = Math.max(
		variantColors.length,
		variantSizes.length,
		variantQtys.length,
		variantPrices.length,
		variantBarcodes.length,
		variantImageExisting.length
	);

	if (!rowCount) {
		return parseDetails(asString(formData, 'details'))
			.map((item) => sanitizeDetail(item as Record<string, unknown>))
			.filter((item) => item.itembarcode || item.xdim || item.ydim);
	}

	const rows: ProductDetailSummary[] = [];

	for (let index = 0; index < rowCount; index += 1) {
		const color = variantColors[index] ?? '';
		const size = variantSizes[index] ?? '';
		const qty = Number.isFinite(variantQtys[index]) ? variantQtys[index] : 0;
		const price = Number.isFinite(variantPrices[index]) ? variantPrices[index] : 0;
		const barcode = variantBarcodes[index] ?? '';

		const hasRow = color || size || barcode || qty > 0 || price > 0;
		if (!hasRow) continue;

		const existingRow = existingDetails[index];
		const imageFromUpload = await saveUploadedImage(variantImageFiles[index], 'products');

		rows.push({
			itemid:
				typeof existingRow?.itemid === 'number'
					? existingRow.itemid
					: asString(formData, 'externalId')
						? asNumber(formData, 'externalId')
						: null,
			itemcode: barcode || existingRow?.itemcode || asString(formData, 'code'),
			itembarcode: barcode,
			itembarcodeid: existingRow?.itembarcodeid ?? null,
			itemname: asString(formData, 'name'),
			itemdescription: asString(formData, 'shortDescription') || asString(formData, 'description'),
			xdim: color,
			ydim: size,
			qty,
			salesprice: price || asNumber(formData, 'price'),
			currencycode: asString(formData, 'currency') || 'USD',
			isdim: 1,
			image: imageFromUpload || variantImageExisting[index] || existingRow?.image || undefined,
			gallery: existingRow?.gallery
		});
	}

	return rows;
}

export async function ensureFallbackCategoryId() {
	const categories = await getCategories();
	if (categories[0]) {
		return categories[0].id;
	}

	const slug = 'uncategorized';
	const existing = await db.select().from(category).where(eq(category.slug, slug)).limit(1);

	if (existing[0]) {
		return existing[0].id;
	}

	const [created] = await db
		.insert(category)
		.values({
			name: 'Uncategorized',
			slug,
			description: 'Fallback category for imported items without a category.',
			sortOrder: 999
		})
		.returning({ id: category.id });

	return created.id;
}

export async function upsertImportedProduct(row: ProductImportRow) {
	const categories = await getCategories();
	const fallbackCategoryId = categories[0]?.id ?? (await ensureFallbackCategoryId());
	const categoryId = resolveImportCategoryId(row, categories) ?? fallbackCategoryId;
	const code = row.Code.trim();
	const name = row.Name.trim();
	const sku = row.SKU?.trim() || code || slugify(name);
	const slug = row.Slug?.trim() || slugify(name || code || sku);

	if (!name || !sku) {
		return;
	}

	const existing = code
		? await db.select().from(product).where(eq(product.code, code)).limit(1)
		: await db.select().from(product).where(eq(product.sku, sku)).limit(1);

	const values = {
		categoryId,
		externalId: row.Id,
		code,
		barcode: row.Barcode,
		name,
		slug,
		sku,
		shortDescription: row.ShortDescription || row.Desc,
		description: row.Desc,
		color: row.Color || row.XDim,
		material: row.Material,
		xDim: row.XDim,
		yDim: row.YDim,
		qty: row.Qty,
		price: row.Price.toFixed(2),
		currency: row.Currency || 'USD',
		compareAtPrice:
			row.CompareAtPrice !== null && row.CompareAtPrice !== undefined
				? row.CompareAtPrice.toFixed(2)
				: null,
		image: row.Image || '',
		gallery: row.Gallery ?? [],
		details: row.Details,
		isFeatured: row.IsFeatured ?? false,
		onSale: row.OnSale ?? false,
		isPublished: row.IsPublished ?? true,
		inventory: row.Qty,
		sortOrder: row.SortOrder ?? 0
	};

	if (existing[0]) {
		await db.update(product).set(values).where(eq(product.id, existing[0].id));
	} else {
		await db.insert(product).values(values);
	}
}

export async function loadCatalogCategories() {
	return {
		categories: await getCategories(),
		maxUploadBytes: getEffectiveUploadBytes(),
		maxUploadLabel: getMaxUploadLabel()
	};
}

export async function loadCatalogProducts() {
	return {
		categories: await getCategories(),
		products: await getAdminProducts(),
		maxUploadBytes: getEffectiveUploadBytes(),
		maxUploadLabel: getMaxUploadLabel()
	};
}

export async function loadCatalogImports() {
	const [categories, products] = await Promise.all([getCategories(), getAdminProducts()]);

	return {
		categoryCount: categories.length,
		productCount: products.length,
		maxUploadBytes: getEffectiveUploadBytes(),
		maxUploadLabel: getMaxUploadLabel()
	};
}

export async function saveCategoryAction(request: Request) {
	const formData = await request.formData();
	const id = asString(formData, 'id');
	const name = asString(formData, 'name');

	if (!name) {
		return fail(400, { catalogMessage: 'Category name is required.' });
	}

	const existing = id ? await db.select().from(category).where(eq(category.id, id)).limit(1) : [];

	let uploadedImage = existing[0]?.image ?? '';

	try {
		const savedImage = await saveUploadedImage(formData.get('imageFile'), 'categories');
		if (savedImage) {
			uploadedImage = savedImage;
		}
	} catch (error) {
		if (error instanceof UploadError) {
			return fail(400, { catalogMessage: error.message });
		}

		throw error;
	}

	const values = {
		name,
		slug: slugify(asString(formData, 'slug') || name),
		description: asString(formData, 'description'),
		image: uploadedImage,
		featured: asBool(formData, 'featured'),
		parentGroup: asCategoryParentGroup(formData, 'parentGroup'),
		sortOrder: asNumber(formData, 'sortOrder')
	};

	if (id) {
		await db.update(category).set(values).where(eq(category.id, id));
	} else {
		await db.insert(category).values(values);
	}

	return { catalogMessage: 'Category saved.' };
}

export async function deleteCategoryAction(request: Request) {
	const formData = await request.formData();
	const id = asString(formData, 'id');
	if (id) {
		await db.delete(category).where(eq(category.id, id));
	}
	return { catalogMessage: 'Category deleted.' };
}

export async function importCategoriesAction(request: Request) {
	const formData = await request.formData();
	const file = formData.get('file');

	if (!(file instanceof File) || !file.size) {
		return fail(400, { catalogMessage: 'Choose an Excel file first.' });
	}

	const rows = await readWorkbookRows(file);

	for (const row of rows) {
		const name = String(row.name || row.Name || '').trim();
		if (!name) continue;

		const slug = slugify(String(row.slug || row.Slug || name));
		const existing = await db.select().from(category).where(eq(category.slug, slug)).limit(1);

		const values = {
			name,
			slug,
			description: String(row.description || row.Description || ''),
			image: String(row.image || row.Image || ''),
			featured: String(row.featured || row.Featured || '').toLowerCase() === 'true',
			parentGroup: CATEGORY_PARENT_GROUPS.includes(
				String(row.parentGroup || row.ParentGroup || 'women').toLowerCase() as
					| 'men'
					| 'women'
					| 'kids'
			)
				? (String(row.parentGroup || row.ParentGroup || 'women').toLowerCase() as
						| 'men'
						| 'women'
						| 'kids')
				: 'women',
			sortOrder: Number(row.sortOrder || row.SortOrder || 0)
		};

		if (existing[0]) {
			await db.update(category).set(values).where(eq(category.id, existing[0].id));
		} else {
			await db.insert(category).values(values);
		}
	}

	return { catalogMessage: 'Categories imported.' };
}

export async function saveProductAction(request: Request) {
	const formData = await request.formData();
	const id = asString(formData, 'id');
	const name = asString(formData, 'name');
	const code = asString(formData, 'code');
	const sku = asString(formData, 'sku') || code || slugify(name);
	const categoryId = asString(formData, 'categoryId') || (await ensureFallbackCategoryId());

	if (!name || !sku) {
		return fail(400, { catalogMessage: 'Product name and an SKU or code are required.' });
	}

	const existing = id ? await db.select().from(product).where(eq(product.id, id)).limit(1) : [];

	let uploadedImage = existing[0]?.image ?? '';
	let uploadedGallery = existing[0]?.gallery ?? [];

	try {
		const savedImage = await saveUploadedImage(formData.get('imageFile'), 'products');
		const savedGallery = await saveUploadedImages(formData.getAll('galleryFiles'), 'products');

		if (savedImage) {
			uploadedImage = savedImage;
		}

		if (savedGallery.length) {
			uploadedGallery = savedGallery;
		}
	} catch (error) {
		if (error instanceof UploadError) {
			return fail(400, { catalogMessage: error.message });
		}

		throw error;
	}

	const details = await buildProductDetailsFromFormData(formData, existing[0]?.details ?? []);
	const derivedQty = details.length
		? details.reduce((sum, item) => sum + Math.max(item.qty, 0), 0)
		: asNumber(formData, 'qty');
	const derivedColor = details[0]?.xdim || asString(formData, 'color');
	const derivedXDim = details[0]?.xdim || asString(formData, 'xDim');
	const derivedYDim = details[0]?.ydim || asString(formData, 'yDim');
	const firstVariantImage = details.find((item) => item.image)?.image || '';
	const variantGallery = Array.from(
		new Set(
			details
				.flatMap((item) => [item.image, ...(item.gallery ?? [])])
				.filter((item): item is string => Boolean(item))
		)
	);

	if (!uploadedImage && firstVariantImage) {
		uploadedImage = firstVariantImage;
	}

	if (!uploadedGallery.length && variantGallery.length) {
		uploadedGallery = variantGallery;
	}

	const values = {
		categoryId,
		externalId: asString(formData, 'externalId') ? asNumber(formData, 'externalId') : null,
		code,
		barcode: asString(formData, 'barcode'),
		name,
		slug: slugify(asString(formData, 'slug') || name),
		sku,
		shortDescription: asString(formData, 'shortDescription'),
		description: asString(formData, 'description'),
		color: derivedColor,
		material: asString(formData, 'material'),
		xDim: derivedXDim,
		yDim: derivedYDim,
		qty: derivedQty,
		price: asNumber(formData, 'price').toFixed(2),
		currency: asString(formData, 'currency') || 'USD',
		compareAtPrice: asString(formData, 'compareAtPrice')
			? asNumber(formData, 'compareAtPrice').toFixed(2)
			: null,
		image: uploadedImage,
		gallery: uploadedGallery,
		details,
		isFeatured: asBool(formData, 'isFeatured'),
		onSale: asBool(formData, 'onSale'),
		isPublished: asBool(formData, 'isPublished'),
		inventory: derivedQty,
		sortOrder: asNumber(formData, 'sortOrder')
	};

	if (id) {
		await db.update(product).set(values).where(eq(product.id, id));
	} else {
		await db.insert(product).values(values);
	}

	return { catalogMessage: 'Product saved.' };
}

export async function deleteProductAction(request: Request) {
	const formData = await request.formData();
	const id = asString(formData, 'id');
	if (id) {
		await db.delete(product).where(eq(product.id, id));
	}
	return { catalogMessage: 'Product deleted.' };
}

export async function importProductsAction(request: Request) {
	const formData = await request.formData();
	const file = formData.get('file');

	if (!(file instanceof File) || !file.size) {
		return fail(400, { catalogMessage: 'Choose a file first.' });
	}

	if (file.name.toLowerCase().endsWith('.json')) {
		const rows = await readProductJsonRows(file);

		for (const row of rows) {
			await upsertImportedProduct(row);
		}

		return { catalogMessage: 'Products imported from JSON.' };
	}

	const rows = await readWorkbookRows(file);

	for (const row of rows) {
		const normalizedRow: ProductImportRow = {
			Id: row.Id || row.id ? Number(row.Id || row.id) : null,
			Code: String(row.code || row.Code || row.sku || row.SKU || '').trim(),
			Barcode: String(row.barcode || row.Barcode || '').trim(),
			Name: String(row.name || row.Name || '').trim(),
			Desc: String(row.description || row.Description || ''),
			XDim: String(row.xDim || row.XDim || row.color || row.Color || ''),
			YDim: String(row.yDim || row.YDim || ''),
			Qty: Number(row.qty || row.Qty || row.inventory || row.Inventory || 0),
			Price: Number(row.price || row.Price || 0),
			Currency: String(row.currency || row.Currency || 'USD'),
			Details: parseDetails(String(row.details || row.Details || '')),
			CategorySlug: slugify(String(row.categorySlug || row.CategorySlug || '')),
			Slug: String(row.slug || row.Slug || ''),
			SKU: String(row.sku || row.SKU || '').trim(),
			ShortDescription: String(row.shortDescription || row.ShortDescription || ''),
			Image: String(row.image || row.Image || ''),
			Gallery: String(row.gallery || row.Gallery || '')
				.split(',')
				.map((item) => item.trim())
				.filter(Boolean),
			IsFeatured: String(row.isFeatured || row.IsFeatured || '').toLowerCase() === 'true',
			OnSale: String(row.onSale || row.OnSale || '').toLowerCase() === 'true',
			IsPublished: String(row.isPublished || row.IsPublished || 'true').toLowerCase() !== 'false',
			SortOrder: Number(row.sortOrder || row.SortOrder || 0),
			CompareAtPrice:
				row.compareAtPrice || row.CompareAtPrice
					? Number(row.compareAtPrice || row.CompareAtPrice || 0)
					: null,
			Color: String(row.color || row.Color || ''),
			Material: String(row.material || row.Material || '')
		};

		await upsertImportedProduct(normalizedRow);
	}

	return { catalogMessage: 'Products imported.' };
}

export function redirectCatalogToDefault() {
	throw redirect(302, '/admin/catalog/categories');
}
