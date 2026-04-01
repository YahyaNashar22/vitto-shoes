<script lang="ts">
	import { resolve } from '$app/paths';
	import { cart, cartSubtotal } from '$lib/stores/cart';
	import { formatCurrency } from '$lib/utils';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<section class="section-heading">
	<p class="eyebrow">Checkout</p>
	<h1>Confirm order details</h1>
	<p class="muted">
		Submitting this form creates an order record and prepares a WhatsApp confirmation message.
	</p>
</section>

{#if $cart.length}
	<div class="checkout-grid aside-layout">
		<form class="form-panel stack" method="post">
			<input
				type="hidden"
				name="items"
				value={JSON.stringify(
					$cart.map(
						({
							productId,
							quantity,
							variantBarcode,
							variantColor,
							variantSize,
							variantLabel,
							price
						}) => ({
							productId,
							quantity,
							variantBarcode,
							variantColor,
							variantSize,
							variantLabel,
							price
						})
					)
				)}
			/>
			<div class="field-grid">
				<label class="form-row">
					<span>Name</span>
					<input name="name" required />
				</label>
				<label class="form-row">
					<span>Phone</span>
					<input name="phone" required />
				</label>
				<label class="form-row">
					<span>Email</span>
					<input name="email" type="email" />
				</label>
				<label class="form-row">
					<span>City</span>
					<input name="city" />
				</label>
			</div>
			<label class="form-row">
				<span>Address</span>
				<textarea name="address" required></textarea>
			</label>
			<label class="form-row">
				<span>Notes</span>
				<textarea name="notes" placeholder="Size preference, delivery notes, etc."></textarea>
			</label>
			{#if form?.message}
				<p class="table-note">{form.message}</p>
			{/if}
			<button class="button-primary" type="submit">Create order</button>
		</form>

		<aside class="panel stack">
			<h2>Order summary</h2>
			{#each $cart as item (item.cartKey)}
				<div class="summary-item">
					<div>
						<strong>{item.name}</strong>
						<p class="muted">Qty {item.quantity}</p>
						{#if item.variantLabel}
							<p class="muted">{item.variantLabel}</p>
						{/if}
					</div>
					<div>{formatCurrency(item.price * item.quantity)}</div>
				</div>
			{/each}
			<hr class="summary-divider" />
			<div class="toolbar-row">
				<span>Total</span>
				<strong>{formatCurrency($cartSubtotal)}</strong>
			</div>
		</aside>
	</div>
{:else}
	<section class="empty-state">
		<h2>No items ready for checkout</h2>
		<p>Add products to the cart first.</p>
		<a class="button-primary" href={resolve('/shop')}>Browse products</a>
	</section>
{/if}
