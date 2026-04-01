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
			<p class="eyebrow">New season selection</p>
			<h1 class="display-title">Shoes that look sharp, wear easy, and sell with confidence.</h1>
			<p class="hero-copy">
				Discover standout pairs for everyday wear, occasion dressing, and on-sale picks, all in one
				fast storefront designed to help shoppers find the right fit without friction.
			</p>
			<div class="chip-row">
				<a class="button-primary" href={resolve('/shop')}>Shop the collection</a>
				<a class="button-secondary" href={resolve('/sale')}>See sale picks</a>
			</div>
		</div>
	</div>
</section>

<section class="stack" style="margin-top: 2.25rem;">
	<div class="section-heading">
		<p class="eyebrow">Collections</p>
		<h2>Shop by category</h2>
		<p>Featured groups mirror the editorial navigation style from the reference site.</p>
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
					<div>
						<h3 style="margin-bottom: 12px;">{item.name}</h3>
						<p class="muted">
							{item.description || 'Designed to keep the catalog clean and easy to scan.'}
						</p>
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
		<p class="eyebrow">Featured</p>
		<h2>Best picks for the homepage</h2>
	</div>
	{#if data.featuredProducts.length}
		<div class="product-grid">
			{#each data.featuredProducts as product (product.id)}
				<div class="reveal" use:reveal>
					<ProductCard {product} />
				</div>
			{/each}
		</div>
	{/if}
</section>

<section class="editorial-grid" style="margin-top: 3rem;">
	<div class="panel reveal" use:reveal>
		<p class="eyebrow">Why this build</p>
		<h2 class="title-margin">Fast initial load by default</h2>
		<p class="muted">
			Catalog data is rendered on the server, product images are lazy-loaded outside the hero, and
			cart state is the only major client-side store. That keeps the first page lean while still
			supporting a smooth shopping flow.
		</p>
	</div>
	<div class="panel reveal" use:reveal>
		<p class="eyebrow">Checkout flow</p>
		<h2 class="title-margin">WhatsApp-first cash on delivery</h2>
		<p class="muted">
			Each checkout saves an order record in PostgreSQL, then prepares a WhatsApp message so you can
			handle the final confirmation manually until payment integration is needed.
		</p>
	</div>
</section>

<section class="stack" style="margin-top: 3rem;">
	<div class="toolbar-row">
		<div class="section-heading" style="margin-bottom: 0;">
			<p class="eyebrow">Latest arrivals</p>
			<h2>Recently added products</h2>
		</div>
		<a class="button-secondary" href={resolve('/shop')}>View full catalog</a>
	</div>

	{#if data.latestProducts.length}
		<div class="product-grid">
			{#each data.latestProducts as product (product.id)}
				<div class="reveal" use:reveal>
					<ProductCard {product} />
				</div>
			{/each}
		</div>
	{/if}
</section>

<style>
	.eyebrow {
		opacity: 0.6;
		margin-bottom: 6px;
	}
	.title-margin {
		margin-bottom: 12px;
	}
</style>
