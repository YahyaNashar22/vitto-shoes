import { browser } from '$app/environment';
import { derived, writable } from 'svelte/store';
import type { CartItem, ProductSummary } from '$lib/types';

const STORAGE_KEY = 'vitto-cart';

function createCartStore() {
	const { subscribe, set, update } = writable<CartItem[]>([]);

	if (browser) {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			try {
				set(JSON.parse(stored));
			} catch {
				localStorage.removeItem(STORAGE_KEY);
			}
		}

		subscribe((value) => {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
		});
	}

	return {
		subscribe,
		add(
			product: ProductSummary,
			quantity = 1,
			variant?: {
				barcode?: string;
				color?: string;
				size?: string;
				label?: string;
				price?: number;
				maxQuantity?: number;
			}
		) {
			update((items) => {
				const variantBarcode = variant?.barcode || '';
				const variantColor = variant?.color || product.xDim || product.color || '';
				const variantSize = variant?.size || product.yDim || '';
				const variantLabel =
					variant?.label ||
					[variantColor, variantSize].filter(Boolean).join(' / ') ||
					'Default option';
				const cartKey = [
					product.id,
					variantBarcode || variantColor || 'base',
					variantSize || 'base'
				].join(':');
				const price = variant?.price ?? product.price;
				const limit = Math.max(variant?.maxQuantity ?? product.inventory, 1);
				const existing = items.find((item) => item.cartKey === cartKey);
				if (existing) {
					return items.map((item) =>
						item.cartKey === cartKey
							? {
									...item,
									quantity: Math.min(item.quantity + quantity, limit)
								}
							: item
					);
				}

				return [
					...items,
					{
						cartKey,
						productId: product.id,
						name: product.name,
						slug: product.slug,
						image: product.image,
						price,
						quantity: Math.min(quantity, limit),
						categoryName: product.categoryName,
						variantBarcode,
						variantColor,
						variantSize,
						variantLabel
					}
				];
			});
		},
		remove(cartKey: string) {
			update((items) => items.filter((item) => item.cartKey !== cartKey));
		},
		setQuantity(cartKey: string, quantity: number) {
			update((items) =>
				items
					.map((item) => (item.cartKey === cartKey ? { ...item, quantity } : item))
					.filter((item) => item.quantity > 0)
			);
		},
		clear() {
			set([]);
		}
	};
}

export const cart = createCartStore();

export const cartCount = derived(cart, ($cart) =>
	$cart.reduce((total, item) => total + item.quantity, 0)
);

export const cartSubtotal = derived(cart, ($cart) =>
	$cart.reduce((total, item) => total + item.price * item.quantity, 0)
);
