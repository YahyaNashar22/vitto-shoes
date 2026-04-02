<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form } = $props<{ data: PageData; form: ActionData }>();
</script>

<section class="hero-grid account-auth-layout">
	<div class="hero-panel">
		<p class="eyebrow">New password</p>
		<h1>Choose a new password</h1>
		<p class="muted">Use a strong password with at least 8 characters.</p>
	</div>

	<form class="form-panel stack" method="post" action="?/resetPassword" use:enhance>
		<input type="hidden" name="token" value={data.token} />
		<label class="form-row">
			<span>New password</span>
			<input
				name="newPassword"
				type="password"
				autocomplete="new-password"
				minlength="8"
				required
			/>
		</label>
		<label class="form-row">
			<span>Confirm new password</span>
			<input
				name="confirmPassword"
				type="password"
				autocomplete="new-password"
				minlength="8"
				required
			/>
		</label>
		<button class="button-primary" type="submit">Reset password</button>
		{#if form?.message}
			<p class="table-note">{form.message}</p>
		{/if}
	</form>
</section>
