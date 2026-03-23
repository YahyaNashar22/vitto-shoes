import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getCategories, getProducts } from '$lib/server/catalog';

export const load: PageServerLoad = async ({ params }) => {
	const categories = await getCategories();
	const current = categories.find((item) => item.slug === params.slug);

	if (!current) {
		throw error(404, 'Collection not found');
	}

	return {
		category: current,
		products: await getProducts({ category: params.slug, sort: 'featured' })
	};
};
