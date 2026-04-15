<script lang="ts">
	import { resolve } from '$app/paths';
	import { cart, cartSubtotal } from '$lib/stores/cart';
	import { formatCurrency } from '$lib/utils';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<section class="section-heading">
	<p class="eyebrow">Checkout</p>
	<h1>Complete your order</h1>
	<p class="muted">
		Review the summary, enter your delivery details, and confirm the order for WhatsApp follow-up.
	</p>
</section>

{#if $cart.length}
	<form class="checkout-page-shell" method="post">
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

		<div class="checkout-grid checkout-grid--stacked">
			<aside
				class="panel stack cart-summary-panel cart-summary-panel--cavin cart-summary-panel--checkout"
			>
				<div>
					<p class="eyebrow">Summary</p>
					<h2>{formatCurrency($cartSubtotal)}</h2>
				</div>
				<p class="muted">Shipping is confirmed manually on WhatsApp after the order is saved.</p>

				<div class="checkout-summary checkout-summary--embedded">
					<div class="toolbar-row">
						<h3>Order summary</h3>
						<strong>{formatCurrency($cartSubtotal)}</strong>
					</div>
					{#each $cart as item (item.cartKey)}
						<div class="checkout-summary__item">
							<div class="checkout-summary__media">
								<img
									class="media-thumb"
									src={item.image || '/placeholder-product.webp'}
									alt={item.name}
								/>
								<div>
									<strong>{item.name}</strong>
									{#if item.variantLabel}
										<p class="muted">{item.variantLabel}</p>
									{/if}
								</div>
							</div>
							<div>{formatCurrency(item.price * item.quantity)}</div>
						</div>
					{/each}
					<hr class="summary-divider" />
					<div class="toolbar-row">
						<span>Subtotal</span>
						<span>{formatCurrency($cartSubtotal)}</span>
					</div>
					<div class="toolbar-row">
						<span>Shipping</span>
						<span>Calculated on WhatsApp</span>
					</div>
					<div class="toolbar-row">
						<strong>Total</strong>
						<strong>{formatCurrency($cartSubtotal)}</strong>
					</div>
				</div>
			</aside>

			<div class="form-panel stack">
				<div class="section-heading">
					<p class="eyebrow">Delivery</p>
					<h2>Customer details</h2>
				</div>

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
					<textarea
						name="notes"
						placeholder="Size preference, delivery notes, or anything the store should know."
					></textarea>
				</label>

				<label class="form-row">
					<span>Coupon code</span>
					<input name="couponCode" placeholder="Enter coupon code" />
					<small class="muted">Coupon validation is confirmed manually before fulfillment.</small>
				</label>

				{#if form?.message}
					<p class="table-note">{form.message}</p>
				{/if}

				<div class="action-stack">
					<button class="button-primary" type="submit">Confirm order</button>
					<a class="button-secondary" href={resolve('/cart')}>Back to cart</a>
				</div>
			</div>
		</div>
	</form>
{:else}
	<section class="empty-state">
		<h2>Your cart is empty</h2>
		<p>Add products to the cart before heading to checkout.</p>
		<a class="button-primary" href={resolve('/shop')}>Start shopping</a>
	</section>
{/if}
