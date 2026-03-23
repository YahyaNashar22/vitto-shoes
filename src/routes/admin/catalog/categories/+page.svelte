<script lang="ts">
	import { resolve } from '$app/paths';
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
					<h2>Create category</h2>
					<p class="admin-helper">Upload a cover image and set the navigation label and slug.</p>
				</div>
				<a class="button-secondary" href={resolve('/admin/export/categories.xlsx')}>Export Excel</a>
			</div>

			<form method="post" action="?/saveCategory" enctype="multipart/form-data" class="stack">
				<div class="field-grid">
					<label class="form-row"><span>Name</span><input name="name" required /></label>
					<label class="form-row"><span>Slug</span><input name="slug" /></label>
					<label class="form-row"
						><span>Sort order</span><input name="sortOrder" type="number" value="0" /></label
					>
					<label class="form-row"
						><span>Image upload</span><input name="imageFile" type="file" accept="image/*" /></label
					>
				</div>
				<label class="form-row"
					><span>Description</span><textarea name="description"></textarea></label
				>
				<label class="checkbox-row"
					><input type="checkbox" name="featured" /> <span>Featured category</span></label
				>
				<div class="action-stack">
					<button class="button-primary" type="submit">Save category</button>
				</div>
			</form>

			<form
				method="post"
				action="?/importCategories"
				enctype="multipart/form-data"
				class="file-row"
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

			<div class="table-wrap">
				<table>
					<thead>
						<tr>
							<th>Category</th>
							<th>Slug</th>
							<th>Products</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each data.categories as item (item.id)}
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
								<td>{item.slug}</td>
								<td>{item.productCount ?? 0}</td>
								<td>
									<form method="post" action="?/deleteCategory">
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
