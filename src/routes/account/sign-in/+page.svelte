<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import type { ActionData } from './$types';

	let { form } = $props<{ form: ActionData }>();

	const next = $derived(page.url.searchParams.get('next') || '/account/profile');
</script>

<section class="hero-grid account-auth-layout">
	<div class="hero-panel">
		<p class="eyebrow">Your account</p>
		<h1>Sign in or create your profile</h1>
		<p class="muted">
			Customers can track details, keep delivery information ready, and move through checkout
			faster. Admin access is handled separately by role.
		</p>
	</div>

	<div class="stack">
		<form class="form-panel stack" method="post" action="?/signIn" use:enhance autocomplete="on">
			<input type="hidden" name="next" value={next} />
			<div class="section-heading">
				<p class="eyebrow">Sign in</p>
				<h2>Welcome back</h2>
			</div>
			<label class="form-row">
				<span>Email</span>
				<input
					id="email"
					name="email"
					type="email"
					inputmode="email"
					autocomplete="username"
					autocapitalize="none"
					autocorrect="off"
					spellcheck="false"
					required
				/>
			</label>
			<label class="form-row">
				<span>Password</span>
				<input
					id="password"
					name="password"
					type="password"
					autocomplete="current-password"
					required
				/>
			</label>
			<div class="toolbar-row account-auth-toolbar">
				<a class="table-note" href={resolve('/account/forgot-password')}>Forgot password?</a>
				<button class="button-primary" type="submit">Sign in</button>
			</div>
			{#if form?.message}
				<p class="table-note">{form.message}</p>
			{/if}
		</form>

		<form class="form-panel stack" method="post" action="?/signUp" use:enhance autocomplete="on">
			<input type="hidden" name="next" value={next} />
			<div class="section-heading">
				<p class="eyebrow">Create account</p>
				<h2>New customer</h2>
			</div>
			<label class="form-row">
				<span>Full name</span>
				<input name="name" type="text" autocomplete="name" required />
			</label>
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
			<label class="form-row">
				<span>Password</span>
				<input name="password" type="password" autocomplete="new-password" minlength="8" required />
			</label>
			<button class="button-primary" type="submit">Create account</button>
		</form>
	</div>
</section>
