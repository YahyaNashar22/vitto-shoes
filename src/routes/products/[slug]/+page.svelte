<script lang="ts">
	import CartButton from '$lib/components/CartButton.svelte';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import { formatCurrency } from '$lib/utils';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();

	const gallery = $derived([data.product.image, ...data.product.gallery].filter(Boolean));
</script>

<section class="product-detail">
	<div class="stack">
		{#each gallery as image, index (`${image}-${index}`)}
			<img
				class="surface-card product-gallery-image"
				src={image || '/placeholder-product.svg'}
				alt={data.product.name}
				loading={image === gallery[0] ? 'eager' : 'lazy'}
			/>
		{/each}
	</div>

	<div class="stack product-sidebar">
		<p class="eyebrow">{data.product.categoryName}</p>
		<h1>{data.product.name}</h1>
		<div class="product-price-row">
			<span class="product-price">{formatCurrency(data.product.price)}</span>
			{#if data.product.compareAtPrice}
				<span class="product-compare">{formatCurrency(data.product.compareAtPrice)}</span>
			{/if}
		</div>
		<p class="muted">{data.product.shortDescription}</p>
		<div class="chip-row">
			<span class="chip">Color: {data.product.color || 'Neutral'}</span>
			<span class="chip">Material: {data.product.material || 'Premium synthetic'}</span>
			<span class="chip">SKU: {data.product.sku}</span>
		</div>
		<CartButton product={data.product} />
		<div class="panel">
			<h2>Product details</h2>
			<p class="muted">{data.product.description}</p>
		</div>
	</div>
</section>

{#if data.relatedProducts.length}
	<section class="stack" style="margin-top: 3rem;">
		<div class="section-heading">
			<p class="eyebrow">Related</p>
			<h2>You may also like</h2>
		</div>
		<div class="product-grid">
			{#each data.relatedProducts as product (product.id)}
				<ProductCard {product} />
			{/each}
		</div>
	</section>
{/if}
