<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { cart } from '$lib/stores/cart';

	onMount(() => {
		cart.clear();

		const url = page.url.searchParams.get('whatsapp');
		if (url) {
			window.open(url, '_blank', 'noopener,noreferrer');
		}
	});
</script>

<section class="empty-state">
	<h1>Order saved</h1>
	<p>
		Order <strong>{page.url.searchParams.get('order')}</strong> was created successfully. A WhatsApp window
		should open so the customer can send the order details.
	</p>
	<div class="chip-row" style="justify-content:center;">
		<a class="button-primary" href={resolve('/')}>Return home</a>
		<a class="button-secondary" href={resolve('/admin/orders')}>View orders</a>
	</div>
</section>
