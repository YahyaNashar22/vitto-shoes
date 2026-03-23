import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { ORDER_STATUSES } from '$lib/constants';
import { getAdminOrders } from '$lib/server/catalog';
import { db } from '$lib/server/db';
import { order } from '$lib/server/db/schema';

export const load: PageServerLoad = async () => ({
	orders: await getAdminOrders(),
	statuses: ORDER_STATUSES
});

export const actions: Actions = {
	updateStatus: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString() ?? '';
		const status = formData.get('status')?.toString() ?? '';

		if (!id || !ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
			return fail(400, { ordersMessage: 'Invalid order update.' });
		}

		await db
			.update(order)
			.set({ status: status as (typeof ORDER_STATUSES)[number] })
			.where(eq(order.id, id));

		return { ordersMessage: 'Order status updated.' };
	}
};
