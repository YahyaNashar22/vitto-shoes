import type { PageServerLoad } from './$types';
import { getCategories, getProducts } from '$lib/server/catalog';
import { getHomeHeroContent } from '$lib/server/storefront';

export const load: PageServerLoad = async () => {
	const [categories, featuredProducts, saleProducts, latestProducts, homeHero] = await Promise.all([
		getCategories(),
		getProducts({ featuredOnly: true }),
		getProducts({ onSale: true, sort: 'price-asc' }),
		getProducts({ sort: 'newest' }),
		getHomeHeroContent()
	]);

	return {
		homeHero,
		categories: categories.filter((item) => item.productCount || item.featured),
		featuredProducts: featuredProducts.slice(0, 4),
		saleProducts: saleProducts.slice(0, 4),
		latestProducts: latestProducts.slice(0, 8)
	};
};
