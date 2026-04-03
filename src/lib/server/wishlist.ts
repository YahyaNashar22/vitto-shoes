import { and, desc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { wishlistItem } from '$lib/server/db/schema';
import { getProductsByIds } from '$lib/server/catalog';

function isMissingWishlistTable(error: unknown) {
	const message = error instanceof Error ? error.message : String(error);
	return (
		message.includes('wishlist_item') &&
		(message.includes('does not exist') || message.includes('Failed query'))
	);
}

export async function getWishlistProductIds(userId: string) {
	try {
		const rows = await db
			.select({ productId: wishlistItem.productId })
			.from(wishlistItem)
			.where(eq(wishlistItem.userId, userId))
			.orderBy(desc(wishlistItem.createdAt));

		return rows.map((row) => row.productId);
	} catch (error) {
		if (isMissingWishlistTable(error)) {
			return [];
		}

		throw error;
	}
}

export async function getWishlistProducts(userId: string) {
	const productIds = await getWishlistProductIds(userId);
	return getProductsByIds(productIds);
}

export async function isProductWishlisted(userId: string, productId: string) {
	try {
		const row = await db.query.wishlistItem.findFirst({
			where: and(eq(wishlistItem.userId, userId), eq(wishlistItem.productId, productId))
		});

		return Boolean(row);
	} catch (error) {
		if (isMissingWishlistTable(error)) {
			return false;
		}

		throw error;
	}
}

export async function toggleWishlistProduct(userId: string, productId: string) {
	try {
		const existing = await db.query.wishlistItem.findFirst({
			where: and(eq(wishlistItem.userId, userId), eq(wishlistItem.productId, productId))
		});

		if (existing) {
			await db.delete(wishlistItem).where(eq(wishlistItem.id, existing.id));
			return { added: false };
		}

		await db.insert(wishlistItem).values({ userId, productId });
		return { added: true };
	} catch (error) {
		if (isMissingWishlistTable(error)) {
			return { added: false, unavailable: true as const };
		}

		throw error;
	}
}
