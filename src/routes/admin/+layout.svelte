<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';

	let { children } = $props<{ children: Snippet }>();
</script>

<section class="admin-shell">
	<aside class="admin-sidebar panel">
		<div class="stack">
			<div class="section-heading" style="margin-bottom: 0;">
				<p class="eyebrow">Admin panel</p>
				<h1>Store management</h1>
				<p class="muted">
					Manage the catalog, track order requests, and export data from one place.
				</p>
			</div>

			<nav class="admin-nav stack">
				<a
					class:active={page.url.pathname === '/admin'}
					class="admin-nav-link"
					href={resolve('/admin')}
				>
					<span>Overview</span>
					<small>Dashboard and recent activity</small>
				</a>
				<a
					class:active={page.url.pathname.startsWith('/admin/catalog')}
					class="admin-nav-link"
					href={resolve('/admin/catalog/categories')}
				>
					<span>Catalog</span>
					<small>Categories, products, imports</small>
				</a>
				<a
					class:active={page.url.pathname.startsWith('/admin/orders')}
					class="admin-nav-link"
					href={resolve('/admin/orders')}
				>
					<span>Orders</span>
					<small>Requested orders and statuses</small>
				</a>
			</nav>

			{#if page.url.pathname.startsWith('/admin/catalog')}
				<div class="admin-subnav stack">
					<p class="eyebrow">Catalog tabs</p>
					<a
						class:active={page.url.pathname === '/admin/catalog/categories'}
						class="admin-subnav-link"
						href={resolve('/admin/catalog/categories')}>Categories</a
					>
					<a
						class:active={page.url.pathname === '/admin/catalog/products'}
						class="admin-subnav-link"
						href={resolve('/admin/catalog/products')}>Products</a
					>
					<a
						class:active={page.url.pathname === '/admin/catalog/import-export'}
						class="admin-subnav-link"
						href={resolve('/admin/catalog/import-export')}>Import / Export</a
					>
				</div>
			{:else if page.url.pathname.startsWith('/admin/orders')}
				<div class="admin-subnav stack">
					<p class="eyebrow">Order tabs</p>
					<a
						class:active={page.url.pathname === '/admin/orders'}
						class="admin-subnav-link"
						href={resolve('/admin/orders')}>Order queue</a
					>
				</div>
			{/if}
		</div>
	</aside>

	<div class="admin-content">
		{@render children()}
	</div>
</section>
