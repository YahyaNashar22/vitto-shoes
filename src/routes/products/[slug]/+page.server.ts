import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getProductBySlug, getProducts } from '$lib/server/catalog';
import { isProductWishlisted } from '$lib/server/wishlist';

export const load: PageServerLoad = async ({ params, locals }) => {
	const product = await getProductBySlug(params.slug);

	if (!product) {
		throw error(404, 'Product not found');
	}

	return {
		product,
		isWishlisted: locals.user ? await isProductWishlisted(locals.user.id, product.id) : false,
		canWishlist: Boolean(locals.user),
		similarProducts: (await getProducts({ category: product.categorySlug }))
			.filter((item) => item.id !== product.id)
			.slice(0, 8),
		recentProducts: (await getProducts({ sort: 'newest' }))
			.filter((item) => item.id !== product.id)
			.slice(0, 12)
	};
};
