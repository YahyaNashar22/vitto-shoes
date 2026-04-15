<script lang="ts">
	import { resolve } from '$app/paths';
	import { uploadEnhance } from '$lib/actions/upload-enhance';
	import type { CategorySummary } from '$lib/types';
	import type { ActionData, PageData } from './$types';

	let { data, form } = $props<{ data: PageData; form: ActionData }>();
	let errorMessage = $state('');

	let uploadState = $state({
		active: false,
		progress: 0,
		label: ''
	});
	let categorySearch = $state('');

	type CategoryFormDraft = {
		id: string;
		name: string;
		slug: string;
		parentGroup: 'women' | 'men' | 'kids';
		sortOrder: number;
		description: string;
		featured: boolean;
		image: string;
	};

	function createCategoryDraft(): CategoryFormDraft {
		return {
			id: '',
			name: '',
			slug: '',
			parentGroup: 'women',
			sortOrder: 0,
			description: '',
			featured: false,
			image: ''
		};
	}

	let categoryForm = $state<CategoryFormDraft>(createCategoryDraft());
	const visibleCategories = $derived.by(() => {
		const query = categorySearch.trim().toLowerCase();
		if (!query) {
			return data.categories;
		}

		return data.categories.filter((item: CategorySummary) =>
			[item.name, item.slug, item.parentGroup, item.description].some((value) =>
				value.toLowerCase().includes(query)
			)
		);
	});

	function startEditCategory(item: CategorySummary) {
		categoryForm = {
			id: item.id,
			name: item.name,
			slug: item.slug,
			parentGroup: item.parentGroup,
			sortOrder: item.sortOrder,
			description: item.description,
			featured: item.featured,
			image: item.image
		};
		errorMessage = '';
	}

	function resetCategoryForm() {
		categoryForm = createCategoryDraft();
		errorMessage = '';
	}

	$effect(() => {
		if (form?.catalogMessage === 'Category saved.') {
			resetCategoryForm();
		}
	});

	function validateImages(formData: FormData) {
		const image = formData.get('imageFile');

		if (image instanceof File && image.size > data.maxUploadBytes) {
			return `Image is too large. Maximum allowed size is ${data.maxUploadLabel}.`;
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
			<p class="table-note">Images are converted to WebP during upload.</p>
		</div>
	{/if}

	<section class="panel stack">
		<div class="section-heading" style="margin-bottom: 0;">
			<p class="eyebrow">Catalog tab</p>
			<h2>Categories</h2>
			<p class="muted">
				Create storefront groups first so products and collection pages stay organized.
			</p>
		</div>
	</section>

	<section class="admin-section-grid">
		<div class="table-panel stack">
			<div class="toolbar-row">
				<div>
					<h2>{categoryForm.id ? 'Edit category' : 'Create category'}</h2>
					<p class="admin-helper">Upload a cover image and set the navigation label and slug.</p>
				</div>
				<a class="button-secondary" href={resolve('/admin/export/categories.xlsx')}>Export Excel</a>
			</div>

			<form
				method="post"
				action="?/saveCategory"
				enctype="multipart/form-data"
				class="stack"
				use:uploadEnhance={createProgressOptions('Uploading category image')}
			>
				<input type="hidden" name="id" bind:value={categoryForm.id} />
				<div class="field-grid">
					<label class="form-row">
						<span>Name</span>
						<input name="name" bind:value={categoryForm.name} required />
					</label>
					<label class="form-row">
						<span>Slug</span>
						<input name="slug" bind:value={categoryForm.slug} />
					</label>
					<label class="form-row">
						<span>Parent group</span>
						<select name="parentGroup" bind:value={categoryForm.parentGroup} required>
							<option value="women">Women</option>
							<option value="men">Men</option>
							<option value="kids">Kids</option>
						</select>
					</label>
					<label class="form-row">
						<span>Sort order</span>
						<input name="sortOrder" type="number" bind:value={categoryForm.sortOrder} />
					</label>
					<label class="form-row">
						<span>Image upload</span>
						<input name="imageFile" type="file" accept="image/*" />
					</label>
				</div>
				{#if categoryForm.image}
					<div class="media-inline">
						<img
							class="media-thumb"
							src={categoryForm.image}
							alt={categoryForm.name || 'Category image'}
						/>
						<p class="table-note">Current image will be kept unless you upload a new one.</p>
					</div>
				{/if}
				<p class="field-note">
					Maximum image size: {data.maxUploadLabel}. JPG, JPEG, PNG, WebP, GIF, SVG, AVIF, BMP, and
					TIFF files are accepted and converted to WebP.
				</p>
				<label class="form-row">
					<span>Description</span>
					<textarea name="description" bind:value={categoryForm.description}></textarea>
				</label>
				<label class="checkbox-row">
					<input type="checkbox" name="featured" bind:checked={categoryForm.featured} />
					<span>Featured category</span>
				</label>
				<div class="action-stack">
					<button class="button-primary" type="submit">
						{categoryForm.id ? 'Update category' : 'Save category'}
					</button>
					{#if categoryForm.id}
						<button class="button-secondary" type="button" onclick={resetCategoryForm}>
							Cancel edit
						</button>
					{/if}
				</div>
			</form>

			<form
				method="post"
				action="?/importCategories"
				enctype="multipart/form-data"
				class="file-row"
				use:uploadEnhance={createProgressOptions('Importing categories')}
			>
				<input name="file" type="file" accept=".xlsx,.xls" />
				<button class="button-secondary" type="submit">Import categories Excel</button>
			</form>
		</div>

		<div class="table-panel stack">
			<div class="toolbar-row">
				<div>
					<h2>Existing categories</h2>
					<p class="admin-helper">Review names, slugs, and image coverage across the catalog.</p>
				</div>
			</div>

			<label class="form-row">
				<span>Search categories</span>
				<input
					bind:value={categorySearch}
					type="search"
					placeholder="Search by name, slug, group, or description"
				/>
			</label>

			<div class="table-wrap">
				<table>
					<thead>
						<tr>
							<th>Category</th>
							<th>Group</th>
							<th>Slug</th>
							<th>Products</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each visibleCategories as item (item.id)}
							<tr>
								<td>
									<div class="media-inline">
										<img
											class="media-thumb"
											src={item.image || '/placeholder-category.svg'}
											alt={item.name}
										/>
										<div>
											<strong>{item.name}</strong>
											<p class="table-note">{item.featured ? 'Featured' : 'Standard'}</p>
										</div>
									</div>
								</td>
								<td>{item.parentGroup}</td>
								<td>{item.slug}</td>
								<td>{item.productCount ?? 0}</td>
								<td>
									<div class="chip-row">
										<button
											class="button-secondary"
											type="button"
											onclick={() => startEditCategory(item)}
										>
											Edit
										</button>
										<form method="post" action="?/deleteCategory">
											<input type="hidden" name="id" value={item.id} />
											<button class="button-secondary" type="submit">Delete</button>
										</form>
									</div>
								</td>
							</tr>
						{:else}
							<tr>
								<td colspan="5">
									<p class="table-note">No categories match this search.</p>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</section>
</div>
