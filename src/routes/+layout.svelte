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

	function openWhatsApp() {
		if (!browser) {
			return;
		}

		window.open(data.whatsappHref, '_blank', 'noopener,noreferrer');
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

	<button
		class="whatsapp-float-button"
		type="button"
		aria-label="Chat on WhatsApp"
		onclick={openWhatsApp}
	>
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path
				d="M12 3.75A8.25 8.25 0 0 0 5.04 16.43L4 20.25l3.94-1.03A8.25 8.25 0 1 0 12 3.75Zm0 15a6.72 6.72 0 0 1-3.42-.93l-.24-.14-2.34.61.62-2.28-.15-.24A6.75 6.75 0 1 1 12 18.75Zm3.71-5.1c-.2-.1-1.16-.57-1.34-.64-.18-.07-.31-.1-.44.1-.13.2-.5.63-.62.77-.11.13-.22.15-.41.05-.2-.1-.83-.3-1.58-.96-.59-.52-.98-1.16-1.09-1.35-.11-.2-.01-.3.08-.4.08-.08.2-.22.29-.33.1-.11.13-.19.2-.32.07-.13.03-.24-.02-.33-.05-.1-.44-1.06-.6-1.45-.16-.38-.33-.33-.44-.34h-.38c-.13 0-.33.05-.5.24-.17.2-.67.65-.67 1.59 0 .94.69 1.84.79 1.96.1.13 1.36 2.07 3.3 2.9.46.2.81.32 1.09.41.46.14.88.12 1.21.07.37-.06 1.16-.47 1.32-.92.16-.45.16-.83.11-.92-.04-.09-.17-.14-.37-.24Z"
				fill="currentColor"
			/>
		</svg>
	</button>

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
					<rect
						x="4.75"
						y="5.25"
						width="6.5"
						height="6.5"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
					/>
					<rect
						x="12.75"
						y="5.25"
						width="6.5"
						height="6.5"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
					/>
					<rect
						x="4.75"
						y="13.25"
						width="6.5"
						height="6.5"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
					/>
					<rect
						x="12.75"
						y="13.25"
						width="6.5"
						height="6.5"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
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
