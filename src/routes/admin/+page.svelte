<script lang="ts">
	import { resolve } from '$app/paths';
	import { formatCurrency, toTitleCase } from '$lib/utils';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
</script>

<div class="stack">
	<section class="panel stack">
		<div class="toolbar-row">
			<div class="section-heading" style="margin-bottom: 0;">
				<p class="eyebrow">Overview</p>
				<h2>Store snapshot</h2>
				<p class="muted">
					Start here for a quick read on activity, then jump into catalog updates or order handling.
				</p>
			</div>
			<div class="action-stack">
				<a class="button-primary" href={resolve('/admin/catalog')}>Manage catalog</a>
				<a class="button-secondary" href={resolve('/admin/orders')}>Open orders</a>
			</div>
		</div>
		<div class="stats-grid">
			{#each data.stats as stat (stat.label)}
				<div class="admin-card panel">
					<p class="eyebrow">{stat.label}</p>
					<h2>{stat.value}</h2>
				</div>
			{/each}
		</div>
	</section>

	<section class="admin-section-grid admin-overview">
		<div class="table-panel stack">
			<div class="toolbar-row">
				<div>
					<h2>Recent orders</h2>
					<p class="admin-helper">Newest checkout requests that may need a status update.</p>
				</div>
				<a class="button-secondary" href={resolve('/admin/orders')}>Manage orders</a>
			</div>
			<div class="table-wrap">
				<table>
					<thead>
						<tr>
							<th>Order</th>
							<th>Status</th>
							<th>Customer</th>
							<th>Total</th>
						</tr>
					</thead>
					<tbody>
						{#each data.recentOrders as order (order.id)}
							<tr>
								<td>{order.orderNumber}</td>
								<td><span class="status-pill">{toTitleCase(order.status)}</span></td>
								<td>{order.customerName}</td>
								<td>{formatCurrency(order.total)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<div class="table-panel stack">
			<div class="toolbar-row">
				<div>
					<h2>Recent products</h2>
					<p class="admin-helper">Latest catalog entries added to the storefront.</p>
				</div>
				<a class="button-secondary" href={resolve('/admin/catalog')}>Manage catalog</a>
			</div>
			<div class="table-wrap">
				<table>
					<thead>
						<tr>
							<th>Name</th>
							<th>Category</th>
							<th>Price</th>
						</tr>
					</thead>
					<tbody>
						{#each data.recentProducts as product (product.id)}
							<tr>
								<td>{product.name}</td>
								<td>{product.categoryName}</td>
								<td>{formatCurrency(product.price)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</section>
</div>
