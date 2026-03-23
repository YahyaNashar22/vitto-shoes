import type { PageServerLoad } from './$types';
import { getCategories, getProducts } from '$lib/server/catalog';

export const load: PageServerLoad = async () => {
	const [categories, featuredProducts, saleProducts, latestProducts] = await Promise.all([
		getCategories(),
		getProducts({ featuredOnly: true }),
		getProducts({ onSale: true, sort: 'price-asc' }),
		getProducts({ sort: 'newest' })
	]);

	return {
		categories: categories.filter((item) => item.productCount || item.featured),
		featuredProducts: featuredProducts.slice(0, 4),
		saleProducts: saleProducts.slice(0, 4),
		latestProducts: latestProducts.slice(0, 8)
	};
};
