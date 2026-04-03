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

const categorySeeds = [
	{
		name: 'Shop',
		slug: 'shop',
		parentGroup: 'women',
		description:
			'A broad storefront assortment covering best-sellers, easy gifting, and everyday picks.',
		image: '/placeholder-category-2.webp',
		featured: true,
		sortOrder: 1
	},
	{
		name: 'Slippers',
		slug: 'slippers',
		parentGroup: 'women',
		description:
			'Soft indoor and relaxed daily pairs focused on comfort, softness, and easy movement.',
		image: '/placeholder-category-3.webp',
		featured: true,
		sortOrder: 2
	},
	{
		name: 'Waterproof Slides',
		slug: 'waterproof-slides',
		parentGroup: 'men',
		description: 'Fast-drying slide shapes made for poolside, travel, and easy outdoor wear.',
		image: '/placeholder-category-4.webp',
		featured: true,
		sortOrder: 3
	},
	{
		name: 'Loafers & ballerinas',
		slug: 'loafers-ballerinas',
		parentGroup: 'women',
		description:
			'Polished flats and smart silhouettes built for workwear and refined daily outfits.',
		image: '/placeholder-category-2.webp',
		featured: true,
		sortOrder: 4
	},
	{
		name: 'Espedrilles',
		slug: 'espedrilles',
		parentGroup: 'women',
		description: 'Warm-weather woven styles with casual elegance and lightweight comfort.',
		image: '/placeholder-category-3.webp',
		featured: false,
		sortOrder: 5
	},
	{
		name: 'Heeled Sandals',
		slug: 'heeled-sandals',
		parentGroup: 'women',
		description: 'Dressier heeled pairs designed for events, dinners, and elevated summer looks.',
		image: '/placeholder-category-4.webp',
		featured: true,
		sortOrder: 6
	},
	{
		name: 'Scarp',
		slug: 'scarp',
		parentGroup: 'kids',
		description: 'Assorted structured fashion styles with richer detailing and seasonal variety.',
		image: '/placeholder-category-2.webp',
		featured: false,
		sortOrder: 7
	},
	{
		name: 'Sandals',
		slug: 'sandals',
		parentGroup: 'kids',
		description:
			'Open everyday sandals balancing simple styling, comfort, and repeated seasonal demand.',
		image: '/placeholder-category-3.webp',
		featured: true,
		sortOrder: 8
	},
	{
		name: 'Brazillian collection',
		slug: 'brazillian-collection',
		parentGroup: 'women',
		description:
			'Colorful vacation-ready assortment inspired by bold styling and warm-weather dressing.',
		image: '/placeholder-category-4.webp',
		featured: false,
		sortOrder: 9
	},
	{
		name: 'Spanish collection',
		slug: 'spanish-collection',
		parentGroup: 'men',
		description:
			'Refined continental styles with woven textures, feminine lines, and dressier finish.',
		image: '/placeholder-category-2.webp',
		featured: false,
		sortOrder: 10
	}
];

const imagePool = [
	'/placeholder-product-2.webp',
	'/placeholder-product-3.webp',
	'/placeholder-product-4.webp',
	'/placeholder-product-5.webp',
	'/placeholder-product-6.webp'
];

const productSeeds = [
	{
		categorySlug: 'shop',
		name: 'Vitto Everyday Pick',
		colorFamily: ['black', 'beige', 'white'],
		sizes: ['36', '37', '38', '39'],
		price: 24,
		compareAtPrice: 30,
		imageIndex: 0,
		featured: true,
		onSale: true
	},
	{
		categorySlug: 'shop',
		name: 'Daily Motion Pair',
		colorFamily: ['tan', 'stone', 'black'],
		sizes: ['37', '38', '39', '40'],
		price: 26,
		compareAtPrice: null,
		imageIndex: 1,
		featured: true,
		onSale: false
	},
	{
		categorySlug: 'slippers',
		name: 'Cloud Soft Slipper',
		colorFamily: ['cream', 'pink', 'black'],
		sizes: ['36', '37', '38', '39'],
		price: 18,
		compareAtPrice: 22,
		imageIndex: 2,
		featured: true,
		onSale: true
	},
	{
		categorySlug: 'slippers',
		name: 'Home Cozy Step',
		colorFamily: ['taupe', 'camel', 'grey'],
		sizes: ['37', '38', '39', '40'],
		price: 19,
		compareAtPrice: null,
		imageIndex: 3,
		featured: false,
		onSale: false
	},
	{
		categorySlug: 'waterproof-slides',
		name: 'Aqua Flex Slide',
		colorFamily: ['black', 'olive', 'cream'],
		sizes: ['36', '37', '38', '39', '40'],
		price: 17,
		compareAtPrice: 21,
		imageIndex: 4,
		featured: true,
		onSale: true
	},
	{
		categorySlug: 'waterproof-slides',
		name: 'Poolside Dry Slide',
		colorFamily: ['beige', 'mint', 'black'],
		sizes: ['37', '38', '39', '40'],
		price: 18,
		compareAtPrice: null,
		imageIndex: 0,
		featured: false,
		onSale: false
	},
	{
		categorySlug: 'loafers-ballerinas',
		name: 'Milano Soft Loafer',
		colorFamily: ['black', 'camel', 'nude'],
		sizes: ['36', '37', '38', '39', '40'],
		price: 33,
		compareAtPrice: 41,
		imageIndex: 1,
		featured: true,
		onSale: true
	},
	{
		categorySlug: 'loafers-ballerinas',
		name: 'Bella Flat Ballerina',
		colorFamily: ['nude', 'black', 'red'],
		sizes: ['36', '37', '38', '39'],
		price: 31,
		compareAtPrice: null,
		imageIndex: 2,
		featured: true,
		onSale: false
	},
	{
		categorySlug: 'espedrilles',
		name: 'Costa Rope Espedrille',
		colorFamily: ['natural', 'tan', 'black'],
		sizes: ['36', '37', '38', '39', '40'],
		price: 28,
		compareAtPrice: 34,
		imageIndex: 3,
		featured: false,
		onSale: true
	},
	{
		categorySlug: 'espedrilles',
		name: 'Seaside Woven Pair',
		colorFamily: ['sand', 'white', 'camel'],
		sizes: ['37', '38', '39', '40'],
		price: 29,
		compareAtPrice: null,
		imageIndex: 4,
		featured: false,
		onSale: false
	},
	{
		categorySlug: 'heeled-sandals',
		name: 'Luna Heel Sandal',
		colorFamily: ['black', 'gold', 'nude'],
		sizes: ['36', '37', '38', '39'],
		price: 39,
		compareAtPrice: 47,
		imageIndex: 0,
		featured: true,
		onSale: true
	},
	{
		categorySlug: 'heeled-sandals',
		name: 'Event Strap Heel',
		colorFamily: ['silver', 'black', 'beige'],
		sizes: ['37', '38', '39', '40'],
		price: 41,
		compareAtPrice: null,
		imageIndex: 1,
		featured: true,
		onSale: false
	},
	{
		categorySlug: 'scarp',
		name: 'Classic Scarp Line',
		colorFamily: ['brown', 'black', 'beige'],
		sizes: ['36', '37', '38', '39', '40'],
		price: 27,
		compareAtPrice: 33,
		imageIndex: 2,
		featured: false,
		onSale: true
	},
	{
		categorySlug: 'scarp',
		name: 'Modern Scarp Lift',
		colorFamily: ['navy', 'stone', 'black'],
		sizes: ['37', '38', '39', '40'],
		price: 29,
		compareAtPrice: null,
		imageIndex: 3,
		featured: false,
		onSale: false
	},
	{
		categorySlug: 'sandals',
		name: 'Everyday Open Sandal',
		colorFamily: ['tan', 'black', 'white'],
		sizes: ['36', '37', '38', '39', '40'],
		price: 23,
		compareAtPrice: 29,
		imageIndex: 4,
		featured: true,
		onSale: true
	},
	{
		categorySlug: 'sandals',
		name: 'Minimal Comfort Sandal',
		colorFamily: ['stone', 'olive', 'cream'],
		sizes: ['37', '38', '39', '40'],
		price: 24,
		compareAtPrice: null,
		imageIndex: 0,
		featured: true,
		onSale: false
	},
	{
		categorySlug: 'brazillian-collection',
		name: 'Rio Bright Slide',
		colorFamily: ['yellow', 'pink', 'green'],
		sizes: ['36', '37', '38', '39'],
		price: 25,
		compareAtPrice: 31,
		imageIndex: 1,
		featured: false,
		onSale: true
	},
	{
		categorySlug: 'brazillian-collection',
		name: 'Copacabana Summer Pair',
		colorFamily: ['orange', 'turquoise', 'white'],
		sizes: ['37', '38', '39', '40'],
		price: 27,
		compareAtPrice: null,
		imageIndex: 2,
		featured: false,
		onSale: false
	},
	{
		categorySlug: 'spanish-collection',
		name: 'Valencia Woven Heel',
		colorFamily: ['tan', 'black', 'red'],
		sizes: ['36', '37', '38', '39'],
		price: 36,
		compareAtPrice: 44,
		imageIndex: 3,
		featured: true,
		onSale: true
	},
	{
		categorySlug: 'spanish-collection',
		name: 'Madrid Classic Flat',
		colorFamily: ['cream', 'black', 'gold'],
		sizes: ['37', '38', '39', '40'],
		price: 34,
		compareAtPrice: null,
		imageIndex: 4,
		featured: false,
		onSale: false
	}
];

function titleToSlug(value) {
	return value
		.toLowerCase()
		.replace(/&/g, 'and')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

function titleToCode(value) {
	return value
		.toUpperCase()
		.replace(/[^A-Z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

function buildDetails(seed, externalId, itemCode) {
	const details = [];
	let barcodeSequence = 1;

	for (const [colorIndex, color] of seed.colorFamily.entries()) {
		const variantImage = imagePool[(seed.imageIndex + colorIndex) % imagePool.length];
		for (const size of seed.sizes) {
			const qty = 1 + ((externalId + barcodeSequence) % 4);
			details.push({
				itemid: externalId,
				itemcode: itemCode,
				itembarcode: `${itemCode}-${String(barcodeSequence).padStart(3, '0')}`,
				itembarcodeid: null,
				itemname: seed.name,
				itemdescription: `${seed.name} ${color} ${size}`,
				xdim: color,
				ydim: size,
				qty,
				salesprice: seed.price,
				currencycode: 'USD',
				isdim: 1,
				image: variantImage
			});
			barcodeSequence += 1;
		}
	}

	return details;
}

const products = productSeeds.map((seed, index) => {
	const externalId = 5000 + index + 1;
	const slug = titleToSlug(seed.name);
	const itemCode = `VT-${String(externalId).slice(-4)}-${titleToCode(seed.categorySlug).slice(0, 4)}`;
	const details = buildDetails(seed, externalId, itemCode);
	const totalQty = details.reduce((sum, item) => sum + item.qty, 0);
	const primaryDetail = details[0];
	const primaryImage = imagePool[seed.imageIndex % imagePool.length];
	const secondaryImage = imagePool[(seed.imageIndex + 1) % imagePool.length];

	return {
		categorySlug: seed.categorySlug,
		externalId,
		code: itemCode,
		barcode: itemCode,
		name: seed.name,
		slug,
		sku: itemCode,
		shortDescription: `${seed.name} in multiple colors and sizes for a richer storefront demo.`,
		description: `${seed.name} is seeded with a full variation set so the client can test filtering, wishlist, cart variants, and admin product handling with realistic demo inventory.`,
		color: primaryDetail.xdim,
		material: 'Synthetic leather',
		xDim: primaryDetail.xdim,
		yDim: primaryDetail.ydim,
		qty: totalQty,
		price: seed.price.toFixed(2),
		currency: 'USD',
		compareAtPrice: seed.compareAtPrice ? seed.compareAtPrice.toFixed(2) : null,
		image: primaryImage,
		gallery: [primaryImage, secondaryImage],
		details,
		isFeatured: seed.featured,
		onSale: seed.onSale,
		isPublished: true,
		sortOrder: index + 1
	};
});

const sampleOrder = {
	orderNumber: 'VS-DEMO-2001',
	status: 'pending',
	customerName: 'Demo Customer',
	customerPhone: '+961 70 000 000',
	customerEmail: 'demo@example.com',
	customerCity: 'Beirut',
	customerAddress: 'Hamra Street, Building 12',
	notes: 'Please confirm color availability on WhatsApp before delivery.',
	subtotal: '73.00',
	total: '73.00'
};

const sampleOrderItems = [
	{ sku: products[0].sku, quantity: 1, unitPrice: products[0].price, lineTotal: products[0].price },
	{
		sku: products[10].sku,
		quantity: 1,
		unitPrice: products[10].price,
		lineTotal: products[10].price
	}
];

sampleOrder.whatsappMessage = [
	`New order ${sampleOrder.orderNumber}`,
	`Name: ${sampleOrder.customerName}`,
	`Phone: ${sampleOrder.customerPhone}`,
	'Items:',
	`- ${products[0].name} x1 = $${products[0].price}`,
	`- ${products[10].name} x1 = $${products[10].price}`,
	`Total: $${sampleOrder.total}`
].join('\n');

try {
	await sql.begin(async (tx) => {
		try {
			await tx`delete from wishlist_item`;
		} catch (error) {
			if (!String(error).includes('wishlist_item')) {
				throw error;
			}
		}
		await tx`delete from order_item`;
		await tx`delete from "order"`;
		await tx`delete from product`;
		await tx`delete from category`;

		for (const item of categorySeeds) {
			await tx`
				insert into category (name, slug, description, image, featured, parent_group, sort_order)
				values (${item.name}, ${item.slug}, ${item.description}, ${item.image}, ${item.featured}, ${item.parentGroup}, ${item.sortOrder})
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
			`;
		}

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
			insert into "user" (id, name, email, email_verified, image, role, phone, city, address, created_at, updated_at)
			values (gen_random_uuid()::text, ${adminUser.name}, lower(${adminUser.email}), true, null, 'admin', '', '', '', now(), now())
			returning id
		`;
		adminUserId = createdUser.id;
	} else {
		await sql`
			update "user"
			set name = ${adminUser.name}, email = lower(${adminUser.email}), email_verified = true, role = 'admin', updated_at = now()
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
	console.log(`Categories: ${categorySeeds.length}`);
	console.log(`Products: ${products.length}`);
	console.log(`Admin email: ${adminUser.email}`);
	console.log(`Admin password: ${adminUser.password}`);
} catch (error) {
	console.error(error);
	process.exitCode = 1;
} finally {
	await sql.end();
}
