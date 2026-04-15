import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { ORDER_STATUSES } from '$lib/constants';
import { getAdminOrdersByTime, type AdminOrderTimeFilter } from '$lib/server/catalog';
import { db } from '$lib/server/db';
import { order } from '$lib/server/db/schema';

const ORDER_TIME_FILTERS = ['all', 'today', '7d', '30d', 'year'] as const;

function asTimeFilter(value: string | null): AdminOrderTimeFilter {
	return ORDER_TIME_FILTERS.includes(value as AdminOrderTimeFilter)
		? (value as AdminOrderTimeFilter)
		: 'all';
}

export const load: PageServerLoad = async ({ url }) => {
	const timeFilter = asTimeFilter(url.searchParams.get('time'));

	return {
		orders: await getAdminOrdersByTime(timeFilter),
		statuses: ORDER_STATUSES,
		timeFilter,
		timeFilterOptions: ORDER_TIME_FILTERS
	};
};

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
