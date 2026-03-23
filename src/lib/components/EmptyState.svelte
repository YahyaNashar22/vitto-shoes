<script lang="ts">
	import { resolve } from '$app/paths';

	let { title, copy, href, cta } = $props<{
		title: string;
		copy: string;
		href?: string;
		cta?: string;
	}>();
</script>

<section class="empty-state">
	<h2>{title}</h2>
	<p>{copy}</p>
	{#if href && cta}
		<a class="button-primary" href={resolve(href)}>{cta}</a>
	{/if}
</section>
