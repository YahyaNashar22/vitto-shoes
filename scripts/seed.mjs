import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import postgres from 'postgres';
import { hashPassword } from 'better-auth/crypto';

function loadEnvFile() {
	const envPath = path.resolve('.env');
	if (!fs.existsSync(envPath)) return;

	const contents = fs.readFileSync(envPath, 'utf8');
	for (const line of contents.split(/\r?\n/)) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;

		const separatorIndex = trimmed.indexOf('=');
		if (separatorIndex === -1) continue;

		const key = trimmed.slice(0, separatorIndex).trim();
		const rawValue = trimmed.slice(separatorIndex + 1).trim();
		const value = rawValue.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');

		if (!(key in process.env)) {
			process.env[key] = value;
		}
	}
}

loadEnvFile();

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL is required to run the seed script.');
}

const sql = postgres(process.env.DATABASE_URL);
const adminUser = {
	name: process.env.SEED_ADMIN_NAME || 'Vitto Owner',
	email: process.env.SEED_ADMIN_EMAIL || 'owner@vitto-shoes.local',
	password: process.env.SEED_ADMIN_PASSWORD || 'VittoAdmin123!'
};

const categories = [
	{
		name: 'New Arrivals',
		slug: 'new-arrivals',
		description: 'Fresh everyday styles with clean silhouettes and strong monochrome presentation.',
		image: '/placeholder-category.svg',
		featured: true,
		sortOrder: 1
	},
	{
		name: 'Loafers',
		slug: 'loafers',
		description: 'Smart low-profile pairs designed for polished casual outfits.',
		image: '/placeholder-category.svg',
		featured: true,
		sortOrder: 2
	},
	{
		name: 'Sandals',
		slug: 'sandals',
		description: 'Comfort-first sandals built for lightweight everyday wear.',
		image: '/placeholder-category.svg',
		featured: true,
		sortOrder: 3
	},
	{
		name: 'Sale',
		slug: 'sale',
		description: 'Discounted pieces used to demonstrate promo filters and merchandising.',
		image: '/placeholder-category.svg',
		featured: false,
		sortOrder: 4
	}
];

const products = [
	{
		categorySlug: 'new-arrivals',
		externalId: 1001,
		code: 'VS-1001',
		barcode: 'VS-1001',
		name: 'Siena Soft Step',
		slug: 'siena-soft-step',
		sku: 'VS-1001',
		shortDescription: 'Minimal slip-on style with cushioned support.',
		description:
			'A lightweight daily pair finished in a clean black-and-white storefront presentation.',
		color: 'Black',
		material: 'Soft faux leather',
		xDim: 'black',
		yDim: '38',
		qty: 14,
		price: '79.00',
		currency: 'USD',
		compareAtPrice: '95.00',
		image: '/placeholder-product.svg',
		gallery: ['/placeholder-product.svg'],
		details: [],
		isFeatured: true,
		onSale: true,
		isPublished: true,
		sortOrder: 1
	},
	{
		categorySlug: 'new-arrivals',
		externalId: 1002,
		code: 'VS-1002',
		barcode: 'VS-1002',
		name: 'Verona Street Ease',
		slug: 'verona-street-ease',
		sku: 'VS-1002',
		shortDescription: 'Rounded casual profile with everyday comfort.',
		description: 'Designed for long wear and fast catalog scans with neutral merchandising.',
		color: 'White',
		material: 'Matte synthetic',
		xDim: 'white',
		yDim: '39',
		qty: 11,
		price: '84.00',
		currency: 'USD',
		compareAtPrice: null,
		image: '/placeholder-product.svg',
		gallery: ['/placeholder-product.svg'],
		details: [],
		isFeatured: true,
		onSale: false,
		isPublished: true,
		sortOrder: 2
	},
	{
		categorySlug: 'loafers',
		externalId: 2001,
		code: 'VS-2001',
		barcode: 'VS-2001',
		name: 'Milano Penny Edit',
		slug: 'milano-penny-edit',
		sku: 'VS-2001',
		shortDescription: 'Classic loafer shape with a refined soft finish.',
		description: 'A polished loafer with enough structure for formal wear and day-long comfort.',
		color: 'Black',
		material: 'Premium synthetic',
		xDim: 'black',
		yDim: '41',
		qty: 9,
		price: '92.00',
		currency: 'USD',
		compareAtPrice: '108.00',
		image: '/placeholder-product.svg',
		gallery: ['/placeholder-product.svg'],
		details: [],
		isFeatured: true,
		onSale: true,
		isPublished: true,
		sortOrder: 1
	},
	{
		categorySlug: 'sandals',
		externalId: 3001,
		code: 'VS-3001',
		barcode: 'VS-3001',
		name: 'Luna Cross Strap',
		slug: 'luna-cross-strap',
		sku: 'VS-3001',
		shortDescription: 'Easy warm-weather pair with padded comfort.',
		description: 'A clean demo product with variant details for import/export testing.',
		color: 'Beige',
		material: 'Soft strap synthetic',
		xDim: 'beige',
		yDim: '',
		qty: 20,
		price: '61.00',
		currency: 'USD',
		compareAtPrice: '74.00',
		image: '/placeholder-product.svg',
		gallery: ['/placeholder-product.svg'],
		details: [
			{
				itemid: 3001,
				itemcode: 'VS-3001',
				itembarcode: 'VS-3001-37',
				itembarcodeid: null,
				itemname: 'Luna Cross Strap',
				itemdescription: '',
				xdim: 'beige',
				ydim: '37',
				qty: 1,
				salesprice: 61,
				currencycode: 'USD',
				isdim: 1
			},
			{
				itemid: 3001,
				itemcode: 'VS-3001',
				itembarcode: 'VS-3001-38',
				itembarcodeid: null,
				itemname: 'Luna Cross Strap',
				itemdescription: '',
				xdim: 'beige',
				ydim: '38',
				qty: 1,
				salesprice: 61,
				currencycode: 'USD',
				isdim: 1
			}
		],
		isFeatured: true,
		onSale: true,
		isPublished: true,
		sortOrder: 1
	},
	{
		categorySlug: 'sale',
		externalId: 4001,
		code: 'VS-4001',
		barcode: 'VS-4001',
		name: 'Aster Weekend Pair',
		slug: 'aster-weekend-pair',
		sku: 'VS-4001',
		shortDescription: 'Discounted casual pair for the dedicated sale page.',
		description: 'Useful for testing sale labels, promo pages, and admin reporting.',
		color: 'Grey',
		material: 'Textured synthetic',
		xDim: 'grey',
		yDim: '40',
		qty: 7,
		price: '49.00',
		currency: 'USD',
		compareAtPrice: '69.00',
		image: '/placeholder-product.svg',
		gallery: ['/placeholder-product.svg'],
		details: [],
		isFeatured: false,
		onSale: true,
		isPublished: true,
		sortOrder: 1
	}
];

const sampleOrder = {
	orderNumber: 'VS-DEMO-1001',
	status: 'pending',
	customerName: 'Demo Customer',
	customerPhone: '+961 70 000 000',
	customerEmail: 'demo@example.com',
	customerCity: 'Beirut',
	customerAddress: 'Hamra Street, Building 12',
	notes: 'Please confirm on WhatsApp before delivery.',
	whatsappMessage:
		'New order VS-DEMO-1001\nName: Demo Customer\nPhone: +961 70 000 000\nItems:\n- Siena Soft Step x1 = $79.00\n- Luna Cross Strap x2 = $122.00\nTotal: $201.00',
	subtotal: '201.00',
	total: '201.00'
};

const sampleOrderItems = [
	{ sku: 'VS-1001', quantity: 1, unitPrice: '79.00', lineTotal: '79.00' },
	{ sku: 'VS-3001', quantity: 2, unitPrice: '61.00', lineTotal: '122.00' }
];

try {
	await sql.begin(async (tx) => {
		for (const item of categories) {
			await tx`
				insert into category (name, slug, description, image, featured, sort_order)
				values (${item.name}, ${item.slug}, ${item.description}, ${item.image}, ${item.featured}, ${item.sortOrder})
				on conflict (slug) do update set
					name = excluded.name,
					description = excluded.description,
					image = excluded.image,
					featured = excluded.featured,
					sort_order = excluded.sort_order
			`;
		}

		const categoryRows = await tx`select id, slug from category`;
		const categoryMap = new Map(categoryRows.map((row) => [row.slug, row.id]));

		for (const item of products) {
			const categoryId = categoryMap.get(item.categorySlug);
			if (!categoryId) {
				throw new Error(`Missing category for product seed: ${item.categorySlug}`);
			}

			await tx`
				insert into product (
					category_id, external_id, code, barcode, name, slug, sku, short_description,
					description, color, material, x_dim, y_dim, qty, price, currency, compare_at_price,
					image, gallery, details, is_featured, on_sale, is_published, inventory, sort_order
				)
				values (
					${categoryId}, ${item.externalId}, ${item.code}, ${item.barcode}, ${item.name},
					${item.slug}, ${item.sku}, ${item.shortDescription}, ${item.description}, ${item.color},
					${item.material}, ${item.xDim}, ${item.yDim}, ${item.qty}, ${item.price}, ${item.currency},
					${item.compareAtPrice}, ${item.image}, ${JSON.stringify(item.gallery)}::jsonb,
					${JSON.stringify(item.details)}::jsonb, ${item.isFeatured}, ${item.onSale},
					${item.isPublished}, ${item.qty}, ${item.sortOrder}
				)
				on conflict (sku) do update set
					category_id = excluded.category_id,
					external_id = excluded.external_id,
					code = excluded.code,
					barcode = excluded.barcode,
					name = excluded.name,
					slug = excluded.slug,
					short_description = excluded.short_description,
					description = excluded.description,
					color = excluded.color,
					material = excluded.material,
					x_dim = excluded.x_dim,
					y_dim = excluded.y_dim,
					qty = excluded.qty,
					price = excluded.price,
					currency = excluded.currency,
					compare_at_price = excluded.compare_at_price,
					image = excluded.image,
					gallery = excluded.gallery,
					details = excluded.details,
					is_featured = excluded.is_featured,
					on_sale = excluded.on_sale,
					is_published = excluded.is_published,
					inventory = excluded.inventory,
					sort_order = excluded.sort_order
			`;
		}

		await tx`delete from order_item where order_id in (select id from "order" where order_number = ${sampleOrder.orderNumber})`;
		await tx`delete from "order" where order_number = ${sampleOrder.orderNumber}`;

		const [createdOrder] = await tx`
			insert into "order" (
				order_number, status, customer_name, customer_phone, customer_email, customer_city,
				customer_address, notes, whatsapp_message, subtotal, total
			)
			values (
				${sampleOrder.orderNumber}, ${sampleOrder.status}, ${sampleOrder.customerName},
				${sampleOrder.customerPhone}, ${sampleOrder.customerEmail}, ${sampleOrder.customerCity},
				${sampleOrder.customerAddress}, ${sampleOrder.notes}, ${sampleOrder.whatsappMessage},
				${sampleOrder.subtotal}, ${sampleOrder.total}
			)
			returning id
		`;

		const productRows = await tx`select id, sku, name, slug, image from product`;
		const productMap = new Map(productRows.map((row) => [row.sku, row]));

		for (const item of sampleOrderItems) {
			const product = productMap.get(item.sku);
			if (!product) {
				throw new Error(`Missing product for order seed: ${item.sku}`);
			}

			await tx`
				insert into order_item (
					order_id, product_id, product_name, product_slug, product_image, unit_price, quantity, line_total
				)
				values (
					${createdOrder.id}, ${product.id}, ${product.name}, ${product.slug}, ${product.image},
					${item.unitPrice}, ${item.quantity}, ${item.lineTotal}
				)
			`;
		}
	});

	const hashedPassword = await hashPassword(adminUser.password);

	const [existingAdmin] = await sql`
		select u.id
		from "user" u
		where lower(u.email) = lower(${adminUser.email})
		limit 1
	`;

	let adminUserId = existingAdmin?.id;

	if (!adminUserId) {
		const [createdUser] = await sql`
			insert into "user" (id, name, email, email_verified, image, created_at, updated_at)
			values (gen_random_uuid()::text, ${adminUser.name}, lower(${adminUser.email}), true, null, now(), now())
			returning id
		`;
		adminUserId = createdUser.id;
	} else {
		await sql`
			update "user"
			set name = ${adminUser.name}, email = lower(${adminUser.email}), email_verified = true, updated_at = now()
			where id = ${adminUserId}
		`;
	}

	await sql`
		delete from account
		where user_id = ${adminUserId} and provider_id = 'credential'
	`;

	await sql`
		insert into account (id, account_id, provider_id, user_id, password, created_at, updated_at)
		values (gen_random_uuid()::text, ${adminUserId}, 'credential', ${adminUserId}, ${hashedPassword}, now(), now())
	`;

	console.log('Seed completed successfully.');
	console.log(`Admin email: ${adminUser.email}`);
	console.log(`Admin password: ${adminUser.password}`);
} catch (error) {
	console.error(error);
	process.exitCode = 1;
} finally {
	await sql.end();
}
