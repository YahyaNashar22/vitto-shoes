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
		add(product: ProductSummary, quantity = 1) {
			update((items) => {
				const existing = items.find((item) => item.productId === product.id);
				if (existing) {
					return items.map((item) =>
						item.productId === product.id
							? {
									...item,
									quantity: Math.min(item.quantity + quantity, Math.max(product.inventory, 1))
								}
							: item
					);
				}

				return [
					...items,
					{
						productId: product.id,
						name: product.name,
						slug: product.slug,
						image: product.image,
						price: product.price,
						quantity,
						categoryName: product.categoryName
					}
				];
			});
		},
		remove(productId: string) {
			update((items) => items.filter((item) => item.productId !== productId));
		},
		setQuantity(productId: string, quantity: number) {
			update((items) =>
				items
					.map((item) => (item.productId === productId ? { ...item, quantity } : item))
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
