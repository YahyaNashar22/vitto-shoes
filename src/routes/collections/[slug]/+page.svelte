<script lang="ts">
	import { resolve } from '$app/paths';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import { reveal } from '$lib/actions/reveal';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
</script>

<section class="collection-hero">
	<div class="hero-grid collection-hero__grid">
		<div class="collection-hero__content">
			<p class="eyebrow">Collection</p>
			<h1>{data.category.name}</h1>
			<p class="muted">{data.category.description}</p>
			<a class="button-primary" href={resolve('/shop')}>Shop this collection</a>
		</div>
		<div class="collection-hero__media">
			<img
				src={data.category.image || '/placeholder-category.svg'}
				alt={data.category.name}
				loading="eager"
			/>
		</div>
	</div>
</section>

<section class="stack" style="margin-top: 2rem;">
	{#if data.products.length}
		<div class="product-grid">
			{#each data.products as product (product.id)}
				<div class="reveal" use:reveal>
					<ProductCard {product} />
				</div>
			{/each}
		</div>
	{:else}
		<EmptyState
			title="This collection is empty"
			copy="Add products in the admin panel and assign them to this category to populate the page."
			href="/admin/catalog"
			cta="Manage catalog"
		/>
	{/if}
</section>
