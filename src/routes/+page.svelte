<script lang="ts">
	import { resolve } from '$app/paths';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import { reveal } from '$lib/actions/reveal';
	import type { CategorySummary } from '$lib/types';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	let latestRail = $state<HTMLDivElement | null>(null);
	let topSellingRail = $state<HTMLDivElement | null>(null);
	const womenCategories = $derived(
		data.categories.filter((item: CategorySummary) => item.parentGroup === 'women')
	);
	const secondaryCategories = $derived(
		womenCategories.slice(6, 10).length ? womenCategories.slice(6, 10) : womenCategories.slice(0, 4)
	);

	function scrollRail(rail: HTMLDivElement | null, direction: 'left' | 'right') {
		if (!rail) {
			return;
		}

		const amount = Math.max(rail.clientWidth * 0.82, 220);
		rail.scrollBy({
			left: direction === 'right' ? amount : -amount,
			behavior: 'smooth'
		});
	}
</script>

<section class="hero-banner">
	<div class="hero-banner__grid reveal" use:reveal>
		<div class="hero-banner__content">
			<div class="hero-banner__top">
				<p class="eyebrow" style="text-align: left;">New season selection</p>
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
		<div class="home-rail-shell">
			<button
				type="button"
				class="home-rail-arrow home-rail-arrow--left"
				aria-label="Scroll latest arrivals left"
				onclick={() => scrollRail(latestRail, 'left')}
			>
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path
						d="M14.5 6.5 9 12l5.5 5.5"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</button>
			<div class="product-rail home-rail" bind:this={latestRail}>
				{#each data.latestProducts as product (product.id)}
					<div class="product-rail__item reveal" use:reveal>
						<ProductCard {product} />
					</div>
				{/each}
			</div>
			<button
				type="button"
				class="home-rail-arrow home-rail-arrow--right"
				aria-label="Scroll latest arrivals right"
				onclick={() => scrollRail(latestRail, 'right')}
			>
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path
						d="M9.5 6.5 15 12l-5.5 5.5"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</button>
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
			{#each womenCategories.slice(0, 6) as item (item.id)}
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
		<div class="home-rail-shell">
			<button
				type="button"
				class="home-rail-arrow home-rail-arrow--left"
				aria-label="Scroll top selling left"
				onclick={() => scrollRail(topSellingRail, 'left')}
			>
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path
						d="M14.5 6.5 9 12l5.5 5.5"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</button>
			<div class="product-rail home-rail" bind:this={topSellingRail}>
				{#each data.featuredProducts as product (product.id)}
					<div class="product-rail__item reveal" use:reveal>
						<ProductCard {product} />
					</div>
				{/each}
			</div>
			<button
				type="button"
				class="home-rail-arrow home-rail-arrow--right"
				aria-label="Scroll top selling right"
				onclick={() => scrollRail(topSellingRail, 'right')}
			>
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path
						d="M9.5 6.5 15 12l-5.5 5.5"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</button>
		</div>
	{/if}

	<a class="button-primary latest-arrivals__cta" href={resolve('/shop')}>Shop more</a>
</section>

{#if secondaryCategories.length}
	<section class="stack" style="margin-top: 3rem;">
		<div class="category-grid">
			{#each secondaryCategories as item (item.id)}
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
	</section>
{/if}

<section class="service-highlights" aria-label="Store benefits">
	<div class="service-highlights__grid">
		<article class="service-highlight">
			<div class="service-highlight__icon" aria-hidden="true">
				<svg viewBox="0 0 24 24">
					<path
						d="M3.5 7.5h10v8h-10zM13.5 10h2.6l2.4 2.6v2.9h-5z"
						fill="none"
						stroke="currentColor"
						stroke-width="1.7"
						stroke-linejoin="round"
					/>
					<circle cx="7.2" cy="17.4" r="1.6" fill="none" stroke="currentColor" stroke-width="1.7" />
					<circle
						cx="16.8"
						cy="17.4"
						r="1.6"
						fill="none"
						stroke="currentColor"
						stroke-width="1.7"
					/>
				</svg>
			</div>
			<div class="service-highlight__copy">
				<h3>Easy Exchanges</h3>
				<p>Exchange within 7 days - No Refund</p>
			</div>
		</article>

		<article class="service-highlight">
			<div class="service-highlight__icon" aria-hidden="true">
				<svg viewBox="0 0 24 24">
					<path
						d="M12 20a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
						fill="none"
						stroke="currentColor"
						stroke-width="1.7"
					/>
					<path
						d="M9.4 10.2a2.8 2.8 0 1 1 5 1.7c-.8.8-1.6 1.3-1.9 2.2"
						fill="none"
						stroke="currentColor"
						stroke-width="1.7"
						stroke-linecap="round"
					/>
					<circle cx="12" cy="16.9" r="0.9" fill="currentColor" />
				</svg>
			</div>
			<div class="service-highlight__copy">
				<h3>Online Support</h3>
				<p>Available 7 days a week for your questions and orders.</p>
			</div>
		</article>

		<article class="service-highlight">
			<div class="service-highlight__icon" aria-hidden="true">
				<svg viewBox="0 0 24 24">
					<rect
						x="4"
						y="6.2"
						width="16"
						height="11.6"
						rx="1.6"
						fill="none"
						stroke="currentColor"
						stroke-width="1.7"
					/>
					<path
						d="M4.8 10.3h14.4"
						fill="none"
						stroke="currentColor"
						stroke-width="1.7"
						stroke-linecap="round"
					/>
				</svg>
			</div>
			<div class="service-highlight__copy">
				<h3>Easy Payment</h3>
				<p>Pay Cash on Delivery</p>
			</div>
		</article>
	</div>
</section>

<style>
	.section-heading {
		align-self: center;
		width: 100%;
		justify-items: center;
	}

	.eyebrow {
		opacity: 0.6;
		margin-bottom: 6px;
		text-align: center;
		font-size: 1.1rem;
	}

	.home-rail-shell {
		position: relative;
		overflow: hidden;
		width: 100%;
		min-width: 0;
	}

	.home-rail-arrow {
		display: none;
	}

	.home-rail {
		display: flex;
		gap: 0.85rem;
		width: 100%;
		min-width: 0;
		overflow-x: auto;
		overflow-y: hidden;
		scroll-snap-type: x proximity;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
	}

	.home-rail::-webkit-scrollbar {
		display: none;
	}

	.home-rail .product-rail__item {
		flex: 0 0 min(280px, 72vw);
		min-width: 0;
	}

	.service-highlights {
		margin-top: 3rem;
	}

	.service-highlights__grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.7rem;
	}

	.service-highlight {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: center;
		gap: 0.55rem;
		padding: 0.58rem 0;
	}

	.service-highlight__icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.15rem;
		height: 2.15rem;
		border: 1px solid rgba(15, 15, 15, 0.1);
		border-radius: 999px;
		color: #111111;
		background: #ffffff;
		flex: 0 0 auto;
	}

	.service-highlight__icon svg {
		width: 0.92rem;
		height: 0.92rem;
	}

	.service-highlight__copy {
		display: grid;
		gap: 0.3rem;
	}

	.service-highlight__copy h3 {
		margin: 0;
		font-size: 0.76rem;
		line-height: 1.05;
	}

	.service-highlight__copy p {
		margin: 0;
		color: var(--muted);
		font-size: 0.64rem;
		line-height: 1.18;
	}

	@media (max-width: 700px) {
		.home-rail-shell .home-rail {
			scroll-behavior: smooth;
			-webkit-overflow-scrolling: touch;
			touch-action: pan-x;
			padding-inline: 0.75rem;
		}

		.home-rail-arrow {
			position: absolute;
			top: 50%;
			transform: translateY(-50%);
			z-index: 2;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			width: 2.2rem;
			height: 2.2rem;
			border: none;
			border-radius: 999px;
			background: rgba(15, 15, 15, 0.96);
			color: #ffffff;
			line-height: 1;
			box-shadow: 0 10px 18px rgba(15, 15, 15, 0.16);
			cursor: pointer;
			padding: 0;
		}

		.home-rail-arrow svg {
			width: 1rem;
			height: 1rem;
		}

		.home-rail-arrow--left {
			left: 0.35rem;
		}

		.home-rail-arrow--right {
			right: 0.35rem;
		}

		.home-rail .product-rail__item {
			flex-basis: min(158px, calc(50vw - 1.5rem));
		}

		.service-highlights {
			margin-top: 2.5rem;
		}

		.service-highlights__grid {
			grid-template-columns: 1fr;
			gap: 0.55rem;
		}

		.service-highlight {
			gap: 0.5rem;
			padding: 0.52rem 0;
		}

		.service-highlight__icon {
			width: 2rem;
			height: 2rem;
		}

		.service-highlight__icon svg {
			width: 0.82rem;
			height: 0.82rem;
		}

		.service-highlight__copy h3 {
			font-size: 0.72rem;
		}

		.service-highlight__copy p {
			font-size: 0.62rem;
			line-height: 1.16;
		}
	}
</style>
