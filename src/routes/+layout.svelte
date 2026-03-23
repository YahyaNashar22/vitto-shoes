<script lang="ts">
	import type { Snippet } from 'svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import type { LayoutData } from './$types';

	let { children, data } = $props<{ children: Snippet; data: LayoutData }>();
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
</div>
