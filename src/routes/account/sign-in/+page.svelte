<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form } = $props<{ form: ActionData }>();
</script>

<section class="hero-grid">
	<div class="hero-panel">
		<p class="eyebrow">Admin access</p>
		<h1>Sign in to manage the store</h1>
		<p class="muted">
			Use a Better Auth account whose email is listed in <code>ADMIN_EMAILS</code> to access the admin
			panel.
		</p>
	</div>

	<form class="form-panel stack" method="post" action="?/signIn" use:enhance>
		<label class="form-row">
			<span>Email</span>
			<input name="email" type="email" required />
		</label>
		<label class="form-row">
			<span>Password</span>
			<input name="password" type="password" required />
		</label>
		<button class="button-primary" type="submit">Sign in</button>
		{#if form?.message}
			<p class="table-note">{form.message}</p>
		{/if}
	</form>
</section>
