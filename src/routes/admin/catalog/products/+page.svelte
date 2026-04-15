<script lang="ts">
	import { uploadEnhance } from '$lib/actions/upload-enhance';
	import { formatCurrency } from '$lib/utils';
	import type { ProductDetailSummary, ProductSummary } from '$lib/types';
	import type { ActionData, PageData } from './$types';

	let { data, form } = $props<{ data: PageData; form: ActionData }>();
	let errorMessage = $state('');

	let uploadState = $state({
		active: false,
		progress: 0,
		label: ''
	});
	let productSearch = $state('');

	type VariantSizeDraft = {
		id: string;
		size: string;
		qty: number;
		price: number | '';
		barcode: string;
	};

	type VariantGroupDraft = {
		id: string;
		color: string;
		imageName: string;
		existingImage: string;
		galleryNames: string[];
		existingGallery: string[];
		galleryInputIds: string[];
		sizes: VariantSizeDraft[];
	};

	type ProductFormDraft = {
		id: string;
		externalId: string;
		code: string;
		barcode: string;
		name: string;
		slug: string;
		sku: string;
		categoryId: string;
		price: number | '';
		compareAtPrice: number | '';
		qty: number;
		currency: string;
		sortOrder: number;
		color: string;
		material: string;
		xDim: string;
		yDim: string;
		shortDescription: string;
		description: string;
		isFeatured: boolean;
		onSale: boolean;
		isPublished: boolean;
		details: string;
	};

	function createClientId() {
		const maybeCrypto = globalThis.crypto as { randomUUID?: () => string } | undefined;
		if (typeof maybeCrypto?.randomUUID === 'function') {
			return maybeCrypto.randomUUID();
		}

		return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
	}

	function createVariantSizeDraft(): VariantSizeDraft {
		return {
			id: createClientId(),
			size: '',
			qty: 0,
			price: '',
			barcode: ''
		};
	}

	function createVariantGroupDraft(index = 0): VariantGroupDraft {
		return {
			id: createClientId(),
			color: '',
			imageName: index === 0 ? 'Recommended for color image' : '',
			existingImage: '',
			galleryNames: [],
			existingGallery: [],
			galleryInputIds: [createClientId()],
			sizes: [createVariantSizeDraft()]
		};
	}

	function createProductDraft(): ProductFormDraft {
		return {
			id: '',
			externalId: '',
			code: '',
			barcode: '',
			name: '',
			slug: '',
			sku: '',
			categoryId: '',
			price: '',
			compareAtPrice: '',
			qty: 0,
			currency: 'USD',
			sortOrder: 0,
			color: '',
			material: '',
			xDim: '',
			yDim: '',
			shortDescription: '',
			description: '',
			isFeatured: false,
			onSale: false,
			isPublished: true,
			details: ''
		};
	}

	function buildVariantGroupsFromDetails(item: ProductSummary) {
		const detailRows = item.details.length
			? item.details
			: [
					{
						itemid: item.externalId,
						itemcode: item.code,
						itembarcode: item.barcode,
						itembarcodeid: null,
						itemname: item.name,
						itemdescription: item.shortDescription || item.description,
						xdim: item.xDim || item.color,
						ydim: item.yDim,
						qty: item.qty,
						salesprice: item.price,
						currencycode: item.currency,
						isdim: 1,
						image: item.image,
						gallery: item.gallery
					} satisfies ProductDetailSummary
				];

		const groups: VariantGroupDraft[] = [];

		for (const detail of detailRows) {
			const colorKey = detail.xdim || '__default__';
			let group = groups.find((entry) => (entry.color || '__default__') === colorKey);
			if (!group) {
				group = {
					id: createClientId(),
					color: detail.xdim || '',
					imageName: detail.image || '',
					existingImage: detail.image || '',
					galleryNames: [],
					existingGallery: [],
					galleryInputIds: [createClientId()],
					sizes: []
				};
				groups.push(group);
			}

			group.existingGallery = Array.from(
				new Set([...(group.existingGallery ?? []), ...(detail.gallery ?? [])].filter(Boolean))
			);

			group.sizes.push({
				id: createClientId(),
				size: detail.ydim || '',
				qty: detail.qty,
				price: detail.salesprice || '',
				barcode: detail.itembarcode || ''
			});
		}

		return groups.map((group) => ({
			...group,
			galleryNames: group.existingGallery,
			galleryInputIds: [createClientId()],
			sizes: group.sizes.length ? group.sizes : [createVariantSizeDraft()]
		}));
	}

	let productForm = $state<ProductFormDraft>(createProductDraft());
	let variantGroups = $state<VariantGroupDraft[]>([createVariantGroupDraft()]);
	let productGalleryInputIds = $state<string[]>([createClientId()]);
	const visibleProducts = $derived.by(() => {
		const query = productSearch.trim().toLowerCase();
		if (!query) {
			return data.products;
		}

		return data.products.filter((item: ProductSummary) =>
			[
				item.name,
				item.code,
				item.sku,
				item.barcode,
				item.categoryName,
				item.slug,
				item.shortDescription
			].some((value) => value.toLowerCase().includes(query))
		);
	});

	function startEditProduct(item: ProductSummary) {
		productForm = {
			id: item.id,
			externalId: item.externalId?.toString() ?? '',
			code: item.code,
			barcode: item.barcode,
			name: item.name,
			slug: item.slug,
			sku: item.sku,
			categoryId: item.categoryId,
			price: item.price,
			compareAtPrice: item.compareAtPrice ?? '',
			qty: item.qty,
			currency: item.currency,
			sortOrder: item.sortOrder,
			color: item.color,
			material: item.material,
			xDim: item.xDim,
			yDim: item.yDim,
			shortDescription: item.shortDescription,
			description: item.description,
			isFeatured: item.isFeatured,
			onSale: item.onSale,
			isPublished: item.isPublished,
			details: JSON.stringify(item.details, null, 2)
		};
		variantGroups = buildVariantGroupsFromDetails(item);
		productGalleryInputIds = [createClientId()];
		errorMessage = '';
	}

	function resetProductForm() {
		productForm = createProductDraft();
		variantGroups = [createVariantGroupDraft()];
		productGalleryInputIds = [createClientId()];
		errorMessage = '';
	}

	$effect(() => {
		if (form?.catalogMessage === 'Product saved.') {
			resetProductForm();
		}
	});

	function validateImages(formData: FormData) {
		for (const entry of formData.values()) {
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

	function addVariantGroup() {
		variantGroups = [...variantGroups, createVariantGroupDraft(variantGroups.length)];
	}

	function addProductGalleryInput() {
		productGalleryInputIds = [...productGalleryInputIds, createClientId()];
	}

	function removeProductGalleryInput(id: string) {
		if (productGalleryInputIds.length === 1) {
			productGalleryInputIds = [createClientId()];
			return;
		}

		productGalleryInputIds = productGalleryInputIds.filter((entry) => entry !== id);
	}

	function removeVariantGroup(id: string) {
		if (variantGroups.length === 1) {
			variantGroups = [createVariantGroupDraft()];
			return;
		}

		variantGroups = variantGroups.filter((group) => group.id !== id);
	}

	function addVariantSize(groupId: string) {
		variantGroups = variantGroups.map((group) =>
			group.id === groupId ? { ...group, sizes: [...group.sizes, createVariantSizeDraft()] } : group
		);
	}

	function addVariantGalleryInput(groupId: string) {
		variantGroups = variantGroups.map((group) =>
			group.id === groupId
				? { ...group, galleryInputIds: [...group.galleryInputIds, createClientId()] }
				: group
		);
	}

	function removeVariantGalleryInput(groupId: string, inputId: string) {
		variantGroups = variantGroups.map((group) => {
			if (group.id !== groupId) return group;
			if (group.galleryInputIds.length === 1) {
				return { ...group, galleryInputIds: [createClientId()] };
			}

			return {
				...group,
				galleryInputIds: group.galleryInputIds.filter((entry) => entry !== inputId)
			};
		});
	}

	function removeVariantSize(groupId: string, sizeId: string) {
		variantGroups = variantGroups.map((group) => {
			if (group.id !== groupId) return group;
			if (group.sizes.length === 1) {
				return { ...group, sizes: [createVariantSizeDraft()] };
			}

			return { ...group, sizes: group.sizes.filter((size) => size.id !== sizeId) };
		});
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
					<h2>{productForm.id ? 'Edit product' : 'Create product'}</h2>
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
				<input type="hidden" name="id" bind:value={productForm.id} />
				<div class="field-grid">
					<label class="form-row">
						<span>External ID</span>
						<input name="externalId" type="number" bind:value={productForm.externalId} />
					</label>
					<label class="form-row">
						<span>Code</span>
						<input name="code" bind:value={productForm.code} />
					</label>
					<label class="form-row">
						<span>Barcode</span>
						<input name="barcode" bind:value={productForm.barcode} />
					</label>
					<label class="form-row">
						<span>Name</span>
						<input name="name" bind:value={productForm.name} required />
					</label>
					<label class="form-row">
						<span>Slug</span>
						<input name="slug" bind:value={productForm.slug} />
					</label>
					<label class="form-row">
						<span>SKU</span>
						<input name="sku" bind:value={productForm.sku} required />
					</label>
					<label class="form-row">
						<span>Category</span>
						<select name="categoryId" bind:value={productForm.categoryId} required>
							<option value="">Select category</option>
							{#each data.categories as item (item.id)}
								<option value={item.id}>{item.name}</option>
							{/each}
						</select>
					</label>
					<label class="form-row">
						<span>Price</span>
						<input name="price" type="number" step="0.01" bind:value={productForm.price} required />
					</label>
					<label class="form-row">
						<span>Compare at price</span>
						<input
							name="compareAtPrice"
							type="number"
							step="0.01"
							bind:value={productForm.compareAtPrice}
						/>
					</label>
					<label class="form-row">
						<span>Qty</span>
						<input name="qty" type="number" bind:value={productForm.qty} />
					</label>
					<label class="form-row">
						<span>Currency</span>
						<input name="currency" bind:value={productForm.currency} />
					</label>
					<label class="form-row">
						<span>Sort order</span>
						<input name="sortOrder" type="number" bind:value={productForm.sortOrder} />
					</label>
					<label class="form-row">
						<span>Color</span>
						<input name="color" bind:value={productForm.color} />
					</label>
					<label class="form-row">
						<span>Material</span>
						<input name="material" bind:value={productForm.material} />
					</label>
					<label class="form-row">
						<span>X Dimension</span>
						<input name="xDim" bind:value={productForm.xDim} />
					</label>
					<label class="form-row">
						<span>Y Dimension</span>
						<input name="yDim" bind:value={productForm.yDim} />
					</label>
					<label class="form-row">
						<span>Main image upload</span>
						<input name="imageFile" type="file" accept="image/*" />
					</label>
					<div class="form-row">
						<span>Gallery uploads</span>
						<div class="stack" style="gap: 0.55rem;">
							{#each productGalleryInputIds as inputId (inputId)}
								<div class="toolbar-row">
									<input name="galleryFiles" type="file" accept="image/*" multiple />
									<button
										class="button-secondary"
										type="button"
										onclick={() => removeProductGalleryInput(inputId)}
									>
										Remove
									</button>
								</div>
							{/each}
							<div>
								<button class="button-secondary" type="button" onclick={addProductGalleryInput}>
									Add gallery upload
								</button>
							</div>
						</div>
					</div>
				</div>
				{#if productForm.id}
					<p class="table-note">
						Existing product media stays in place unless you upload new files.
					</p>
				{/if}
				<p class="field-note">
					Maximum image size: {data.maxUploadLabel} per file. JPG, JPEG, PNG, WebP, GIF, SVG, AVIF, BMP,
					and TIFF files are accepted and converted to WebP.
				</p>
				<label class="form-row">
					<span>Short description</span>
					<textarea name="shortDescription" bind:value={productForm.shortDescription}></textarea>
				</label>
				<label class="form-row">
					<span>Full description</span>
					<textarea name="description" bind:value={productForm.description}></textarea>
				</label>
				<section class="variant-editor stack">
					<div class="toolbar-row">
						<div>
							<h3>Variant builder</h3>
							<p class="admin-helper">
								Create one color block, then add multiple sizes under it. Each color can keep its
								own main image and gallery for the product viewer.
							</p>
						</div>
						<button class="button-secondary" type="button" onclick={addVariantGroup}
							>Add color</button
						>
					</div>

					<div class="variant-editor__list">
						{#each variantGroups as group, groupIndex (group.id)}
							<div class="variant-editor__row">
								<div class="toolbar-row">
									<p class="table-note">Color {groupIndex + 1}</p>
									<button
										class="button-secondary"
										type="button"
										onclick={() => removeVariantGroup(group.id)}
									>
										Remove color
									</button>
								</div>

								<div class="field-grid">
									<label class="form-row">
										<span>Color</span>
										<input name="variantGroupColor" bind:value={group.color} placeholder="Black" />
									</label>
									<label class="form-row">
										<span>Color image</span>
										<input
											name={`variantGroupImageFile_${groupIndex}`}
											type="file"
											accept="image/*"
											onchange={(event) => {
												const input = event.currentTarget as HTMLInputElement;
												group.imageName = input.files?.[0]?.name || '';
											}}
										/>
										<input
											type="hidden"
											name={`variantGroupImageExisting_${groupIndex}`}
											value={group.existingImage}
										/>
										{#if group.imageName}
											<small class="table-note">{group.imageName}</small>
										{:else if group.existingImage}
											<small class="table-note">Current image will be kept</small>
										{/if}
									</label>
									<div class="form-row">
										<span>Color gallery</span>
										<div class="stack" style="gap: 0.55rem;">
											{#each group.galleryInputIds as inputId (inputId)}
												<div class="toolbar-row">
													<input
														name={`variantGroupGalleryFile_${groupIndex}`}
														type="file"
														accept="image/*"
														multiple
														onchange={(event) => {
															const input = event.currentTarget as HTMLInputElement;
															const fileNames = input.files
																? Array.from(input.files).map((file) => file.name)
																: [];
															group.galleryNames = Array.from(
																new Set([...group.galleryNames, ...fileNames])
															);
														}}
													/>
													<button
														class="button-secondary"
														type="button"
														onclick={() => removeVariantGalleryInput(group.id, inputId)}
													>
														Remove
													</button>
												</div>
											{/each}
											<input
												type="hidden"
												name={`variantGroupGalleryExisting_${groupIndex}`}
												value={JSON.stringify(group.existingGallery)}
											/>
											{#if group.galleryNames.length}
												<small class="table-note">{group.galleryNames.join(', ')}</small>
											{:else if group.existingGallery.length}
												<small class="table-note"
													>{group.existingGallery.length} gallery image(s) will be kept</small
												>
											{/if}
											<div>
												<button
													class="button-secondary"
													type="button"
													onclick={() => addVariantGalleryInput(group.id)}
												>
													Add color gallery upload
												</button>
											</div>
										</div>
									</div>
								</div>

								<div class="stack" style="gap: 0.85rem;">
									<div class="toolbar-row">
										<p class="table-note">Sizes for {group.color || `color ${groupIndex + 1}`}</p>
										<button
											class="button-secondary"
											type="button"
											onclick={() => addVariantSize(group.id)}
										>
											Add size
										</button>
									</div>

									{#each group.sizes as sizeRow, sizeIndex (sizeRow.id)}
										<div class="variant-editor__size-row">
											<input type="hidden" name="variantGroupIndex" value={groupIndex} />
											<div class="field-grid">
												<label class="form-row">
													<span>Size</span>
													<input
														name="variantGroupSize"
														bind:value={sizeRow.size}
														placeholder="38"
													/>
												</label>
												<label class="form-row">
													<span>Qty</span>
													<input name="variantGroupQty" type="number" bind:value={sizeRow.qty} />
												</label>
												<label class="form-row">
													<span>Price</span>
													<input
														name="variantGroupPrice"
														type="number"
														step="0.01"
														bind:value={sizeRow.price}
													/>
												</label>
												<label class="form-row">
													<span>Barcode</span>
													<input
														name="variantGroupBarcode"
														bind:value={sizeRow.barcode}
														placeholder="Unique size barcode"
													/>
												</label>
											</div>
											<div class="toolbar-row">
												<p class="table-note">Size row {sizeIndex + 1}</p>
												<button
													class="button-secondary"
													type="button"
													onclick={() => removeVariantSize(group.id, sizeRow.id)}
												>
													Remove size
												</button>
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/each}
					</div>

					<label class="form-row">
						<span>Advanced details JSON</span>
						<textarea
							name="details"
							bind:value={productForm.details}
							placeholder="Optional fallback JSON import. The grouped color and size rows above take priority when used."
						></textarea>
					</label>
				</section>
				<div class="chip-row">
					<label class="checkbox-row">
						<input type="checkbox" name="isFeatured" bind:checked={productForm.isFeatured} />
						<span>Top selling</span>
					</label>
					<label class="checkbox-row">
						<input type="checkbox" name="onSale" bind:checked={productForm.onSale} />
						<span>On sale</span>
					</label>
					<label class="checkbox-row">
						<input type="checkbox" name="isPublished" bind:checked={productForm.isPublished} />
						<span>Published</span>
					</label>
				</div>
				<div class="action-stack">
					<button class="button-primary" type="submit">
						{productForm.id ? 'Update product' : 'Save product'}
					</button>
					{#if productForm.id}
						<button class="button-secondary" type="button" onclick={resetProductForm}>
							Cancel edit
						</button>
					{/if}
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

			<label class="form-row">
				<span>Search products</span>
				<input
					bind:value={productSearch}
					type="search"
					placeholder="Search by name, code, SKU, barcode, or category"
				/>
			</label>

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
						{#each visibleProducts as item (item.id)}
							<tr>
								<td>
									<div class="media-inline">
										<img
											class="media-thumb"
											src={item.image || '/placeholder-product.webp'}
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
									<div class="chip-row">
										<button
											class="button-secondary"
											type="button"
											onclick={() => startEditProduct(item)}
										>
											Edit
										</button>
										<form method="post" action="?/deleteProduct">
											<input type="hidden" name="id" value={item.id} />
											<button class="button-secondary" type="submit">Delete</button>
										</form>
									</div>
								</td>
							</tr>
						{:else}
							<tr>
								<td colspan="7">
									<p class="table-note">No products match this search.</p>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</section>
</div>
