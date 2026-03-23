import type { PageServerLoad } from './$types';
import { getAdminOrders, getAdminProducts, getCategories } from '$lib/server/catalog';

export const load: PageServerLoad = async () => {
	const [products, categories, orders] = await Promise.all([
		getAdminProducts(),
		getCategories(),
		getAdminOrders()
	]);

	return {
		stats: [
			{ label: 'Products', value: products.length },
			{ label: 'Categories', value: categories.length },
			{ label: 'Orders', value: orders.length },
			{ label: 'Pending orders', value: orders.filter((item) => item.status === 'pending').length }
		],
		recentOrders: orders.slice(0, 5),
		recentProducts: products.slice(0, 5)
	};
};
