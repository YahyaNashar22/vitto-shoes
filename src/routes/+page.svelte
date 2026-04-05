<script lang="ts">
	import { resolve } from '$app/paths';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import { reveal } from '$lib/actions/reveal';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
</script>

<section class="hero-banner">
	<div class="hero-banner__grid reveal" use:reveal>
		<div class="hero-banner__content">
			<div class="hero-banner__top">
				<p class="eyebrow">New season selection</p>
				<h1 class="display-title">Sharp pairs for every step.</h1>
				<p class="hero-copy">
					Discover standout pairs for everyday wear, occasion dressing, and on-sale picks, all in
					one fast storefront designed to help shoppers find the right fit without friction.
				</p>
			</div>
			<div class="chip-row hero-banner__actions">
				<a class="button-primary" href={resolve('/shop')}>Shop the collection</a>
				<a class="button-secondary" href={resolve('/sale')}>See sale picks</a>
			</div>
		</div>
	</div>
</section>

<section class="stack" style="margin-top: 2.25rem;">
	<div class="section-heading" style="margin: 0 auto;">
		<p class="eyebrow">Latest arrivals</p>
		<!-- <h2>Fresh pairs just added</h2>
		<p>New styles in a fast horizontal browse, made for quick discovery.</p> -->
	</div>

	{#if data.latestProducts.length}
		<div class="product-rail">
			{#each data.latestProducts as product (product.id)}
				<div class="product-rail__item reveal" use:reveal>
					<ProductCard {product} />
				</div>
			{/each}
		</div>
	{/if}

	<a class="button-primary latest-arrivals__cta" href={resolve('/shop')}>View full catalog</a>
</section>

<section class="stack" style="margin-top: 3rem;">
	<div class="section-heading">
		<p class="eyebrow">Collections</p>
		<!-- <h2>Shop by category</h2>
		<p>Featured groups mirror the editorial navigation style from the reference site.</p> -->
	</div>

	{#if data.categories.length}
		<div class="category-grid">
			{#each data.categories.slice(0, 4) as item (item.id)}
				<a
					class="surface-card category-tile reveal"
					href={resolve('/collections/[slug]', { slug: item.slug })}
					use:reveal
				>
					<img src={item.image || '/placeholder-category.svg'} alt={item.name} loading="lazy" />
					<div class="category-tile__overlay"></div>
					<div class="category-tile__content">
						<h3>{item.name}</h3>
					</div>
				</a>
			{/each}
		</div>
	{:else}
		<EmptyState
			title="Start with categories"
			copy="Add categories from the admin panel to populate the storefront navigation and collection pages."
			href="/admin/catalog"
			cta="Open admin"
		/>
	{/if}
</section>

<section class="stack" style="margin-top: 3rem;">
	<div class="section-heading">
		<p class="eyebrow">Top selling</p>
		<!-- <h2>Best sellers right now</h2> -->
	</div>
	{#if data.featuredProducts.length}
		<div class="product-rail">
			{#each data.featuredProducts as product (product.id)}
				<div class="product-rail__item reveal" use:reveal>
					<ProductCard {product} />
				</div>
			{/each}
		</div>
	{/if}
</section>

<style>
	.section-heading {
		align-self: center;
	}

	.eyebrow {
		opacity: 0.6;
		margin-bottom: 6px;
		text-align: center;
		font-size: 1.1rem;
	}
</style>
