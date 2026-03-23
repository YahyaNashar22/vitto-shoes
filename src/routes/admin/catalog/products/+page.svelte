<script lang="ts">
	import { formatCurrency } from '$lib/utils';
	import type { ActionData, PageData } from './$types';

	let { data, form } = $props<{ data: PageData; form: ActionData }>();
</script>

<div class="stack">
	{#if form?.catalogMessage}
		<p class="success-banner">{form.catalogMessage}</p>
	{/if}

	<section class="panel stack">
		<div class="section-heading" style="margin-bottom: 0;">
			<p class="eyebrow">Catalog tab</p>
			<h2>Products</h2>
			<p class="muted">
				Add sellable items, upload product photos, and configure price, stock, and variants.
			</p>
		</div>
	</section>

	<section class="admin-section-grid">
		<div class="table-panel stack">
			<div class="toolbar-row">
				<div>
					<h2>Create product</h2>
					<p class="admin-helper">The main image and gallery are uploaded as files.</p>
				</div>
			</div>

			<form method="post" action="?/saveProduct" enctype="multipart/form-data" class="stack">
				<div class="field-grid">
					<label class="form-row">
						<span>External ID</span>
						<input name="externalId" type="number" />
					</label>
					<label class="form-row">
						<span>Code</span>
						<input name="code" />
					</label>
					<label class="form-row">
						<span>Barcode</span>
						<input name="barcode" />
					</label>
					<label class="form-row">
						<span>Name</span>
						<input name="name" required />
					</label>
					<label class="form-row">
						<span>Slug</span>
						<input name="slug" />
					</label>
					<label class="form-row">
						<span>SKU</span>
						<input name="sku" required />
					</label>
					<label class="form-row">
						<span>Category</span>
						<select name="categoryId" required>
							<option value="">Select category</option>
							{#each data.categories as item (item.id)}
								<option value={item.id}>{item.name}</option>
							{/each}
						</select>
					</label>
					<label class="form-row"
						><span>Price</span><input name="price" type="number" step="0.01" required /></label
					>
					<label class="form-row"
						><span>Compare at price</span><input
							name="compareAtPrice"
							type="number"
							step="0.01"
						/></label
					>
					<label class="form-row"
						><span>Qty</span><input name="qty" type="number" value="0" /></label
					>
					<label class="form-row"><span>Currency</span><input name="currency" value="USD" /></label>
					<label class="form-row"
						><span>Sort order</span><input name="sortOrder" type="number" value="0" /></label
					>
					<label class="form-row"><span>Color</span><input name="color" /></label>
					<label class="form-row"><span>Material</span><input name="material" /></label>
					<label class="form-row"><span>X Dimension</span><input name="xDim" /></label>
					<label class="form-row"><span>Y Dimension</span><input name="yDim" /></label>
					<label class="form-row"
						><span>Main image upload</span><input
							name="imageFile"
							type="file"
							accept="image/*"
						/></label
					>
					<label class="form-row"
						><span>Gallery uploads</span><input
							name="galleryFiles"
							type="file"
							accept="image/*"
							multiple
						/></label
					>
				</div>
				<label class="form-row"
					><span>Short description</span><textarea name="shortDescription"></textarea></label
				>
				<label class="form-row"
					><span>Full description</span><textarea name="description"></textarea></label
				>
				<label class="form-row"
					><span>Details JSON</span><textarea
						name="details"
						placeholder="Paste a JSON array of detail rows"
					></textarea></label
				>
				<div class="chip-row">
					<label class="checkbox-row"
						><input type="checkbox" name="isFeatured" /> <span>Featured</span></label
					>
					<label class="checkbox-row"
						><input type="checkbox" name="onSale" /> <span>On sale</span></label
					>
					<label class="checkbox-row"
						><input type="checkbox" name="isPublished" checked /> <span>Published</span></label
					>
				</div>
				<div class="action-stack">
					<button class="button-primary" type="submit">Save product</button>
				</div>
			</form>
		</div>

		<div class="table-panel stack">
			<div class="toolbar-row">
				<div>
					<h2>Existing products</h2>
					<p class="admin-helper">Review the image, category, stock level, and publish state.</p>
				</div>
			</div>

			<div class="table-wrap">
				<table>
					<thead>
						<tr>
							<th>Product</th>
							<th>Category</th>
							<th>Price</th>
							<th>Qty</th>
							<th>State</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each data.products as item (item.id)}
							<tr>
								<td>
									<div class="media-inline">
										<img
											class="media-thumb"
											src={item.image || '/placeholder-product.svg'}
											alt={item.name}
										/>
										<div>
											<strong>{item.name}</strong>
											<p class="table-note">{item.code || item.sku}</p>
										</div>
									</div>
								</td>
								<td>{item.categoryName}</td>
								<td>{formatCurrency(item.price)}</td>
								<td>{item.qty}</td>
								<td
									>{item.onSale ? 'Sale' : 'Regular'} / {item.isPublished
										? 'Published'
										: 'Hidden'}</td
								>
								<td>
									<form method="post" action="?/deleteProduct">
										<input type="hidden" name="id" value={item.id} />
										<button class="button-secondary" type="submit">Delete</button>
									</form>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</section>
</div>
