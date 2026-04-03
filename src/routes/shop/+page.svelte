<script lang="ts">
	import { resolve } from '$app/paths';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import { SORT_OPTIONS } from '$lib/constants';
	import { reveal } from '$lib/actions/reveal';
	import type { CategorySummary } from '$lib/types';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	async function openShopGroup(group?: 'women' | 'men' | 'kids') {
		if (group) {
			window.location.href = `${resolve('/shop')}?group=${group}`;
		} else {
			window.location.href = resolve('/shop');
		}
	}
</script>

<div class="section-heading">
	<p class="eyebrow">Shop all</p>
	<h1>Browse the full catalog</h1>
	<p class="catalog-toolbar">
		Filter by category, sale state, or a text search without sacrificing the initial server-rendered
		load.
	</p>
</div>

<div class="chip-row shop-parent-groups">
	<button
		class:data-active={!data.filters.parentGroup}
		class="chip"
		type="button"
		onclick={() => openShopGroup()}
	>
		All
	</button>
	<button
		class:data-active={data.filters.parentGroup === 'women'}
		class="chip"
		type="button"
		onclick={() => openShopGroup('women')}
	>
		Women
	</button>
	<button
		class:data-active={data.filters.parentGroup === 'men'}
		class="chip"
		type="button"
		onclick={() => openShopGroup('men')}
	>
		Men
	</button>
	<button
		class:data-active={data.filters.parentGroup === 'kids'}
		class="chip"
		type="button"
		onclick={() => openShopGroup('kids')}
	>
		Kids
	</button>
</div>

<div class="catalog-layout">
	<form class="filter-panel stack" method="get">
		<input type="hidden" name="group" value={data.filters.parentGroup ?? ''} />
		<div class="form-row">
			<label for="q">Search</label>
			<input id="q" name="q" value={data.filters.query ?? ''} placeholder="Search shoes" />
		</div>
		<div class="form-row">
			<label for="group">Group</label>
			<select id="group" name="group">
				<option value="">All groups</option>
				<option value="women" selected={data.filters.parentGroup === 'women'}>Women</option>
				<option value="men" selected={data.filters.parentGroup === 'men'}>Men</option>
				<option value="kids" selected={data.filters.parentGroup === 'kids'}>Kids</option>
			</select>
		</div>
		<div class="form-row">
			<label for="category">Category</label>
			<select id="category" name="category">
				<option value="">All categories</option>
				{#each data.categories.filter((item: CategorySummary) => !data.filters.parentGroup || item.parentGroup === data.filters.parentGroup) as item (item.id)}
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
		<label class="chip">
			<input type="checkbox" name="sale" value="1" checked={data.filters.sale} />
			On sale only
		</label>
		<div class="chip-row">
			<button class="button-primary" type="submit">Apply filters</button>
			<a class="button-secondary" href={resolve('/shop')}>Reset</a>
		</div>
	</form>

	<div class="stack">
		<p class="muted">{data.products.length} products found</p>
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
				title="No products match these filters"
				copy="Try a different category or remove the sale filter."
				href="/shop"
				cta="Clear filters"
			/>
		{/if}
	</div>
</div>
