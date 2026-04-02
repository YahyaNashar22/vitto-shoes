<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form } = $props<{ form: ActionData }>();
</script>

<section class="hero-grid account-auth-layout">
	<div class="hero-panel">
		<p class="eyebrow">Password reset</p>
		<h1>Reset your password</h1>
		<p class="muted">Enter your account email and we will generate a reset link for you.</p>
	</div>

	<form class="form-panel stack" method="post" action="?/requestReset" use:enhance>
		<div class="section-heading">
			<p class="eyebrow">Forgot password</p>
			<h2>Request reset</h2>
		</div>
		<label class="form-row">
			<span>Email</span>
			<input
				name="email"
				type="email"
				inputmode="email"
				autocomplete="email"
				autocapitalize="none"
				autocorrect="off"
				spellcheck="false"
				required
			/>
		</label>
		<button class="button-primary" type="submit">Send reset link</button>
		{#if form?.message}
			<p class="table-note">{form.message}</p>
		{/if}
	</form>
</section>
