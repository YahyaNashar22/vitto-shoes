<script lang="ts">
	import { browser } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { cartCount } from '$lib/stores/cart';
	import type { CategoryParentGroup, CategorySummary } from '$lib/types';

	type SearchItem = {
		id: string;
		name: string;
		slug: string;
		image: string;
		categoryName: string;
		price: number;
		currency: string;
	};

	let { categories, isAdmin, user } = $props<{
		categories: CategorySummary[];
		isAdmin: boolean;
		user: { name?: string | null } | null;
	}>();

	let drawerOpen = $state(false);
	let drawerCollectionsOpen = $state(false);
	let accountMenuOpen = $state(false);
	let mobileSearch = $state('');
	let searchResults = $state<SearchItem[]>([]);
	let searchOpen = $state(false);
	let searchLoading = $state(false);
	let searchError = $state('');

	let debounceTimer: ReturnType<typeof setTimeout> | null = null;
	let searchController: AbortController | null = null;
	const parentGroupLabels: Record<CategoryParentGroup, string> = {
		men: 'Men',
		women: 'Women',
		kids: 'Kids'
	};
	const groupedCategories = $derived.by(() =>
		(['women', 'men', 'kids'] as CategoryParentGroup[]).map((group) => ({
			group,
			label: parentGroupLabels[group],
			items: categories.filter((item: CategorySummary) => item.parentGroup === group)
		}))
	);

	function closeMenus() {
		drawerOpen = false;
		drawerCollectionsOpen = false;
		accountMenuOpen = false;
		searchOpen = false;
	}

	afterNavigate(() => {
		closeMenus();
	});

	function resetSearchState() {
		searchResults = [];
		searchLoading = false;
		searchError = '';
		searchOpen = false;
		if (searchController) {
			searchController.abort();
			searchController = null;
		}
		if (debounceTimer) {
			clearTimeout(debounceTimer);
			debounceTimer = null;
		}
	}

	function setSearchValue(value: string) {
		mobileSearch = value;
		queueSearch(value);
	}

	function queueSearch(value: string) {
		const trimmed = value.trim();

		if (!trimmed) {
			resetSearchState();
			return;
		}

		searchLoading = true;
		searchError = '';
		searchOpen = true;

		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		debounceTimer = setTimeout(() => {
			void runSearch(trimmed);
		}, 180);
	}

	async function runSearch(query: string) {
		if (!browser) {
			return;
		}

		if (searchController) {
			searchController.abort();
		}

		searchController = new AbortController();

		try {
			const response = await fetch(`${resolve('/api/search')}?q=${encodeURIComponent(query)}`, {
				signal: searchController.signal
			});

			if (!response.ok) {
				throw new Error('Search failed');
			}

			const payload = (await response.json()) as { items?: SearchItem[] };
			if (mobileSearch.trim() !== query) {
				return;
			}

			searchResults = payload.items ?? [];
			searchOpen = true;
		} catch (error) {
			if (error instanceof DOMException && error.name === 'AbortError') {
				return;
			}

			searchResults = [];
			searchError = 'Search is temporarily unavailable.';
			searchOpen = true;
		} finally {
			searchLoading = false;
		}
	}

	function handleSearchSubmit(event: SubmitEvent) {
		const form = event.currentTarget as HTMLFormElement;
		const formData = new FormData(form);
		const value = String(formData.get('q') ?? '').trim();

		if (!value) {
			event.preventDefault();
			return;
		}

		closeMenus();
	}

	async function openShopGroup(group?: CategoryParentGroup) {
		if (group) {
			window.location.href = `${resolve('/shop')}?group=${group}`;
		} else {
			window.location.href = resolve('/shop');
		}
		closeMenus();
	}
</script>

<header class="site-header">
	<div class="nav-shell nav-shell--cavin">
		<div class="nav-utility nav-utility--left">
			<button
				class="menu-toggle menu-toggle--plain"
				type="button"
				aria-expanded={drawerOpen}
				aria-controls="site-navigation-drawer"
				aria-label={drawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
				onclick={() => (drawerOpen = !drawerOpen)}
			>
				<span></span>
				<span></span>
				<span></span>
			</button>
		</div>

		<a class="brand brand--centered" href={resolve('/')} aria-label="Vitto Shoes home">
			<img class="brand-logo brand-logo--header" src="/Viito Logo-01.png" alt="Vitto Shoes" />
		</a>

		<div class="nav-utility nav-utility--right">
			<div
				class="nav-account desktop-account-link"
				class:open={accountMenuOpen}
				role="presentation"
				onmouseenter={() => (accountMenuOpen = true)}
				onmouseleave={() => (accountMenuOpen = false)}
			>
				<button
					class="icon-link icon-link--plain"
					type="button"
					aria-expanded={accountMenuOpen}
					aria-haspopup="menu"
					aria-label={user ? 'Account menu' : 'Sign in'}
					onclick={() => (accountMenuOpen = !accountMenuOpen)}
				>
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
				</button>

				<div class="nav-account__menu" role="menu">
					{#if user}
						{#if isAdmin}
							<a href={resolve('/admin')}>Admin panel</a>
						{:else}
							<a href={resolve('/account/profile')}>My profile</a>
						{/if}
						<form method="post" action={resolve('/account/sign-out')}>
							<button type="submit">Logout</button>
						</form>
					{:else}
						<a href={resolve('/account/sign-in')}>Sign in</a>
						<a href={resolve('/account/sign-in')}>Create account</a>
					{/if}
				</div>
			</div>

			<a
				class="icon-link icon-link--plain"
				href={resolve('/cart')}
				aria-label={`Cart with ${$cartCount} items`}
			>
				<svg viewBox="0 0 24 24" aria-hidden="true">
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
					<span class="icon-badge">{$cartCount}</span>
				{/if}
			</a>
		</div>
	</div>
</header>

{#if drawerOpen}
	<button
		class="mobile-drawer-backdrop open"
		type="button"
		aria-label="Close navigation menu"
		onclick={closeMenus}
	></button>

	<aside class="mobile-drawer open" id="site-navigation-drawer" aria-hidden={false}>
		<div class="mobile-drawer__top">
			<button
				class="drawer-close"
				type="button"
				aria-label="Close navigation menu"
				onclick={closeMenus}
			>
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path
						d="M6 6 18 18M18 6 6 18"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
					/>
				</svg>
			</button>
			<a
				class="brand brand--drawer"
				href={resolve('/')}
				aria-label="Vitto Shoes home"
				onclick={closeMenus}
			>
				<img class="brand-logo brand-logo--header" src="/Viito Logo-01.png" alt="Vitto Shoes" />
			</a>
			<div class="mobile-drawer__icons">
				<a
					class="icon-link icon-link--plain"
					href={resolve('/cart')}
					aria-label="Cart"
					onclick={closeMenus}
				>
					<svg viewBox="0 0 24 24" aria-hidden="true">
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
				</a>
			</div>
		</div>

		<div class="mobile-drawer__body">
			<div class="mobile-drawer__search">
				<div
					class="header-search header-search--mobile"
					class:open={searchOpen && !!mobileSearch.trim()}
				>
					<form
						class="header-search__form"
						method="get"
						action={resolve('/shop')}
						role="search"
						onsubmit={handleSearchSubmit}
					>
						<span class="header-search__icon" aria-hidden="true">
							<svg viewBox="0 0 24 24">
								<circle
									cx="11"
									cy="11"
									r="5.8"
									fill="none"
									stroke="currentColor"
									stroke-width="1.8"
								/>
								<path
									d="m15.2 15.2 4.1 4.1"
									fill="none"
									stroke="currentColor"
									stroke-width="1.8"
									stroke-linecap="round"
								/>
							</svg>
						</span>
						<input
							class="header-search__input"
							type="search"
							name="q"
							placeholder="Search the store"
							autocomplete="off"
							autocapitalize="none"
							enterkeyhint="search"
							bind:value={mobileSearch}
							onfocus={() => {
								if (mobileSearch.trim()) {
									searchOpen = true;
								}
							}}
							oninput={(event) => setSearchValue((event.currentTarget as HTMLInputElement).value)}
						/>
					</form>

					{#if searchOpen && mobileSearch.trim()}
						<div class="header-search__panel header-search__panel--mobile">
							{#if searchLoading}
								<p class="header-search__state">Searching...</p>
							{:else if searchError}
								<p class="header-search__state">{searchError}</p>
							{:else if searchResults.length === 0}
								<p class="header-search__state">No products matched your search.</p>
							{:else}
								<div class="header-search__results">
									{#each searchResults as item (item.id)}
										<a
											class="header-search__item"
											href={resolve('/products/[slug]', { slug: item.slug })}
											onclick={closeMenus}
										>
											<img src={item.image} alt={item.name} />
											<span class="header-search__copy">
												<strong>{item.name}</strong>
												<span>{item.categoryName}</span>
											</span>
											<span class="header-search__price">
												{item.currency}
												{item.price.toFixed(2)}
											</span>
										</a>
									{/each}
								</div>
							{/if}
							<form
								class="header-search__view-all-form"
								method="get"
								action={resolve('/shop')}
								onsubmit={handleSearchSubmit}
							>
								<input type="hidden" name="q" value={mobileSearch.trim()} />
								<button class="header-search__view-all" type="submit">View all results</button>
							</form>
						</div>
					{/if}
				</div>
			</div>

			<nav class="mobile-drawer__nav">
				<a href={resolve('/shop')} onclick={closeMenus}>Shop all</a>
				<a href={resolve('/')} onclick={closeMenus}>Vitto Lifestyle</a>
				<a href={resolve('/sale')} onclick={closeMenus}>On Sale</a>
				<div class="mobile-drawer__group">
					<button
						type="button"
						class="mobile-drawer__toggle"
						aria-expanded={drawerCollectionsOpen}
						onclick={() => (drawerCollectionsOpen = !drawerCollectionsOpen)}
					>
						Collections
						<span>{drawerCollectionsOpen ? '-' : '+'}</span>
					</button>
					<div class:open={drawerCollectionsOpen} class="mobile-drawer__submenu">
						{#each groupedCategories as section (section.group)}
							<div class="mobile-drawer__submenu-group">
								<button
									class="mobile-drawer__submenu-parent"
									type="button"
									onclick={() => openShopGroup(section.group)}
								>
									{section.label}
								</button>
								<div class="mobile-drawer__submenu-links">
									{#each section.items as item (item.id)}
										<a
											href={resolve('/collections/[slug]', { slug: item.slug })}
											onclick={closeMenus}
										>
											{item.name}
										</a>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				</div>
			</nav>
		</div>

		<div class="mobile-drawer__footer">
			<div class="mobile-drawer__actions">
				{#if user}
					{#if isAdmin}
						<a href={resolve('/admin')}>Admin Panel</a>
					{:else}
						<a href={resolve('/account/profile')}>My Account</a>
					{/if}
					<form method="post" action={resolve('/account/sign-out')}>
						<button type="submit">Logout</button>
					</form>
				{:else}
					<a href={resolve('/account/sign-in')}>Sign In</a>
					<a href={resolve('/account/sign-in')}>Create Account</a>
				{/if}
			</div>
		</div>
	</aside>
{/if}
