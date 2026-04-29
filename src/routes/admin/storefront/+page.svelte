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
			image: hero.image,
			images: hero.images
		};
	}

	let heroForm = $state(
		createHeroDraft({ eyebrow: '', title: '', description: '', image: '', images: [] })
	);
	let heroFormInitialized = $state(false);

	function validateImages(formData: FormData) {
		for (const image of formData.values()) {
			if (image instanceof File && image.size > data.maxUploadBytes) {
				return `Image is too large. Maximum allowed size is ${data.maxUploadLabel}.`;
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
				<input type="hidden" name="currentImages" value={JSON.stringify(heroForm.images)} />

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
				</div>

				{#if heroForm.images.length}
					<div class="stack" style="gap: 0.75rem;">
						<div class="toolbar-row">
							<div>
								<h3>Current hero images</h3>
								<p class="table-note">
									Replace or remove images individually. The first remaining image becomes the first
									slide in the homepage rotation.
								</p>
							</div>
						</div>
						<div class="hero-image-editor-grid">
							{#each heroForm.images as image, index (image)}
								<div class="panel stack hero-image-editor-card">
									<img
										class="media-thumb media-thumb--wide"
										src={image}
										alt={`Homepage hero ${index + 1}`}
									/>
									<p class="table-note">
										Image {index + 1}{index === 0 ? ' · starts the rotation' : ''}
									</p>
									<label class="form-row">
										<span>Replace this image</span>
										<input name={`replaceImage_${index}`} type="file" accept="image/*" />
									</label>
									<label class="checkbox-row">
										<input type="checkbox" name="removeImageIndex" value={index} />
										<span>Remove this image</span>
									</label>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<label class="form-row">
					<span>Add new hero images</span>
					<input name="newImageFiles" type="file" accept="image/*" multiple />
				</label>

				<p class="field-note">
					Maximum image size: {data.maxUploadLabel}. JPG, JPEG, PNG, WebP, GIF, SVG, AVIF, BMP, and
					TIFF files are accepted and converted to WebP. The homepage rotates through all saved hero
					images automatically.
				</p>

				<button class="button-primary" type="submit">Save homepage hero</button>
			</form>
		</div>
	</section>
</div>
