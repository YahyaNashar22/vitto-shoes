<script lang="ts">
	import { resolve } from '$app/paths';
	import { formatCurrency } from '$lib/utils';
	import type { ProductSummary } from '$lib/types';

	let { product } = $props<{ product: ProductSummary }>();
</script>

<article class="product-card">
	<a href={resolve('/products/[slug]', { slug: product.slug })} class="product-media">
		<img
			src={product.image || '/placeholder-product.webp'}
			alt={product.name}
			loading="lazy"
			width="500"
			height="650"
		/>
		{#if product.onSale}
			<span class="badge">Sale</span>
		{/if}
	</a>
	<div class="product-body">
		<div>
			<p class="product-category">{product.categoryName}</p>
			<a class="product-name" href={resolve('/products/[slug]', { slug: product.slug })}>
				{product.name}
			</a>
			<!-- <p class="product-copy">{product.shortDescription}</p> -->
		</div>
		<div class="product-price-row">
			<span class="product-price">{formatCurrency(product.price)}</span>
			{#if product.compareAtPrice}
				<span class="product-compare">{formatCurrency(product.compareAtPrice)}</span>
			{/if}
		</div>
	</div>
</article>
