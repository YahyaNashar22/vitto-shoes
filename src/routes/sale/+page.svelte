<script lang="ts">
	import { resolve } from '$app/paths';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import { SORT_OPTIONS } from '$lib/constants';
	import { reveal } from '$lib/actions/reveal';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	let viewMode = $state<'grid' | 'list'>('grid');
</script>

<div class="section-heading">
	<p class="eyebrow">Sale edit</p>
	<h1>Discounted styles</h1>
	<p class="catalog-toolbar">
		A dedicated sale page keeps the promo catalog easy to reach from the main nav.
	</p>
</div>

<div class="stack shop-layout">
	<details class="shop-filters surface-card">
		<summary class="shop-filters__summary">
			<span>Filter sale</span>
			<span class="shop-filters__summary-icon" aria-hidden="true"></span>
		</summary>

		<form class="shop-filters__form" method="get">
			<div class="shop-filters__row">
				<span class="shop-filters__label">Categories</span>
				<div class="shop-filters__options">
					<label class="shop-filter-option">
						<input type="radio" name="category" value="" checked={!data.filters.category} />
						<span>All</span>
					</label>
					{#each data.categories as item (item.id)}
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
						placeholder="Search sale products"
						autocomplete="off"
					/>
				</div>
			</div>

			<div class="shop-filters__actions">
				<button class="shop-filter-submit" type="submit">Filter</button>
				<a class="shop-filter-reset" href={resolve('/sale')}>Reset</a>
			</div>
		</form>
	</details>

	<div class="stack">
		<div class="shop-toolbar">
			<form class="shop-sort-bar" method="get">
				<input type="hidden" name="category" value={data.filters.category ?? ''} />
				<input type="hidden" name="q" value={data.filters.query ?? ''} />
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

		<p class="muted">{data.products.length} sale products found</p>
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
				title="No sale products yet"
				copy="Mark products as on sale from the admin panel to populate this page."
				href="/admin/catalog"
				cta="Manage catalog"
			/>
		{/if}
	</div>
</div>
