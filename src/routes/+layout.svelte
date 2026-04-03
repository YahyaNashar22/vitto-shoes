<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { cartCount } from '$lib/stores/cart';
	import type { Snippet } from 'svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import type { LayoutData } from './$types';

	let { children, data } = $props<{ children: Snippet; data: LayoutData }>();
	let showScrollTop = $state(false);

	onMount(() => {
		if (!browser) {
			return;
		}

		const updateScrollTopVisibility = () => {
			showScrollTop = window.scrollY > 120;
		};

		updateScrollTopVisibility();
		window.addEventListener('scroll', updateScrollTopVisibility, { passive: true });

		return () => {
			window.removeEventListener('scroll', updateScrollTopVisibility);
		};
	});

	function scrollToTop() {
		if (!browser) {
			return;
		}

		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Vitto Shoes</title>
	<meta
		name="description"
		content="Luxury-inspired footwear storefront built with SvelteKit, fast server rendering, and WhatsApp cash-on-delivery checkout."
	/>
</svelte:head>

<div class="page-shell">
	<Header categories={data.categories ?? []} isAdmin={data.isAdmin} user={data.user} />
	<main class="page-main">
		{@render children()}
	</main>
	<Footer />

	<nav class="mobile-bottom-nav" aria-label="Mobile quick navigation">
		<a class:active={page.url.pathname === '/'} href={resolve('/')}>
			<span class="mobile-bottom-nav__icon" aria-hidden="true">
				<svg viewBox="0 0 24 24">
					<path
						d="M4.75 10.5 12 4.75l7.25 5.75v7.75a1 1 0 0 1-1 1h-4.5v-5.5h-3.5v5.5h-4.5a1 1 0 0 1-1-1Z"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linejoin="round"
					/>
				</svg>
			</span>
			<span>Home</span>
		</a>
		<a class:active={page.url.pathname.startsWith('/shop')} href={resolve('/shop')}>
			<span class="mobile-bottom-nav__icon" aria-hidden="true">
				<svg viewBox="0 0 24 24">
					<path
						d="M5.5 7.25h13l-1.05 10.3a1 1 0 0 1-1 .9H7.55a1 1 0 0 1-1-.9L5.5 7.25Z"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linejoin="round"
					/>
					<path
						d="M8.5 9.25V7a3.5 3.5 0 1 1 7 0v2.25"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
					/>
				</svg>
			</span>
			<span>Shop</span>
		</a>
		{#if data.user}
			<a class:active={page.url.pathname.startsWith('/account')} href={resolve('/account/profile')}>
				<span class="mobile-bottom-nav__icon" aria-hidden="true">
					<svg viewBox="0 0 24 24">
						<circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8" />
						<path
							d="M5.5 19c1.6-3 4-4.5 6.5-4.5s4.9 1.5 6.5 4.5"
							fill="none"
							stroke="currentColor"
							stroke-width="1.8"
							stroke-linecap="round"
						/>
					</svg>
				</span>
				<span>Profile</span>
			</a>
		{:else}
			<a class:active={page.url.pathname.startsWith('/account')} href={resolve('/account/sign-in')}>
				<span class="mobile-bottom-nav__icon" aria-hidden="true">
					<svg viewBox="0 0 24 24">
						<circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8" />
						<path
							d="M5.5 19c1.6-3 4-4.5 6.5-4.5s4.9 1.5 6.5 4.5"
							fill="none"
							stroke="currentColor"
							stroke-width="1.8"
							stroke-linecap="round"
						/>
					</svg>
				</span>
				<span>Profile</span>
			</a>
		{/if}
		<a class:active={page.url.pathname.startsWith('/cart')} href={resolve('/cart')}>
			<span class="mobile-bottom-nav__icon" aria-hidden="true">
				<svg viewBox="0 0 24 24">
					<path
						d="M6.5 7.25h11.1l-.9 10.3a1 1 0 0 1-1 .91H8.3a1 1 0 0 1-1-.91L6.5 7.25Z"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linejoin="round"
					/>
					<path
						d="M9.25 9.25V7a2.75 2.75 0 1 1 5.5 0v2.25"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
					/>
				</svg>
				{#if $cartCount > 0}
					<span class="mobile-bottom-nav__badge">{$cartCount}</span>
				{/if}
			</span>
			<span>Cart</span>
		</a>
	</nav>

	{#if showScrollTop}
		<button
			class="scroll-top-button"
			type="button"
			aria-label="Scroll to top"
			onclick={scrollToTop}
		>
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<path
					d="m6 14 6-6 6 6"
					fill="none"
					stroke="currentColor"
					stroke-width="1.9"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</button>
	{/if}
</div>
