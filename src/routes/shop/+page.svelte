<script lang="ts">
	import { resolve } from '$app/paths';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import { SORT_OPTIONS } from '$lib/constants';
	import { reveal } from '$lib/actions/reveal';
	import type { CategorySummary } from '$lib/types';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	let viewMode = $state<'grid' | 'list'>('grid');

	async function openShopGroup(group?: 'women' | 'men' | 'kids') {
		if (group) {
			window.location.href = `${resolve('/shop')}?group=${group}`;
		} else {
			window.location.href = resolve('/shop');
		}
	}

	const visibleCategories = $derived.by(() =>
		data.categories.filter(
			(item: CategorySummary) =>
				!data.filters.parentGroup || item.parentGroup === data.filters.parentGroup
		)
	);
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

<div class="stack shop-layout">
	<details class="shop-filters surface-card">
		<summary class="shop-filters__summary">
			<span>Filter catalog</span>
			<span class="shop-filters__summary-icon" aria-hidden="true"></span>
		</summary>

		<form class="shop-filters__form" method="get">
			<input type="hidden" name="group" value={data.filters.parentGroup ?? ''} />

			<div class="shop-filters__row">
				<span class="shop-filters__label">Categories</span>
				<div class="shop-filters__options">
					<label class="shop-filter-option">
						<input type="radio" name="category" value="" checked={!data.filters.category} />
						<span>All</span>
					</label>
					{#each visibleCategories as item (item.id)}
						<label class="shop-filter-option">
							<input
								type="radio"
								name="category"
								value={item.slug}
								checked={data.filters.category === item.slug}
							/>
							<span>{item.name}</span>
						</label>
					{/each}
				</div>
			</div>

			<div class="shop-filters__row">
				<span class="shop-filters__label">Search</span>
				<div class="shop-filters__search">
					<input
						id="q"
						name="q"
						value={data.filters.query ?? ''}
						placeholder="Search shoes"
						autocomplete="off"
					/>
				</div>
			</div>

			<div class="shop-filters__row">
				<span class="shop-filters__label">State</span>
				<div class="shop-filters__options">
					<label class="shop-filter-option shop-filter-option--checkbox">
						<input type="checkbox" name="sale" value="1" checked={data.filters.sale} />
						<span>On sale</span>
					</label>
				</div>
			</div>

			<div class="shop-filters__actions">
				<button class="shop-filter-submit" type="submit">Filter</button>
				<a class="shop-filter-reset" href={resolve('/shop')}>Reset</a>
			</div>
		</form>
	</details>

	<div class="stack">
		<div class="shop-toolbar">
			<form class="shop-sort-bar" method="get">
				<input type="hidden" name="group" value={data.filters.parentGroup ?? ''} />
				<input type="hidden" name="category" value={data.filters.category ?? ''} />
				<input type="hidden" name="q" value={data.filters.query ?? ''} />
				{#if data.filters.sale}
					<input type="hidden" name="sale" value="1" />
				{/if}
				<label class="shop-sort-bar__label" for="sort">Sort</label>
				<select
					id="sort"
					name="sort"
					onchange={(event) => event.currentTarget.form?.requestSubmit()}
				>
					{#each SORT_OPTIONS as option (option.value)}
						<option value={option.value} selected={data.filters.sort === option.value}
							>{option.label}</option
						>
					{/each}
				</select>
			</form>

			<div class="shop-view-toggle" role="group" aria-label="Change product view">
				<button
					type="button"
					class:active={viewMode === 'grid'}
					aria-label="Grid view"
					onclick={() => (viewMode = 'grid')}
				>
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<rect
							x="4"
							y="4"
							width="6.5"
							height="6.5"
							fill="none"
							stroke="currentColor"
							stroke-width="1.8"
						/>
						<rect
							x="13.5"
							y="4"
							width="6.5"
							height="6.5"
							fill="none"
							stroke="currentColor"
							stroke-width="1.8"
						/>
						<rect
							x="4"
							y="13.5"
							width="6.5"
							height="6.5"
							fill="none"
							stroke="currentColor"
							stroke-width="1.8"
						/>
						<rect
							x="13.5"
							y="13.5"
							width="6.5"
							height="6.5"
							fill="none"
							stroke="currentColor"
							stroke-width="1.8"
						/>
					</svg>
				</button>
				<button
					type="button"
					class:active={viewMode === 'list'}
					aria-label="List view"
					onclick={() => (viewMode = 'list')}
				>
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path
							d="M5 7h14M5 12h14M5 17h14"
							fill="none"
							stroke="currentColor"
							stroke-width="1.8"
							stroke-linecap="round"
						/>
						<circle cx="3.5" cy="7" r="1" fill="currentColor" />
						<circle cx="3.5" cy="12" r="1" fill="currentColor" />
						<circle cx="3.5" cy="17" r="1" fill="currentColor" />
					</svg>
				</button>
			</div>
		</div>

		<p class="muted">{data.products.length} products found</p>
		{#if data.products.length}
			<div class:product-grid--list={viewMode === 'list'} class="product-grid">
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

<style>
	.chip {
		border-radius: 0px;
		margin-bottom: 12px;
	}
</style>
