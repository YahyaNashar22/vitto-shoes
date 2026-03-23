import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getProductBySlug, getProducts } from '$lib/server/catalog';

export const load: PageServerLoad = async ({ params }) => {
	const product = await getProductBySlug(params.slug);

	if (!product) {
		throw error(404, 'Product not found');
	}

	return {
		product,
		relatedProducts: (await getProducts({ category: product.categorySlug }))
			.filter((item) => item.id !== product.id)
			.slice(0, 4)
	};
};
