<script lang="ts">
	import { resolve } from '$app/paths';
	import { cart, cartSubtotal } from '$lib/stores/cart';
	import { formatCurrency } from '$lib/utils';

	let couponOpen = $state(false);
	let noteOpen = $state(false);
</script>

<section class="section-heading">
	<p class="eyebrow">Cart</p>
	<h1>Your selected items</h1>
	<p class="muted">Review the basket, update quantities, and continue to the dedicated checkout.</p>
</section>

{#if $cart.length}
	<div class="catalog-layout aside-layout cart-layout">
		<div class="table-panel cart-order-panel">
			<div class="table-wrap cart-table-wrap">
				<table>
					<thead>
						<tr>
							<th>Product</th>
							<th>Quantity</th>
							<th>Total</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each $cart as item (item.cartKey)}
							<tr>
								<td>
									<div class="media-inline">
										<img
											class="media-thumb"
											src={item.image || '/placeholder-product.svg'}
											alt={item.name}
										/>
										<div>
											<a href={resolve('/products/[slug]', { slug: item.slug })}
												><strong>{item.name}</strong></a
											>
											<p class="muted">{item.categoryName}</p>
											{#if item.variantLabel}
												<p class="muted">{item.variantLabel}</p>
											{/if}
										</div>
									</div>
								</td>
								<td>
									<input
										class="qty-input"
										type="number"
										min="1"
										value={item.quantity}
										onchange={(event) =>
											cart.setQuantity(
												item.cartKey,
												Number((event.currentTarget as HTMLInputElement).value)
											)}
									/>
								</td>
								<td>{formatCurrency(item.price * item.quantity)}</td>
								<td>
									<button
										class="button-secondary"
										type="button"
										onclick={() => cart.remove(item.cartKey)}>Remove</button
									>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<div class="cart-mobile-list">
				{#each $cart as item (item.cartKey)}
					<article class="cart-mobile-item cart-mobile-item--cavin">
						<div class="cart-mobile-item__media">
							<img
								class="media-thumb"
								src={item.image || '/placeholder-product.svg'}
								alt={item.name}
							/>
							<div class="cart-mobile-item__copy">
								<a href={resolve('/products/[slug]', { slug: item.slug })}>
									<strong>{item.name}</strong>
								</a>
								{#if item.variantColor}
									<p class="muted">Color: {item.variantColor}</p>
								{/if}
								{#if item.variantSize}
									<p class="muted">Size: {item.variantSize}</p>
								{/if}
								<button
									class="cart-mobile-item__link"
									type="button"
									onclick={() => cart.remove(item.cartKey)}>Remove</button
								>
							</div>
							<div class="cart-mobile-item__price">
								{formatCurrency(item.price * item.quantity)}
							</div>
						</div>

						<div class="cart-mobile-item__meta">
							<div class="cart-mobile-stepper">
								<button
									type="button"
									onclick={() => cart.setQuantity(item.cartKey, item.quantity - 1)}
								>
									&minus;
								</button>
								<span>{item.quantity}</span>
								<button
									type="button"
									onclick={() => cart.setQuantity(item.cartKey, item.quantity + 1)}
								>
									+
								</button>
							</div>
						</div>
					</article>
				{/each}
			</div>

			<div class="cart-detail-tools">
				<div class="cart-coupon-row cart-coupon-row--inline">
					<button class="button-secondary" type="button" onclick={() => (noteOpen = !noteOpen)}>
						<span aria-hidden="true"
							><svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="#0f0f0f"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M12 20h9"></path>
								<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
							</svg></span
						>
						<span>Note</span>
					</button>
					<button
						class="button-secondary cart-coupon-row__button"
						type="button"
						onclick={() => (couponOpen = !couponOpen)}
					>
						<span aria-hidden="true"
							><svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="#0f0f0f"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4V7z"></path>
								<line x1="12" y1="7" x2="12" y2="17" stroke-dasharray="2 2"></line>
							</svg></span
						>
						<span>Coupon</span>
					</button>
				</div>

				{#if noteOpen}
					<label class="form-row cart-inline-panel">
						<span>Order note</span>
						<textarea
							rows="4"
							placeholder="Size preference, delivery notes, or anything the store should know."
						></textarea>
					</label>
				{/if}

				{#if couponOpen}
					<label class="form-row cart-inline-panel">
						<span>Coupon code</span>
						<input placeholder="Enter coupon code" />
						<small class="muted">Coupon validation is confirmed manually before fulfillment.</small>
					</label>
				{/if}
			</div>
		</div>

		<aside class="panel stack cart-summary-panel cart-summary-panel--cavin">
			<div>
				<p class="eyebrow">Summary</p>
				<h2>{formatCurrency($cartSubtotal)}</h2>
			</div>
			<p class="muted">Shipping is confirmed manually on WhatsApp after the order is saved.</p>
			<div class="action-stack cart-summary-actions">
				<a class="button-primary" href={resolve('/checkout')}>Proceed to checkout</a>
				<button class="button-secondary" type="button" onclick={() => cart.clear()}
					>Clear cart</button
				>
			</div>
		</aside>
	</div>
{:else}
	<section class="empty-state">
		<h2>Your cart is empty</h2>
		<p>Browse the catalog and add products before going to checkout.</p>
		<a class="button-primary" href={resolve('/shop')}>Start shopping</a>
	</section>
{/if}
