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
		name: 'City Essentials',
		slug: 'city-essentials',
		description:
			'Everyday pairs built for clean styling, fast browsing, and consistent best-seller appeal.',
		image: '/placeholder-category-2.webp',
		featured: true,
		sortOrder: 1
	},
	{
		name: 'Refined Classics',
		slug: 'refined-classics',
		description:
			'Sharper silhouettes for dressed-up outfits, office wear, and polished daily looks.',
		image: '/placeholder-category-3.webp',
		featured: true,
		sortOrder: 2
	},
	{
		name: 'Weekend Comfort',
		slug: 'weekend-comfort',
		description:
			'Relaxed options that still look put together, ideal for casual rotation and easy movement.',
		image: '/placeholder-category-4.webp',
		featured: true,
		sortOrder: 3
	},
	{
		name: 'Sale',
		slug: 'sale',
		description:
			'Discounted pairs used to drive promo browsing, sale badges, and markdown sections.',
		image: '/placeholder-category-2.webp',
		featured: false,
		sortOrder: 4
	}
];

const products = [
	{
		categorySlug: 'city-essentials',
		externalId: 1001,
		code: 'VS-1001',
		barcode: 'VS-1001',
		name: 'Promax Street Move',
		slug: 'promax-street-move',
		sku: 'VS-1001',
		shortDescription: 'A versatile daily pair with a clean profile and all-day wearability.',
		description:
			'Designed for quick movement, clean styling, and dependable comfort across daily city use.',
		color: 'Black',
		material: 'Soft faux leather',
		xDim: 'black',
		yDim: '38',
		qty: 14,
		price: '79.00',
		currency: 'USD',
		compareAtPrice: '95.00',
		image: '/placeholder-product-2.webp',
		gallery: ['/placeholder-product-2.webp'],
		details: [],
		isFeatured: true,
		onSale: true,
		isPublished: true,
		sortOrder: 1
	},
	{
		categorySlug: 'city-essentials',
		externalId: 1002,
		code: 'VS-1002',
		barcode: 'VS-1002',
		name: 'Nova Glide Runner',
		slug: 'nova-glide-runner',
		sku: 'VS-1002',
		shortDescription: 'Soft everyday runner with a flexible sole and clean upper.',
		description:
			'A casual best-seller style that works well for lightweight use and fast-moving catalog pages.',
		color: 'White',
		material: 'Matte synthetic',
		xDim: 'white',
		yDim: '39',
		qty: 11,
		price: '84.00',
		currency: 'USD',
		compareAtPrice: null,
		image: '/placeholder-product-3.webp',
		gallery: ['/placeholder-product-3.webp'],
		details: [],
		isFeatured: true,
		onSale: false,
		isPublished: true,
		sortOrder: 2
	},
	{
		categorySlug: 'refined-classics',
		externalId: 2001,
		code: 'VS-2001',
		barcode: 'VS-2001',
		name: 'Milano Office Loafer',
		slug: 'milano-office-loafer',
		sku: 'VS-2001',
		shortDescription: 'A polished loafer with a balanced shape and comfortable structure.',
		description:
			'Built for dressed-up looks without feeling too rigid, ideal for formal and smart casual wear.',
		color: 'Black',
		material: 'Premium synthetic',
		xDim: 'black',
		yDim: '41',
		qty: 9,
		price: '92.00',
		currency: 'USD',
		compareAtPrice: '108.00',
		image: '/placeholder-product-4.webp',
		gallery: ['/placeholder-product-4.webp'],
		details: [],
		isFeatured: true,
		onSale: true,
		isPublished: true,
		sortOrder: 1
	},
	{
		categorySlug: 'weekend-comfort',
		externalId: 3001,
		code: 'VS-3001',
		barcode: 'VS-3001',
		name: 'Luna Comfort Slide',
		slug: 'luna-comfort-slide',
		sku: 'VS-3001',
		shortDescription: 'An easy comfort-first option with a clean relaxed shape.',
		description:
			'A practical casual pair that also carries size and color details for import and export testing.',
		color: 'Stone',
		material: 'Soft strap synthetic',
		xDim: 'stone',
		yDim: '',
		qty: 20,
		price: '61.00',
		currency: 'USD',
		compareAtPrice: '74.00',
		image: '/placeholder-product-5.webp',
		gallery: ['/placeholder-product-5.webp'],
		details: [
			{
				itemid: 3001,
				itemcode: 'VS-3001',
				itembarcode: 'VS-3001-37',
				itembarcodeid: null,
				itemname: 'Luna Comfort Slide',
				itemdescription: '',
				xdim: 'stone',
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
				itemname: 'Luna Comfort Slide',
				itemdescription: '',
				xdim: 'stone',
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
		name: 'Aster Sale Sneaker',
		slug: 'aster-sale-sneaker',
		sku: 'VS-4001',
		shortDescription: 'Markdown-ready everyday sneaker for promo-heavy catalog sections.',
		description:
			'Seeded specifically for sale merchandising, comparison prices, and homepage promo placement.',
		color: 'Grey',
		material: 'Textured synthetic',
		xDim: 'grey',
		yDim: '40',
		qty: 7,
		price: '49.00',
		currency: 'USD',
		compareAtPrice: '69.00',
		image: '/placeholder-product-6.webp',
		gallery: ['/placeholder-product-6.webp'],
		details: [],
		isFeatured: false,
		onSale: true,
		isPublished: true,
		sortOrder: 1
	},
	{
		categorySlug: 'refined-classics',
		externalId: 2002,
		code: 'VS-2002',
		barcode: 'VS-2002',
		name: 'Sarto Clean Derby',
		slug: 'sarto-clean-derby',
		sku: 'VS-2002',
		shortDescription: 'Structured derby profile with a clean toe and slim proportions.',
		description:
			'A sharper catalog option that rounds out the formal section and uses the remaining product artwork.',
		color: 'Black',
		material: 'Smooth synthetic',
		xDim: 'black',
		yDim: '42',
		qty: 8,
		price: '99.00',
		currency: 'USD',
		compareAtPrice: null,
		image: '/placeholder-product-2.webp',
		gallery: ['/placeholder-product-2.webp'],
		details: [],
		isFeatured: false,
		onSale: false,
		isPublished: true,
		sortOrder: 2
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
		'New order VS-DEMO-1001\nName: Demo Customer\nPhone: +961 70 000 000\nItems:\n- Promax Street Move x1 = $79.00\n- Luna Comfort Slide x2 = $122.00\nTotal: $201.00',
	subtotal: '201.00',
	total: '201.00'
};

const sampleOrderItems = [
	{ sku: 'VS-1001', quantity: 1, unitPrice: '79.00', lineTotal: '79.00' },
	{ sku: 'VS-3001', quantity: 2, unitPrice: '61.00', lineTotal: '122.00' }
];

try {
	await sql.begin(async (tx) => {
		await tx`delete from order_item`;
		await tx`delete from "order"`;
		await tx`delete from product`;
		await tx`delete from category`;

		for (const item of categories) {
			await tx`
				insert into category (name, slug, description, image, featured, sort_order)
				values (${item.name}, ${item.slug}, ${item.description}, ${item.image}, ${item.featured}, ${item.sortOrder})
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
