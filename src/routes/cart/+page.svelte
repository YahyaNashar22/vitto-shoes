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
			<div class="table-wrap">
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
		</div>

		<aside class="panel stack">
			<div>
				<p class="eyebrow">Summary</p>
				<h2>{formatCurrency($cartSubtotal)}</h2>
			</div>
			<p class="muted">Shipping is confirmed manually on WhatsApp after the order is saved.</p>
			<div class="action-stack">
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
