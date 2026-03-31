<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { cartCount } from '$lib/stores/cart';
	import type { CategorySummary } from '$lib/types';

	let { categories, isAdmin, user } = $props<{
		categories: CategorySummary[];
		isAdmin: boolean;
		user: { name?: string | null } | null;
	}>();

	let menuOpen = $state(false);
</script>

<header class="site-header">
	<div class="announcement">Cash on delivery available. Orders can be completed on WhatsApp.</div>
	<div class="nav-shell">
		<a class="brand" href={resolve('/')} aria-label="Vitto Shoes home">
			<img class="brand-logo brand-logo--header" src="/Viito Logo-01.png" alt="Vitto Shoes" />
		</a>
		<button
			class="menu-toggle"
			type="button"
			aria-expanded={menuOpen}
			aria-controls="site-navigation"
			aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
			onclick={() => (menuOpen = !menuOpen)}
		>
			<span></span>
			<span></span>
			<span></span>
		</button>
		<nav class:open={menuOpen} class="main-nav" id="site-navigation">
			<a class:active={page.url.pathname === '/'} href={resolve('/')}>Home</a>
			<a class:active={page.url.pathname.startsWith('/shop')} href={resolve('/shop')}>Shop</a>
			<a class:active={page.url.pathname.startsWith('/sale')} href={resolve('/sale')}>Sale</a>
			{#each categories.slice(0, 4) as item (item.id)}
				<a
					class:active={page.url.pathname === `/collections/${item.slug}`}
					href={resolve('/collections/[slug]', { slug: item.slug })}
				>
					{item.name}
				</a>
			{/each}
			<a class:active={page.url.pathname.startsWith('/checkout')} href={resolve('/checkout')}
				>Checkout</a
			>
		</nav>
		<div class:open={menuOpen} class="nav-actions">
			<a class="link-pill" href={resolve('/cart')}>Cart ({$cartCount})</a>
			{#if user}
				{#if isAdmin}
					<a class="link-pill" href={resolve('/admin')}>Admin</a>
				{/if}
			{:else}
				<a class="link-pill" href={resolve('/account/sign-in')}>Admin Sign In</a>
			{/if}
		</div>
	</div>
</header>
