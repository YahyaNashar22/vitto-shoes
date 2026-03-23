<script lang="ts">
	import { resolve } from '$app/paths';
	import { uploadEnhance } from '$lib/actions/upload-enhance';
	import type { ActionData, PageData } from './$types';

	let { data, form } = $props<{ data: PageData; form: ActionData }>();

	let uploadState = $state({
		active: false,
		progress: 0,
		label: ''
	});

	function createProgressOptions(label: string) {
		return {
			onStart: () => {
				uploadState = { active: true, progress: 0, label };
			},
			onProgress: (progress: number) => {
				uploadState.progress = progress;
			},
			onFinish: () => {
				uploadState.progress = 100;
			},
			onError: () => {
				uploadState = { active: false, progress: 0, label: '' };
			}
		};
	}
</script>

<div class="stack">
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
		</div>
	{/if}

	<section class="panel stack">
		<div class="section-heading" style="margin-bottom: 0;">
			<p class="eyebrow">Catalog tab</p>
			<h2>Import and export</h2>
			<p class="muted">
				Use this tab for bulk operations. Current catalog size: {data.categoryCount} categories and
				{data.productCount} products.
			</p>
		</div>
	</section>

	<section class="admin-section-grid">
		<div class="table-panel stack">
			<div class="toolbar-row">
				<div>
					<h2>Categories data</h2>
					<p class="admin-helper">
						Import categories from Excel or export the current category list.
					</p>
				</div>
				<a class="button-secondary" href={resolve('/admin/export/categories.xlsx')}>Export Excel</a>
			</div>

			<form
				method="post"
				action="?/importCategories"
				enctype="multipart/form-data"
				class="file-row"
				use:uploadEnhance={createProgressOptions('Importing categories')}
			>
				<input name="file" type="file" accept=".xlsx,.xls" />
				<button class="button-primary" type="submit">Import categories</button>
			</form>
		</div>

		<div class="table-panel stack">
			<div class="toolbar-row">
				<div>
					<h2>Products data</h2>
					<p class="admin-helper">
						Import products from Excel or JSON and export the current product catalog.
					</p>
				</div>
				<div class="chip-row">
					<a class="button-secondary" href={resolve('/admin/export/products.xlsx')}>Export Excel</a>
					<a class="button-secondary" href={resolve('/admin/export/products.json')}>Export JSON</a>
				</div>
			</div>

			<form
				method="post"
				action="?/importProducts"
				enctype="multipart/form-data"
				class="file-row"
				use:uploadEnhance={createProgressOptions('Importing products')}
			>
				<input name="file" type="file" accept=".xlsx,.xls,.json" />
				<button class="button-primary" type="submit">Import products</button>
			</form>
		</div>
	</section>
</div>
