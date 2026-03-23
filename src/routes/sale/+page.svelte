<script lang="ts">
	import { resolve } from '$app/paths';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import { SORT_OPTIONS } from '$lib/constants';
	import { reveal } from '$lib/actions/reveal';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
</script>

<div class="section-heading">
	<p class="eyebrow">Sale edit</p>
	<h1>Discounted styles</h1>
	<p class="catalog-toolbar">
		A dedicated sale page keeps the promo catalog easy to reach from the main nav.
	</p>
</div>

<div class="catalog-layout">
	<form class="filter-panel stack" method="get">
		<div class="form-row">
			<label for="q">Search</label>
			<input id="q" name="q" value={data.filters.query ?? ''} placeholder="Search sale products" />
		</div>
		<div class="form-row">
			<label for="category">Category</label>
			<select id="category" name="category">
				<option value="">All categories</option>
				{#each data.categories as item (item.id)}
					<option value={item.slug} selected={data.filters.category === item.slug}
						>{item.name}</option
					>
				{/each}
			</select>
		</div>
		<div class="form-row">
			<label for="sort">Sort</label>
			<select id="sort" name="sort">
				{#each SORT_OPTIONS as option (option.value)}
					<option value={option.value} selected={data.filters.sort === option.value}
						>{option.label}</option
					>
				{/each}
			</select>
		</div>
		<div class="chip-row">
			<button class="button-primary" type="submit">Apply filters</button>
			<a class="button-secondary" href={resolve('/sale')}>Reset</a>
		</div>
	</form>

	<div class="stack">
		<p class="muted">{data.products.length} sale products found</p>
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
				title="No sale products yet"
				copy="Mark products as on sale from the admin panel to populate this page."
				href="/admin/catalog"
				cta="Manage catalog"
			/>
		{/if}
	</div>
</div>
