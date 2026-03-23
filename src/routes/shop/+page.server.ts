import type { PageServerLoad } from './$types';
import { getCategories, getProducts } from '$lib/server/catalog';

export const load: PageServerLoad = async ({ url }) => {
	const category = url.searchParams.get('category');
	const sort = url.searchParams.get('sort') ?? 'featured';
	const query = url.searchParams.get('q');
	const sale = url.searchParams.get('sale') === '1';

	const [categories, products] = await Promise.all([
		getCategories(),
		getProducts({ category, sort, query, onSale: sale })
	]);

	return {
		categories,
		products,
		filters: { category, sort, query, sale }
	};
};
