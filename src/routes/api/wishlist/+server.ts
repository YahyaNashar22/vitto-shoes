import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { toggleWishlistProduct } from '$lib/server/wishlist';

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) {
		return json({ message: 'Authentication required.' }, { status: 401 });
	}

	const { productId } = (await request.json()) as { productId?: string };

	if (!productId) {
		return json({ message: 'Product id is required.' }, { status: 400 });
	}

	const result = await toggleWishlistProduct(locals.user.id, productId);
	return json(result);
};
