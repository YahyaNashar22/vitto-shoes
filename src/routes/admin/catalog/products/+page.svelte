<script lang="ts">
	import { uploadEnhance } from '$lib/actions/upload-enhance';
	import { formatCurrency } from '$lib/utils';
	import type { ActionData, PageData } from './$types';

	let { data, form } = $props<{ data: PageData; form: ActionData }>();
	let errorMessage = $state('');

	let uploadState = $state({
		active: false,
		progress: 0,
		label: ''
	});

	type VariantDraft = {
		id: string;
		color: string;
		size: string;
		qty: number;
		price: number | '';
		barcode: string;
		imageName: string;
	};

	function createVariantDraft(index = 0): VariantDraft {
		return {
			id: crypto.randomUUID(),
			color: '',
			size: '',
			qty: 0,
			price: '',
			barcode: '',
			imageName: index === 0 ? 'Recommended for color image' : ''
		};
	}

	let variantRows = $state<VariantDraft[]>([createVariantDraft()]);

	function validateImages(formData: FormData) {
		for (const entry of [formData.get('imageFile'), ...formData.getAll('galleryFiles')]) {
			if (entry instanceof File && entry.size > data.maxUploadBytes) {
				return `One of the selected images is too large. Maximum allowed size is ${data.maxUploadLabel}.`;
			}
		}

		return null;
	}

	function createProgressOptions(label: string) {
		return {
			onStart: () => {
				errorMessage = '';
				uploadState = { active: true, progress: 0, label };
			},
			onProgress: (progress: number) => {
				uploadState.progress = progress;
			},
			onFinish: () => {
				uploadState.progress = 100;
			},
			onError: (message: string) => {
				errorMessage = message;
				uploadState = { active: false, progress: 0, label: '' };
			},
			validate: validateImages
		};
	}

	function addVariantRow() {
		variantRows = [...variantRows, createVariantDraft(variantRows.length)];
	}

	function removeVariantRow(id: string) {
		if (variantRows.length === 1) {
			variantRows = [createVariantDraft()];
			return;
		}

		variantRows = variantRows.filter((row) => row.id !== id);
	}
</script>

<div class="stack">
	{#if errorMessage}
		<p class="error-banner">{errorMessage}</p>
	{/if}

	{#if form?.catalogMessage}
		<p class="success-banner">{form.catalogMessage}</p>
	{/if}

	{#if uploadState.active}
		<div class="panel upload-progress">
			<div class="toolbar-row">
				<strong>{uploadState.label}</strong>
				<span>{uploadState.progress}%</span>
			</div>
			<div class="progress-track">
				<div class="progress-fill" style={`width: ${uploadState.progress}%`}></div>
			</div>
			<p class="table-note">Images are optimized to WebP during upload.</p>
		</div>
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

			<form
				method="post"
				action="?/saveProduct"
				enctype="multipart/form-data"
				class="stack"
				use:uploadEnhance={createProgressOptions('Uploading product images')}
			>
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
				<p class="field-note">
					Maximum image size: {data.maxUploadLabel} per file. JPG, JPEG, PNG, WebP, GIF, SVG, AVIF, BMP,
					and TIFF files are accepted and converted to WebP.
				</p>
				<label class="form-row"
					><span>Short description</span><textarea name="shortDescription"></textarea></label
				>
				<label class="form-row"
					><span>Full description</span><textarea name="description"></textarea></label
				>
				<section class="variant-editor stack">
					<div class="toolbar-row">
						<div>
							<h3>Variant builder</h3>
							<p class="admin-helper">
								Upload a dedicated image for each color so shoppers can switch visuals directly from
								the product page.
							</p>
						</div>
						<button class="button-secondary" type="button" onclick={addVariantRow}
							>Add variant</button
						>
					</div>

					<div class="variant-editor__list">
						{#each variantRows as variant, index (variant.id)}
							<div class="variant-editor__row">
								<div class="field-grid">
									<label class="form-row">
										<span>Color</span>
										<input name="variantColor" bind:value={variant.color} placeholder="Black" />
									</label>
									<label class="form-row">
										<span>Size</span>
										<input name="variantSize" bind:value={variant.size} placeholder="38" />
									</label>
									<label class="form-row">
										<span>Qty</span>
										<input name="variantQty" type="number" bind:value={variant.qty} />
									</label>
									<label class="form-row">
										<span>Price</span>
										<input
											name="variantPrice"
											type="number"
											step="0.01"
											bind:value={variant.price}
										/>
									</label>
									<label class="form-row">
										<span>Barcode</span>
										<input
											name="variantBarcode"
											bind:value={variant.barcode}
											placeholder="Unique variant barcode"
										/>
									</label>
									<label class="form-row">
										<span>Color image</span>
										<input
											name="variantImageFile"
											type="file"
											accept="image/*"
											onchange={(event) => {
												const input = event.currentTarget as HTMLInputElement;
												variant.imageName = input.files?.[0]?.name || '';
											}}
										/>
										<input type="hidden" name="variantImageExisting" value="" />
										{#if variant.imageName}
											<small class="table-note">{variant.imageName}</small>
										{/if}
									</label>
								</div>
								<div class="toolbar-row">
									<p class="table-note">Variant {index + 1}</p>
									<button
										class="button-secondary"
										type="button"
										onclick={() => removeVariantRow(variant.id)}
									>
										Remove
									</button>
								</div>
							</div>
						{/each}
					</div>

					<label class="form-row">
						<span>Advanced details JSON</span>
						<textarea
							name="details"
							placeholder="Optional fallback JSON import. The structured variant rows above take priority when used."
						></textarea>
					</label>
				</section>
				<div class="chip-row">
					<label class="checkbox-row"
						><input type="checkbox" name="isFeatured" /> <span>Top selling</span></label
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
							<th>Variants</th>
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
								<td>{item.details.length || 1}</td>
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
