<script lang="ts">
	import { cart } from '$lib/stores/cart';
	import type { ProductSummary } from '$lib/types';

	let { product } = $props<{ product: ProductSummary }>();

	let added = $state(false);

	function addToCart() {
		cart.add(product, 1);
		added = true;
		setTimeout(() => {
			added = false;
		}, 1200);
	}
</script>

<button class="button-primary" onclick={addToCart} disabled={product.inventory < 1}>
	{#if product.inventory < 1}
		Out of stock
	{:else if added}
		Added
	{:else}
		Add to cart
	{/if}
</button>
