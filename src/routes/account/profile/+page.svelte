<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form } = $props<{ data: PageData; form: ActionData }>();
</script>

<section class="stack">
	<div class="section-heading">
		<p class="eyebrow">My account</p>
		<h1>Profile settings</h1>
		<p class="muted">
			Keep your delivery information updated and manage your password from one place.
		</p>
	</div>

	<div class="editorial-grid account-profile-grid">
		<form class="form-panel stack" method="post" action="?/updateProfile" use:enhance>
			<div class="section-heading">
				<p class="eyebrow">Profile</p>
				<h2>Contact details</h2>
			</div>
			<div class="chip-row">
				<!-- <span class="chip">Role: {data.role}</span> -->
				{#if data.isAdmin}
					<a class="chip" href={resolve('/admin')}>Open admin</a>
				{/if}
			</div>
			<label class="form-row">
				<span>Full name</span>
				<input name="name" type="text" value={data.user?.name ?? ''} autocomplete="name" required />
			</label>
			<label class="form-row">
				<span>Email</span>
				<input type="email" value={data.user?.email ?? ''} disabled />
			</label>
			<label class="form-row">
				<span>Phone</span>
				<input name="phone" type="text" value={data.user?.phone ?? ''} autocomplete="tel" />
			</label>
			<label class="form-row">
				<span>City</span>
				<input
					name="city"
					type="text"
					value={data.user?.city ?? ''}
					autocomplete="address-level2"
				/>
			</label>
			<label class="form-row">
				<span>Address</span>
				<textarea name="address" autocomplete="street-address">{data.user?.address ?? ''}</textarea>
			</label>
			<button class="button-primary" type="submit">Save profile</button>
			{#if form?.message}
				<p class="table-note">{form.message}</p>
			{/if}
		</form>

		<div class="stack">
			<form class="form-panel stack" method="post" action="?/changePassword" use:enhance>
				<div class="section-heading">
					<p class="eyebrow">Security</p>
					<h2>Change password</h2>
				</div>
				<label class="form-row">
					<span>Current password</span>
					<input name="currentPassword" type="password" autocomplete="current-password" required />
				</label>
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
					<span>Confirm password</span>
					<input
						name="confirmPassword"
						type="password"
						autocomplete="new-password"
						minlength="8"
						required
					/>
				</label>
				<button class="button-primary" type="submit">Update password</button>
			</form>

			<form class="form-panel stack" method="post" action="?/signOut" use:enhance>
				<div class="section-heading">
					<p class="eyebrow">Session</p>
					<h2>Sign out</h2>
				</div>
				<p class="muted">End your current session on this device.</p>
				<button class="button-secondary" type="submit">Sign out</button>
			</form>
		</div>
	</div>

	<section class="stack related-section" id="saved-products">
		<div class="section-heading related-section__heading">
			<p class="eyebrow">Wishlist</p>
			<h2>Saved products</h2>
			<p class="muted">Keep track of the products you want to revisit later.</p>
		</div>

		{#if data.wishlistProducts.length}
			<div class="product-rail related-rail">
				{#each data.wishlistProducts as item (item.id)}
					<div class="product-rail__item">
						<ProductCard product={item} />
					</div>
				{/each}
			</div>
		{:else}
			<div class="empty-state">
				<h3>Your wishlist is empty</h3>
				<p>Tap the heart icon on a product to save it here.</p>
				<a class="button-primary" href={resolve('/shop')}>Browse products</a>
			</div>
		{/if}
	</section>
</section>
