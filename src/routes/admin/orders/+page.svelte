<script lang="ts">
	import { resolve } from '$app/paths';
	import type { OrderSummary } from '$lib/types';
	import { formatCurrency, toTitleCase } from '$lib/utils';
	import type { ActionData, PageData } from './$types';

	let { data, form } = $props<{ data: PageData; form: ActionData }>();

	const pendingCount = $derived(
		data.orders.filter((item: OrderSummary) => item.status === 'pending').length
	);
	const processingCount = $derived(
		data.orders.filter((item: OrderSummary) => ['confirmed', 'processing'].includes(item.status))
			.length
	);
	const completedCount = $derived(
		data.orders.filter((item: OrderSummary) => item.status === 'completed').length
	);
</script>

<div class="stack">
	<section class="panel stack" id="orders-summary">
		<div class="toolbar-row">
			<div class="section-heading" style="margin-bottom: 0;">
				<p class="eyebrow">Orders</p>
				<h2>Requested orders</h2>
				<p class="muted">Track WhatsApp cash-on-delivery requests and update their progress.</p>
			</div>
			<div class="chip-row">
				<form method="get" action={resolve('/admin/orders')} class="chip-row">
					<select name="time" onchange={(event) => event.currentTarget.form?.requestSubmit()}>
						{#each data.timeFilterOptions as option (option)}
							<option value={option} selected={data.timeFilter === option}>
								{option === 'all'
									? 'All time'
									: option === 'today'
										? 'Today'
										: option === '7d'
											? 'Last 7 days'
											: option === '30d'
												? 'Last 30 days'
												: 'Last year'}
							</option>
						{/each}
					</select>
				</form>
				<a class="button-secondary" href={resolve('/admin/export/orders.xlsx')}>Export Excel</a>
			</div>
		</div>

		<div class="stats-grid">
			<div class="admin-card panel">
				<p class="eyebrow">Pending</p>
				<h2>{pendingCount}</h2>
			</div>
			<div class="admin-card panel">
				<p class="eyebrow">In progress</p>
				<h2>{processingCount}</h2>
			</div>
			<div class="admin-card panel">
				<p class="eyebrow">Completed</p>
				<h2>{completedCount}</h2>
			</div>
		</div>

		{#if form?.ordersMessage}
			<p class="success-banner">{form.ordersMessage}</p>
		{/if}
	</section>

	<section class="table-panel stack" id="orders-queue">
		<div class="toolbar-row">
			<div>
				<h2>Order queue</h2>
				<p class="admin-helper">
					Review customer details, ordered items, and update the current status.
				</p>
			</div>
		</div>

		<div class="table-wrap">
			<table>
				<thead>
					<tr>
						<th>Order</th>
						<th>Customer</th>
						<th>Items</th>
						<th>Total</th>
						<th>Status</th>
					</tr>
				</thead>
				<tbody>
					{#each data.orders as item (item.id)}
						<tr>
							<td>
								<strong>{item.orderNumber}</strong>
								<p class="table-note">{new Date(item.createdAt).toLocaleString()}</p>
							</td>
							<td>
								<strong>{item.customerName}</strong>
								<p class="table-note">{item.customerPhone}</p>
								<p class="table-note">{item.customerAddress}</p>
							</td>
							<td>
								{#each item.items as product (product.id)}
									<p>{product.productName} x{product.quantity}</p>
								{/each}
							</td>
							<td>{formatCurrency(item.total)}</td>
							<td>
								<form method="post" action="?/updateStatus" class="action-stack">
									<input type="hidden" name="id" value={item.id} />
									<input type="hidden" name="time" value={data.timeFilter} />
									<select name="status">
										{#each data.statuses as status (status)}
											<option value={status} selected={item.status === status}
												>{toTitleCase(status)}</option
											>
										{/each}
									</select>
									<button class="button-secondary" type="submit">Save</button>
								</form>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
</div>
