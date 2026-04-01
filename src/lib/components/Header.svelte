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
	let collectionsOpen = $state(false);

	function closeMenus() {
		menuOpen = false;
		collectionsOpen = false;
	}
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
			<a class:active={page.url.pathname === '/'} href={resolve('/')} onclick={closeMenus}>Home</a>
			<a
				class:active={page.url.pathname.startsWith('/shop')}
				href={resolve('/shop')}
				onclick={closeMenus}>Shop</a
			>
			<div
				class="nav-dropdown"
				class:open={collectionsOpen}
				role="group"
				aria-label="Collections menu"
				onmouseenter={() => (collectionsOpen = true)}
				onmouseleave={() => (collectionsOpen = false)}
			>
				<button
					class:active={page.url.pathname.startsWith('/collections') ||
						page.url.pathname.startsWith('/sale')}
					class="nav-dropdown__trigger"
					type="button"
					aria-expanded={collectionsOpen}
					aria-haspopup="menu"
					onclick={() => (collectionsOpen = !collectionsOpen)}
				>
					Collections
					<span class="nav-dropdown__chevron">+</span>
				</button>
				<div class="nav-dropdown__menu">
					{#each categories.slice(0, 4) as item (item.id)}
						<a
							class:active={page.url.pathname === `/collections/${item.slug}`}
							href={resolve('/collections/[slug]', { slug: item.slug })}
							onclick={closeMenus}
						>
							{item.name}
						</a>
					{/each}
					<a
						class:active={page.url.pathname.startsWith('/sale')}
						href={resolve('/sale')}
						onclick={closeMenus}>Sale</a
					>
				</div>
			</div>
		</nav>
		<div class:open={menuOpen} class="nav-actions">
			<a
				class="icon-link"
				href={resolve('/cart')}
				aria-label={`Cart with ${$cartCount} items`}
				onclick={closeMenus}
			>
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path
						d="M3 4h2l2.2 9.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 7H7"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<circle cx="10" cy="19" r="1.6" fill="currentColor" />
					<circle cx="17" cy="19" r="1.6" fill="currentColor" />
				</svg>
				{#if $cartCount > 0}
					<span class="icon-badge">{$cartCount}</span>
				{/if}
			</a>
			<a class="icon-link" href={resolve('/checkout')} aria-label="Checkout" onclick={closeMenus}>
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path
						d="M5 7.5h14M5 12h14M5 16.5h9"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
					/>
					<path
						d="M15.5 18.5 19 15l-3.5-3.5"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</a>
			{#if user}
				{#if isAdmin}
					<a
						class="icon-link"
						href={resolve('/admin')}
						aria-label="Admin panel"
						onclick={closeMenus}
					>
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<path
								d="M12 3 4.5 7v5.7c0 4.3 2.9 8.3 7.5 9.3 4.6-1 7.5-5 7.5-9.3V7L12 3Z"
								fill="none"
								stroke="currentColor"
								stroke-width="1.8"
								stroke-linejoin="round"
							/>
							<path
								d="m9.4 12.2 1.7 1.7 3.7-3.9"
								fill="none"
								stroke="currentColor"
								stroke-width="1.8"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</a>
				{/if}
				<!-- {:else}
				<a class="icon-link" href={resolve('/account/sign-in')} aria-label="Admin sign in">
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8" />
						<path
							d="M5.5 19c1.6-3 4-4.5 6.5-4.5s4.9 1.5 6.5 4.5"
							fill="none"
							stroke="currentColor"
							stroke-width="1.8"
							stroke-linecap="round"
						/>
					</svg>
				</a> -->
			{/if}
		</div>
	</div>
</header>
