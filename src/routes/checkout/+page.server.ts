import { and, eq, inArray } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { product, order, orderItem } from '$lib/server/db/schema';

export const load: PageServerLoad = async () => ({});

function asString(formData: FormData, key: string) {
	return formData.get(key)?.toString().trim() ?? '';
}

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const name = asString(formData, 'name');
		const phone = asString(formData, 'phone');
		const email = asString(formData, 'email');
		const city = asString(formData, 'city');
		const address = asString(formData, 'address');
		const notes = asString(formData, 'notes');
		const rawItems = asString(formData, 'items');

		if (!name || !phone || !address || !rawItems) {
			return fail(400, { message: 'Name, phone, address, and cart items are required.' });
		}

		const parsedItems = JSON.parse(rawItems) as Array<{ productId: string; quantity: number }>;
		const productIds = parsedItems.map((item) => item.productId);

		if (!productIds.length) {
			return fail(400, { message: 'Your cart is empty.' });
		}

		const products = await db
			.select()
			.from(product)
			.where(and(inArray(product.id, productIds), eq(product.isPublished, true)));

		if (products.length !== parsedItems.length) {
			return fail(400, { message: 'Some products are no longer available.' });
		}

		const checkoutItems = parsedItems.map((item) => {
			const match = products.find((entry) => entry.id === item.productId)!;
			const quantity = Math.max(1, item.quantity);
			const unitPrice = Number(match.price);
			return {
				productId: match.id,
				name: match.name,
				slug: match.slug,
				image: match.image,
				quantity,
				unitPrice,
				lineTotal: unitPrice * quantity
			};
		});

		const subtotal = checkoutItems.reduce((sum, item) => sum + item.lineTotal, 0);
		const orderNumber = `VS-${Date.now().toString().slice(-8)}`;
		const messageLines = [
			`New order ${orderNumber}`,
			`Name: ${name}`,
			`Phone: ${phone}`,
			email ? `Email: ${email}` : '',
			city ? `City: ${city}` : '',
			`Address: ${address}`,
			notes ? `Notes: ${notes}` : '',
			'Items:',
			...checkoutItems.map(
				(item) => `- ${item.name} x${item.quantity} = $${item.lineTotal.toFixed(2)}`
			),
			`Total: $${subtotal.toFixed(2)}`
		].filter(Boolean);

		const whatsappMessage = messageLines.join('\n');
		const whatsappNumber = env.WHATSAPP_NUMBER || '96100000000';

		const [createdOrder] = await db
			.insert(order)
			.values({
				orderNumber,
				customerName: name,
				customerPhone: phone,
				customerEmail: email,
				customerCity: city,
				customerAddress: address,
				notes,
				whatsappMessage,
				subtotal: subtotal.toFixed(2),
				total: subtotal.toFixed(2)
			})
			.returning();

		await db.insert(orderItem).values(
			checkoutItems.map((item) => ({
				orderId: createdOrder.id,
				productId: item.productId,
				productName: item.name,
				productSlug: item.slug,
				productImage: item.image,
				unitPrice: item.unitPrice.toFixed(2),
				quantity: item.quantity,
				lineTotal: item.lineTotal.toFixed(2)
			}))
		);

		throw redirect(
			303,
			`/checkout/success?order=${createdOrder.orderNumber}&whatsapp=${encodeURIComponent(
				`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`
			)}`
		);
	}
};
