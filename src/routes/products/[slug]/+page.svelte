<script lang="ts">
	import ProductCard from '$lib/components/ProductCard.svelte';
	import { cart } from '$lib/stores/cart';
	import { formatCurrency } from '$lib/utils';
	import type { ProductDetailSummary } from '$lib/types';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	const product = $derived(data.product);

	const gallery = $derived.by(() =>
		Array.from(new Set([product.image, ...product.gallery].filter(Boolean)))
	);
	const detailOptions = $derived.by<ProductDetailSummary[]>(() => product.details ?? []);
	let currentIndex = $state(0);
	let zoomOpen = $state(false);
	let quantity = $state(1);
	let added = $state(false);
	let lastProductId = $state('');

	const currentImage = $derived(gallery[currentIndex] || '/placeholder-product.svg');
	const savingsPercent = $derived(
		product.compareAtPrice && product.compareAtPrice > product.price
			? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
			: null
	);
	const colorOptions = $derived.by(() =>
		Array.from(
			new Set(detailOptions.map((item: ProductDetailSummary) => item.xdim).filter(Boolean))
		)
	);
	const fallbackColor = $derived(product.xDim || product.color || '');
	let selectedColor = $state('');
	const sizeOptions = $derived.by(() =>
		Array.from(
			new Set(
				detailOptions
					.filter(
						(item: ProductDetailSummary) =>
							!selectedColor || item.xdim === selectedColor || !item.xdim
					)
					.map((item: ProductDetailSummary) => item.ydim)
					.filter(Boolean)
			)
		)
	);
	let selectedSize = $state('');
	const selectedVariant = $derived.by<ProductDetailSummary | null>(() => {
		if (!detailOptions.length) return null;

		const exact = detailOptions.find(
			(item: ProductDetailSummary) =>
				(!selectedColor || item.xdim === selectedColor || !item.xdim) &&
				(!selectedSize || item.ydim === selectedSize || !item.ydim)
		);
		if (exact) return exact;

		const byColor = detailOptions.find(
			(item: ProductDetailSummary) => !selectedColor || item.xdim === selectedColor || !item.xdim
		);
		return byColor ?? detailOptions[0] ?? null;
	});
	const displayPrice = $derived(selectedVariant?.salesprice ?? product.price);
	const availableQuantity = $derived(selectedVariant?.qty ?? product.inventory);
	const variantLabel = $derived(
		[selectedVariant?.xdim || selectedColor, selectedVariant?.ydim || selectedSize]
			.filter(Boolean)
			.join(' / ')
	);

	$effect(() => {
		if (product.id !== lastProductId) {
			lastProductId = product.id;
			currentIndex = 0;
			zoomOpen = false;
			quantity = 1;
			added = false;
			selectedColor = '';
			selectedSize = '';
		}
	});

	$effect(() => {
		if (!selectedColor) {
			selectedColor = colorOptions[0] || fallbackColor;
			return;
		}

		if (colorOptions.length && !colorOptions.includes(selectedColor)) {
			selectedColor = colorOptions[0] || fallbackColor;
		}
	});

	$effect(() => {
		if (!sizeOptions.length) {
			if (selectedSize !== '') {
				selectedSize = '';
			}
			return;
		}

		if (!selectedSize) {
			selectedSize = sizeOptions[0] || product.yDim || '';
			return;
		}

		if (sizeOptions.length && !sizeOptions.includes(selectedSize)) {
			selectedSize = sizeOptions[0];
		}
	});

	$effect(() => {
		if (quantity > Math.max(availableQuantity, 1)) {
			quantity = Math.max(availableQuantity, 1);
		}
	});

	function showPrevious() {
		currentIndex = currentIndex === 0 ? gallery.length - 1 : currentIndex - 1;
	}

	function showNext() {
		currentIndex = currentIndex === gallery.length - 1 ? 0 : currentIndex + 1;
	}

	function addSelectedToCart() {
		if (availableQuantity < 1) return;

		cart.add(product, quantity, {
			barcode: selectedVariant?.itembarcode || product.barcode,
			color: selectedVariant?.xdim || selectedColor || fallbackColor,
			size: selectedVariant?.ydim || selectedSize || product.yDim,
			label: variantLabel,
			price: displayPrice,
			maxQuantity: availableQuantity
		});

		added = true;
		setTimeout(() => {
			added = false;
		}, 1200);
	}
</script>

<section class="product-detail">
	<div class="product-viewer">
		<div class="product-viewer__stage">
			<button
				class="product-viewer__arrow product-viewer__arrow--left"
				type="button"
				onclick={showPrevious}
				aria-label="Previous image"
				disabled={gallery.length <= 1}
			>
				&#8249;
			</button>
			<button
				class="product-viewer__zoom"
				type="button"
				onclick={() => (zoomOpen = true)}
				aria-label="Zoom image"
			>
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<circle
						cx="10.5"
						cy="10.5"
						r="5.75"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
					/>
					<path
						d="M15 15 20 20"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
					/>
					<path
						d="M10.5 8v5M8 10.5h5"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
					/>
				</svg>
			</button>
			<img
				class="product-gallery-image"
				src={currentImage}
				alt={data.product.name}
				loading="eager"
			/>
			<button
				class="product-viewer__arrow product-viewer__arrow--right"
				type="button"
				onclick={showNext}
				aria-label="Next image"
				disabled={gallery.length <= 1}
			>
				&#8250;
			</button>
		</div>

		{#if gallery.length > 1}
			<div class="product-viewer__thumbs">
				{#each gallery as image, index (`${image}-${index}`)}
					<button
						class:active={currentIndex === index}
						class="product-viewer__thumb"
						type="button"
						aria-label={`View image ${index + 1}`}
						onclick={() => (currentIndex = index)}
					>
						<img
							src={image || '/placeholder-product.svg'}
							alt={`${data.product.name} preview ${index + 1}`}
							loading="lazy"
						/>
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<div class="stack product-sidebar product-sidebar--cavin">
		<p class="eyebrow">Product</p>
		<h1>{data.product.name}</h1>
		<div class="product-price-row">
			<span class="product-price">{formatCurrency(displayPrice)}</span>
			{#if data.product.compareAtPrice}
				<span class="product-compare">{formatCurrency(data.product.compareAtPrice)}</span>
			{/if}
			{#if savingsPercent}
				<span class="sale-badge">Save {savingsPercent}%</span>
			{/if}
		</div>
		{#if colorOptions.length}
			<div class="product-option-group">
				<p class="product-meta-line"><strong>Color:</strong> {selectedColor}</p>
				<div class="product-option-list">
					{#each colorOptions as color (color)}
						<button
							class:active={selectedColor === color}
							class="product-option-button"
							type="button"
							onclick={() => (selectedColor = color)}
						>
							{color}
						</button>
					{/each}
				</div>
			</div>
		{:else}
			<p class="product-meta-line"><strong>Color:</strong> {data.product.color || 'Neutral'}</p>
		{/if}

		{#if sizeOptions.length}
			<div class="product-option-group">
				<p class="product-meta-line"><strong>Size:</strong> {selectedSize}</p>
				<div class="product-option-list">
					{#each sizeOptions as size (size)}
						<button
							class:active={selectedSize === size}
							class="product-option-button"
							type="button"
							onclick={() => (selectedSize = size)}
						>
							{size}
						</button>
					{/each}
				</div>
			</div>
		{/if}

		<p class="muted">{data.product.shortDescription}</p>
		<div class="chip-row">
			<span class="chip">Material: {data.product.material || 'Premium synthetic'}</span>
			<span class="chip">SKU: {data.product.sku}</span>
			{#if selectedVariant?.itembarcode}
				<span class="chip">Barcode: {selectedVariant.itembarcode}</span>
			{/if}
		</div>
		<div class="product-purchase-row">
			<div class="product-qty-control">
				<button
					type="button"
					aria-label="Decrease quantity"
					onclick={() => (quantity = Math.max(1, quantity - 1))}
				>
					&minus;
				</button>
				<input
					class="qty-input"
					type="number"
					min="1"
					max={Math.max(availableQuantity, 1)}
					bind:value={quantity}
				/>
				<button
					type="button"
					aria-label="Increase quantity"
					onclick={() => (quantity = Math.min(Math.max(availableQuantity, 1), quantity + 1))}
				>
					+
				</button>
			</div>
			<button
				class="button-primary product-purchase-button"
				onclick={addSelectedToCart}
				disabled={availableQuantity < 1}
			>
				{#if availableQuantity < 1}
					Out of stock
				{:else if added}
					Added
				{:else}
					Add to cart
				{/if}
			</button>
		</div>
		<div class="panel">
			<h2>Product details</h2>
			<p class="muted">{data.product.description}</p>
		</div>
	</div>
</section>

{#if zoomOpen}
	<div
		class="product-zoom"
		role="dialog"
		aria-modal="true"
		aria-label={`${data.product.name} image zoom`}
		tabindex="0"
		onclick={() => (zoomOpen = false)}
		onkeydown={(event) => {
			if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
				zoomOpen = false;
			}
		}}
	>
		<button
			class="product-zoom__close"
			type="button"
			aria-label="Close zoomed image"
			onclick={() => (zoomOpen = false)}
		>
			&times;
		</button>
		<button
			class="product-zoom__content"
			type="button"
			aria-label="View zoomed product image"
			onclick={(event) => event.stopPropagation()}
		>
			<img class="product-zoom__image" src={currentImage} alt={data.product.name} />
		</button>
	</div>
{/if}

{#if data.relatedProducts.length}
	<section class="stack related-section" style="margin-top: 3rem;">
		<div class="section-heading related-section__heading">
			<p class="eyebrow">Related</p>
			<h2>You may also like</h2>
		</div>
		<div class="product-grid related-grid">
			{#each data.relatedProducts as product (product.id)}
				<ProductCard {product} />
			{/each}
		</div>
	</section>
{/if}
