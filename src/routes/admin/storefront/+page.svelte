<script lang="ts">
	import { uploadEnhance } from '$lib/actions/upload-enhance';
	import type { ActionData, PageData } from './$types';

	let { data, form } = $props<{ data: PageData; form: ActionData }>();
	let errorMessage = $state('');
	let uploadState = $state({
		active: false,
		progress: 0,
		label: ''
	});

	function createHeroDraft(hero: PageData['hero']) {
		return {
			eyebrow: hero.eyebrow,
			title: hero.title,
			description: hero.description,
			image: hero.image
		};
	}

	let heroForm = $state(createHeroDraft({ eyebrow: '', title: '', description: '', image: '' }));
	let heroFormInitialized = $state(false);

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

	$effect(() => {
		if (!heroFormInitialized || form?.storefrontMessage === 'Homepage hero updated.') {
			heroForm = createHeroDraft(data.hero);
			heroFormInitialized = true;
		}
	});
</script>

<div class="stack">
	{#if errorMessage}
		<p class="error-banner">{errorMessage}</p>
	{/if}

	{#if form?.storefrontMessage}
		<p class="success-banner">{form.storefrontMessage}</p>
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
			<p class="table-note">Hero images are converted to WebP during upload.</p>
		</div>
	{/if}

	<section class="panel stack">
		<div class="section-heading" style="margin-bottom: 0;">
			<p class="eyebrow">Storefront tab</p>
			<h2>Homepage hero</h2>
			<p class="muted">
				Update the hero image and copy used on the public homepage without touching code.
			</p>
		</div>
	</section>

	<section class="admin-section-grid">
		<div class="table-panel stack">
			<div class="toolbar-row">
				<div>
					<h2>Edit hero content</h2>
					<p class="admin-helper">
						Control the eyebrow, title, description, and homepage hero image.
					</p>
				</div>
			</div>

			<form
				method="post"
				action="?/saveHero"
				enctype="multipart/form-data"
				class="stack"
				use:uploadEnhance={createProgressOptions('Uploading homepage hero')}
			>
				<input type="hidden" name="currentImage" bind:value={heroForm.image} />

				<div class="field-grid">
					<label class="form-row">
						<span>Eyebrow</span>
						<input name="eyebrow" bind:value={heroForm.eyebrow} required />
					</label>
					<label class="form-row">
						<span>Title</span>
						<input name="title" bind:value={heroForm.title} required />
					</label>
					<label class="form-row field-grid__full">
						<span>Description</span>
						<textarea name="description" bind:value={heroForm.description} rows="4" required
						></textarea>
					</label>
					<label class="form-row">
						<span>Hero image upload</span>
						<input name="imageFile" type="file" accept="image/*" />
					</label>
				</div>

				{#if heroForm.image}
					<div class="media-inline">
						<img class="media-thumb media-thumb--wide" src={heroForm.image} alt="Homepage hero" />
						<p class="table-note">Current hero image will be kept unless you upload a new one.</p>
					</div>
				{/if}

				<p class="field-note">
					Maximum image size: {data.maxUploadLabel}. JPG, JPEG, PNG, WebP, GIF, SVG, AVIF, BMP, and
					TIFF files are accepted and converted to WebP.
				</p>

				<button class="button-primary" type="submit">Save homepage hero</button>
			</form>
		</div>
	</section>
</div>
