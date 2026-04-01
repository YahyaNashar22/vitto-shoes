<script lang="ts">
	import { resolve } from '$app/paths';
	import { cart, cartSubtotal } from '$lib/stores/cart';
	import { formatCurrency } from '$lib/utils';
</script>

<section class="section-heading">
	<p class="eyebrow">Cart</p>
	<h1>Your selected items</h1>
	<p class="muted">
		The cart is stored locally for speed and can be turned into a WhatsApp order at checkout.
	</p>
</section>

{#if $cart.length}
	<div class="catalog-layout aside-layout">
		<div class="table-panel">
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
									<button class="button-secondary" onclick={() => cart.remove(item.cartKey)}
										>Remove</button
									>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<div class="cart-mobile-list">
				{#each $cart as item (item.cartKey)}
					<article class="cart-mobile-item">
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
								<p class="muted">{item.categoryName}</p>
								{#if item.variantLabel}
									<p class="muted">{item.variantLabel}</p>
								{/if}
							</div>
						</div>

						<div class="cart-mobile-item__meta">
							<label class="form-row cart-mobile-item__qty">
								<span>Quantity</span>
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
							</label>

							<div class="cart-mobile-item__total">
								<span class="muted">Total</span>
								<strong>{formatCurrency(item.price * item.quantity)}</strong>
							</div>
						</div>

						<button
							class="button-secondary cart-mobile-item__remove"
							onclick={() => cart.remove(item.cartKey)}>Remove</button
						>
					</article>
				{/each}
			</div>
		</div>

		<aside class="panel stack cart-summary-panel">
			<div>
				<p class="eyebrow">Summary</p>
				<h2>{formatCurrency($cartSubtotal)}</h2>
			</div>
			<p class="muted">Shipping is confirmed manually on WhatsApp after the order is saved.</p>
			<div class="action-stack cart-summary-actions">
				<a class="button-primary" href={resolve('/checkout')}>Proceed to checkout</a>
				<button class="button-secondary" onclick={() => cart.clear()}>Clear cart</button>
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
