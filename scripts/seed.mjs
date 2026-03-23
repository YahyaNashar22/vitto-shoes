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
	name: 'Vitto Owner',
	email: 'owner@vitto-shoes.local',
	password: 'VittoAdmin123!'
};

const categories = [
	{
		name: 'New Arrivals',
		slug: 'new-arrivals',
		description: 'Fresh everyday styles with clean silhouettes and soft neutral finishes.',
		image: '/placeholder-category.svg',
		featured: true,
		sort_order: 1
	},
	{
		name: 'Loafers',
		slug: 'loafers',
		description: 'Smart low-profile pairs designed for office looks and polished casual outfits.',
		image: '/placeholder-category.svg',
		featured: true,
		sort_order: 2
	},
	{
		name: 'Sandals',
		slug: 'sandals',
		description: 'Comfort-first sandals with warm tones and lightweight soles.',
		image: '/placeholder-category.svg',
		featured: true,
		sort_order: 3
	},
	{
		name: 'Sale',
		slug: 'sale',
		description: 'Discounted pieces for promotion sections and WhatsApp-first fast orders.',
		image: '/placeholder-category.svg',
		featured: false,
		sort_order: 4
	}
];

const products = [
	{
		categorySlug: 'new-arrivals',
		name: 'Siena Soft Step',
		slug: 'siena-soft-step',
		sku: 'VS-1001',
		shortDescription: 'Minimal slip-on style with cushioned support.',
		description:
			'A lightweight daily pair finished in a warm oat tone. Built for clean styling and easy first-time browsing demos.',
		color: 'Oat Beige',
		material: 'Soft faux leather',
		price: '79.00',
		compareAtPrice: '95.00',
		image: '/placeholder-product.jpg',
		gallery: ['/placeholder-product.jpg'],
		isFeatured: true,
		onSale: true,
		isPublished: true,
		inventory: 14,
		sortOrder: 1
	},
	{
		categorySlug: 'new-arrivals',
		name: 'Verona Street Ease',
		slug: 'verona-street-ease',
		sku: 'VS-1002',
		shortDescription: 'Rounded casual profile with everyday comfort.',
		description:
			'Designed for long wear and fast catalog scans, with warm neutral tones inspired by luxury storefront palettes.',
		color: 'Sand',
		material: 'Matte synthetic',
		price: '84.00',
		compareAtPrice: null,
		image: '/placeholder-product.jpg',
		gallery: ['/placeholder-product.jpg'],
		isFeatured: true,
		onSale: false,
		isPublished: true,
		inventory: 11,
		sortOrder: 2
	},
	{
		categorySlug: 'loafers',
		name: 'Milano Penny Edit',
		slug: 'milano-penny-edit',
		sku: 'VS-2001',
		shortDescription: 'Classic loafer shape with a refined soft finish.',
		description:
			'A polished loafer with enough structure for formal wear and enough comfort for day-long use.',
		color: 'Mocha',
		material: 'Premium synthetic',
		price: '92.00',
		compareAtPrice: '108.00',
		image: '/placeholder-product.jpg',
		gallery: ['/placeholder-product.jpg'],
		isFeatured: true,
		onSale: true,
		isPublished: true,
		inventory: 9,
		sortOrder: 1
	},
	{
		categorySlug: 'loafers',
		name: 'Porto Daily Loafer',
		slug: 'porto-daily-loafer',
		sku: 'VS-2002',
		shortDescription: 'Flexible fit for a balanced work-to-weekend look.',
		description:
			'Neutral styling, simple detailing, and a product setup that demonstrates category filtering and related product sections.',
		color: 'Stone Taupe',
		material: 'Brushed synthetic',
		price: '88.00',
		compareAtPrice: null,
		image: '/placeholder-product.jpg',
		gallery: ['/placeholder-product.jpg'],
		isFeatured: false,
		onSale: false,
		isPublished: true,
		inventory: 16,
		sortOrder: 2
	},
	{
		categorySlug: 'sandals',
		name: 'Luna Cross Strap',
		slug: 'luna-cross-strap',
		sku: 'VS-3001',
		shortDescription: 'Easy warm-weather pair with padded comfort.',
		description:
			'A soft neutral sandal that works well for collection pages, sale styling, and homepage feature slots.',
		color: 'Cream',
		material: 'Soft strap synthetic',
		price: '61.00',
		compareAtPrice: '74.00',
		image: '/placeholder-product.jpg',
		gallery: ['/placeholder-product.jpg'],
		isFeatured: true,
		onSale: true,
		isPublished: true,
		inventory: 20,
		sortOrder: 1
	},
	{
		categorySlug: 'sandals',
		name: 'Nora Slide Form',
		slug: 'nora-slide-form',
		sku: 'VS-3002',
		shortDescription: 'Minimal flat sandal for simple everyday styling.',
		description:
			'Built as a clean demo product with enough data for the storefront, cart, checkout, and admin export flows.',
		color: 'Latte',
		material: 'Smooth synthetic',
		price: '58.00',
		compareAtPrice: null,
		image: '/placeholder-product.jpg',
		gallery: ['/placeholder-product.jpg'],
		isFeatured: false,
		onSale: false,
		isPublished: true,
		inventory: 18,
		sortOrder: 2
	},
	{
		categorySlug: 'sale',
		name: 'Aster Weekend Pair',
		slug: 'aster-weekend-pair',
		sku: 'VS-4001',
		shortDescription: 'Discounted casual pair for the dedicated sale page.',
		description:
			'This item exists mainly to prove out the sale route, filtered catalog views, and admin reporting.',
		color: 'Warm Beige',
		material: 'Textured synthetic',
		price: '49.00',
		compareAtPrice: '69.00',
		image: '/placeholder-product.jpg',
		gallery: ['/placeholder-product.jpg'],
		isFeatured: false,
		onSale: true,
		isPublished: true,
		inventory: 7,
		sortOrder: 1
	},
	{
		categorySlug: 'sale',
		name: 'Terra Comfort Walk',
		slug: 'terra-comfort-walk',
		sku: 'VS-4002',
		shortDescription: 'Soft neutral promo item with limited stock.',
		description:
			'Useful for testing sale labels, checkout totals, and low-inventory product states in the admin catalog.',
		color: 'Clay',
		material: 'Soft-grain synthetic',
		price: '52.00',
		compareAtPrice: '72.00',
		image: '/placeholder-product.jpg',
		gallery: ['/placeholder-product.jpg'],
		isFeatured: false,
		onSale: true,
		isPublished: true,
		inventory: 5,
		sortOrder: 2
	}
];

const sampleOrder = {
	order_number: 'VS-DEMO-1001',
	status: 'pending',
	customer_name: 'Demo Customer',
	customer_phone: '+961 70 000 000',
	customer_email: 'demo@example.com',
	customer_city: 'Beirut',
	customer_address: 'Hamra Street, Building 12',
	notes: 'Please confirm on WhatsApp before delivery.',
	whatsapp_message:
		'New order VS-DEMO-1001\nName: Demo Customer\nPhone: +961 70 000 000\nItems:\n- Siena Soft Step x1 = $79.00\n- Luna Cross Strap x2 = $122.00\nTotal: $201.00',
	subtotal: '201.00',
	total: '201.00'
};

const sampleOrderItems = [
	{ sku: 'VS-1001', quantity: 1, unit_price: '79.00', line_total: '79.00' },
	{ sku: 'VS-3001', quantity: 2, unit_price: '61.00', line_total: '122.00' }
];

try {
	await sql.begin(async (tx) => {
		for (const category of categories) {
			await tx`
				insert into category (name, slug, description, image, featured, sort_order)
				values (${category.name}, ${category.slug}, ${category.description}, ${category.image}, ${category.featured}, ${category.sort_order})
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

		for (const product of products) {
			const categoryId = categoryMap.get(product.categorySlug);
			if (!categoryId) {
				throw new Error(`Missing category for product seed: ${product.categorySlug}`);
			}

			await tx`
				insert into product (
					category_id, name, slug, sku, short_description, description, color, material, price,
					compare_at_price, image, gallery, is_featured, on_sale, is_published, inventory, sort_order
				)
				values (
					${categoryId}, ${product.name}, ${product.slug}, ${product.sku}, ${product.shortDescription},
					${product.description}, ${product.color}, ${product.material}, ${product.price},
					${product.compareAtPrice}, ${product.image}, ${JSON.stringify(product.gallery)}::jsonb,
					${product.isFeatured}, ${product.onSale}, ${product.isPublished}, ${product.inventory}, ${product.sortOrder}
				)
				on conflict (sku) do update set
					category_id = excluded.category_id,
					name = excluded.name,
					slug = excluded.slug,
					short_description = excluded.short_description,
					description = excluded.description,
					color = excluded.color,
					material = excluded.material,
					price = excluded.price,
					compare_at_price = excluded.compare_at_price,
					image = excluded.image,
					gallery = excluded.gallery,
					is_featured = excluded.is_featured,
					on_sale = excluded.on_sale,
					is_published = excluded.is_published,
					inventory = excluded.inventory,
					sort_order = excluded.sort_order
			`;
		}

		await tx`delete from order_item where order_id in (select id from "order" where order_number = ${sampleOrder.order_number})`;
		await tx`delete from "order" where order_number = ${sampleOrder.order_number}`;

		const [createdOrder] = await tx`
			insert into "order" (
				order_number, status, customer_name, customer_phone, customer_email, customer_city,
				customer_address, notes, whatsapp_message, subtotal, total
			)
			values (
				${sampleOrder.order_number}, ${sampleOrder.status}, ${sampleOrder.customer_name},
				${sampleOrder.customer_phone}, ${sampleOrder.customer_email}, ${sampleOrder.customer_city},
				${sampleOrder.customer_address}, ${sampleOrder.notes}, ${sampleOrder.whatsapp_message},
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
					${item.unit_price}, ${item.quantity}, ${item.line_total}
				)
			`;
		}
	});

	const [hashedPassword] = await Promise.all([hashPassword(adminUser.password)]);

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
			values (gen_random_uuid(), ${adminUser.name}, lower(${adminUser.email}), true, null, now(), now())
			returning id
		`;
		adminUserId = createdUser.id;
	}

	await sql`
		delete from account
		where user_id = ${adminUserId} and provider_id = 'credential'
	`;

	await sql`
		insert into account (id, account_id, provider_id, user_id, password, created_at, updated_at)
		values (gen_random_uuid(), ${adminUserId}, 'credential', ${adminUserId}, ${hashedPassword}, now(), now())
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
