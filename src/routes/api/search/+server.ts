import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searchProducts } from '$lib/server/catalog';

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams.get('q') ?? '';
	const items = await searchProducts(query, 8);

	return json({ items });
};
