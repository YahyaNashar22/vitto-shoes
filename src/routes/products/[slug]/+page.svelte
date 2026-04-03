<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import { cart } from '$lib/stores/cart';
	import { formatCurrency } from '$lib/utils';
	import type { ProductDetailSummary, ProductSummary } from '$lib/types';
	import type { PageData } from './$types';

	const RECENTLY_VIEWED_KEY = 'vitto-recently-viewed';
	const MARQUEE_ITEMS = [
		'No Exchange | No Refund During Sale',
		'Unbeatable Prices, Always On Sale'
	];
	const MARQUEE_LOOP = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

	let { data } = $props<{ data: PageData }>();
	const product = $derived(data.product);

	const detailOptions = $derived.by<ProductDetailSummary[]>(() => product.details ?? []);
	const baseGallery = $derived.by(() =>
		Array.from(new Set([product.image, ...product.gallery].filter(Boolean)))
	);
	let currentIndex = $state(0);
	let zoomOpen = $state(false);
	let quantity = $state(1);
	let lastProductId = $state('');
	let purchaseAnchor: HTMLElement | null = null;
	let addToCartAnchor: HTMLButtonElement | null = null;
	let showStickyBar = $state(false);
	let recentlyViewed = $state<ProductSummary[]>([]);
	let askModalOpen = $state(false);
	let shareModalOpen = $state(false);
	let detailTab = $state<'description' | 'shipping'>('description');
	let isWishlisted = $state(false);
	let wishlistPending = $state(false);
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
	const colorMedia = $derived.by(() => {
		const media: Record<string, string[]> = {};

		for (const item of detailOptions) {
			const color = item.xdim?.trim();
			if (!color) continue;

			const entries = Array.from(new Set([item.image, ...(item.gallery ?? [])].filter(Boolean)));
			if (!entries.length) continue;

			const existing = media[color] ?? [];
			media[color] = Array.from(new Set([...existing, ...entries])).filter(
				(entry): entry is string => Boolean(entry)
			);
		}

		return media;
	});
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
	const gallery = $derived.by(() => {
		if (selectedColor && colorMedia[selectedColor]?.length) {
			return colorMedia[selectedColor];
		}

		const selectedVariantMedia = Array.from(
			new Set([selectedVariant?.image, ...(selectedVariant?.gallery ?? [])].filter(Boolean))
		);

		return selectedVariantMedia.length ? selectedVariantMedia : baseGallery;
	});
	const currentImage = $derived(gallery[currentIndex] || '/placeholder-product.svg');
	const displayPrice = $derived(selectedVariant?.salesprice ?? product.price);
	const availableQuantity = $derived(selectedVariant?.qty ?? product.inventory);
	const variantLabel = $derived(
		[selectedVariant?.xdim || selectedColor, selectedVariant?.ydim || selectedSize]
			.filter(Boolean)
			.join(' / ')
	);
	const stickyVariantLabel = $derived(
		selectedVariant?.xdim || selectedColor || fallbackColor || product.color || 'Default'
	);
	const stickySummaryLabel = $derived(`${stickyVariantLabel} - ${formatCurrency(displayPrice)}`);
	const recentlyViewedFallback = $derived(data.recentProducts.slice(0, 4));
	const productPath = $derived(resolve('/products/[slug]', { slug: product.slug }));
	const productUrl = $derived(browser ? window.location.href : productPath);
	const estimatedDelivery = $derived.by(() => {
		const formatter = new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: '2-digit'
		});
		const startDate = new Date(Date.now());
		const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

		return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
	});

	$effect(() => {
		if (product.id !== lastProductId) {
			lastProductId = product.id;
			currentIndex = 0;
			zoomOpen = false;
			quantity = 1;
			selectedColor = '';
			selectedSize = '';
			showStickyBar = false;
			isWishlisted = data.isWishlisted;
			wishlistPending = false;
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

	$effect(() => {
		if (currentIndex > gallery.length - 1) {
			currentIndex = 0;
		}
	});

	onMount(() => {
		if (!browser) {
			return;
		}

		try {
			const stored = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) ?? '[]') as string[];
			const nextIds = [product.id, ...stored.filter((id) => id !== product.id)].slice(0, 12);
			localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(nextIds));

			const pool = [product, ...data.recentProducts, ...data.similarProducts];
			const uniquePool = Array.from(new Map(pool.map((item) => [item.id, item])).values());
			recentlyViewed = nextIds
				.filter((id) => id !== product.id)
				.map((id) => uniquePool.find((item) => item.id === id))
				.filter((item): item is ProductSummary => Boolean(item))
				.slice(0, 4);
		} catch {
			recentlyViewed = [];
		}

		const updateStickyBar = () => {
			if (!addToCartAnchor || window.innerWidth > 700) {
				showStickyBar = false;
				return;
			}

			const rect = addToCartAnchor.getBoundingClientRect();
			showStickyBar = rect.bottom < 0;
		};

		updateStickyBar();
		window.addEventListener('scroll', updateStickyBar, { passive: true });
		window.addEventListener('resize', updateStickyBar);

		return () => {
			window.removeEventListener('scroll', updateStickyBar);
			window.removeEventListener('resize', updateStickyBar);
		};
	});

	function showPrevious() {
		currentIndex = currentIndex === 0 ? gallery.length - 1 : currentIndex - 1;
	}

	function showNext() {
		currentIndex = currentIndex === gallery.length - 1 ? 0 : currentIndex + 1;
	}

	async function addSelectedToCart() {
		if (availableQuantity < 1) return;

		cart.add(product, quantity, {
			barcode: selectedVariant?.itembarcode || product.barcode,
			color: selectedVariant?.xdim || selectedColor || fallbackColor,
			size: selectedVariant?.ydim || selectedSize || product.yDim,
			label: variantLabel,
			price: displayPrice,
			maxQuantity: availableQuantity,
			image: currentImage
		});
		await goto(resolve('/cart'));
	}

	async function shareProduct() {
		if (!browser) return;

		if (navigator.share) {
			try {
				await navigator.share({
					title: product.name,
					text: `${product.name} - ${formatCurrency(displayPrice)}`,
					url: productUrl
				});
				return;
			} catch {
				// fall back to modal
			}
		}

		shareModalOpen = true;
	}

	async function copyProductLink() {
		if (!browser) return;
		await navigator.clipboard.writeText(productUrl);
	}

	async function toggleWishlist() {
		if (!data.canWishlist) {
			window.location.href = `${resolve('/account/sign-in')}?next=${encodeURIComponent(productPath)}`;
			return;
		}

		if (wishlistPending) return;
		wishlistPending = true;

		try {
			const response = await fetch('/api/wishlist', {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify({ productId: product.id })
			});

			if (!response.ok) {
				return;
			}

			const payload = (await response.json()) as { added: boolean };
			isWishlisted = payload.added;
		} finally {
			wishlistPending = false;
		}
	}
</script>

<section class="product-detail product-detail--cavin">
	<div class="product-viewer product-viewer--cavin">
		<div class="product-viewer__stage product-viewer__stage--cavin">
			<button
				class:is-active={isWishlisted}
				class="product-wishlist-button"
				type="button"
				aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
				aria-pressed={isWishlisted}
				onclick={toggleWishlist}
				disabled={wishlistPending}
			>
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path
						d="M12 20.5 4.8 13.6a4.9 4.9 0 0 1 0-7 4.8 4.8 0 0 1 6.8 0L12 7l.4-.4a4.8 4.8 0 0 1 6.8 0 4.9 4.9 0 0 1 0 7Z"
						fill={isWishlisted ? 'currentColor' : 'none'}
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linejoin="round"
					/>
				</svg>
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
		</div>

		{#if gallery.length > 1}
			<div class="product-viewer__thumbs product-viewer__thumbs--cavin">
				<button
					class="product-viewer__arrow product-viewer__arrow--inline"
					type="button"
					onclick={showPrevious}
					aria-label="Previous image"
					disabled={gallery.length <= 1}
				>
					&#8249;
				</button>
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
				<button
					class="product-viewer__arrow product-viewer__arrow--inline"
					type="button"
					onclick={showNext}
					aria-label="Next image"
					disabled={gallery.length <= 1}
				>
					&#8250;
				</button>
			</div>
		{/if}
	</div>

	<div class="stack product-sidebar product-sidebar--cavin product-sidebar--mobile-cavin">
		<h1>{data.product.name}</h1>
		<div class="product-price-row product-price-row--viewer">
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
				<p class="product-meta-line product-meta-line--label">
					<strong>color:</strong>
					{selectedColor}
				</p>
				<div class="product-option-list product-option-list--swatches">
					{#each colorOptions as color (color)}
						<button
							class:active={selectedColor === color}
							class="product-option-button product-option-button--media"
							type="button"
							onclick={() => {
								selectedColor = color;
								currentIndex = 0;
							}}
						>
							{#if colorMedia[color]?.[0]}
								<img src={colorMedia[color][0]} alt={color} loading="lazy" />
							{/if}
							<span>{color}</span>
						</button>
					{/each}
				</div>
			</div>
		{:else}
			<p class="product-meta-line product-meta-line--label">
				<strong>color:</strong>
				{data.product.color || 'Neutral'}
			</p>
		{/if}

		{#if sizeOptions.length}
			<div class="product-option-group">
				<p class="product-meta-line product-meta-line--label">
					<strong>size:</strong>
					{selectedSize}
				</p>
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

		<div class="product-purchase-shell" bind:this={purchaseAnchor}>
			<div class="product-qty-block">
				<label class="product-qty-label" for="product-quantity">Quantity</label>
				<div class="product-qty-control product-qty-control--cavin">
					<button
						type="button"
						aria-label="Decrease quantity"
						onclick={() => (quantity = Math.max(1, quantity - 1))}
					>
						&minus;
					</button>
					<input
						id="product-quantity"
						class="qty-input"
						type="number"
						min="1"
						max={Math.max(availableQuantity, 1)}
						name="product_quantity"
						autocomplete="off"
						inputmode="numeric"
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
			</div>

			<div class="product-purchase-actions">
				<button
					class="button-secondary product-purchase-button"
					bind:this={addToCartAnchor}
					onclick={addSelectedToCart}
					disabled={availableQuantity < 1}
				>
					{#if availableQuantity < 1}
						Out of stock
					{:else}
						Add to cart
					{/if}
				</button>
				<button
					class="button-primary product-purchase-button"
					onclick={addSelectedToCart}
					disabled={availableQuantity < 1}
				>
					Buy it now
				</button>
			</div>
		</div>

		<div class="panel product-description-panel">
			<div class="product-support-row">
				<button class="product-support-link" type="button">
					<span aria-hidden="true">&#8645;</span>
					<span>Compare</span>
				</button>
				<button class="product-support-link" type="button" onclick={() => (askModalOpen = true)}>
					<span aria-hidden="true"
						><svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#9CA3AF"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<circle cx="12" cy="12" r="10"></circle>
							<path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.3-1.5 1-1.5 1.7"></path>
							<line x1="12" y1="17" x2="12" y2="17"></line>
						</svg></span
					>
					<span>Ask a question</span>
				</button>
				<button class="product-support-link" type="button" onclick={shareProduct}>
					<span aria-hidden="true"
						><svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#9CA3AF"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<circle cx="18" cy="5" r="3"></circle>
							<circle cx="6" cy="12" r="3"></circle>
							<circle cx="18" cy="19" r="3"></circle>
							<line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
							<line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
						</svg></span
					>
					<span>Share</span>
				</button>
			</div>

			<div class="product-policy-list">
				<p class="product-policy-item">
					<span aria-hidden="true">&#128666;</span>
					<strong>Estimated Delivery:</strong>
					{estimatedDelivery}
				</p>
				<p class="product-policy-item">
					<span aria-hidden="true">&#128230;</span>
					No Refund - Exchange only outside Sale
				</p>
			</div>

			<div class="product-tabs">
				<button
					class:active={detailTab === 'description'}
					class="product-tab"
					type="button"
					onclick={() => (detailTab = 'description')}
				>
					Product description
				</button>
				<button
					class:active={detailTab === 'shipping'}
					class="product-tab"
					type="button"
					onclick={() => (detailTab = 'shipping')}
				>
					Shipping & Return
				</button>
			</div>

			<div class="product-tab-panel">
				{#if detailTab === 'description'}
					<p class="muted">{data.product.description || data.product.shortDescription}</p>
				{:else}
					<p class="muted">
						Fast Shipping for orders made before 2:30PM, No Exchange | No Refund During Sale.
					</p>
				{/if}
			</div>
		</div>
	</div>
</section>

<section class="product-marquee" aria-label="Store policies">
	<div class="product-marquee__track">
		{#each MARQUEE_LOOP as item, index (`marquee-${index}`)}
			<span class="product-marquee__item">
				{item}
				<span class="product-marquee__dot" aria-hidden="true"></span>
			</span>
		{/each}
	</div>
</section>

{#if showStickyBar}
	<div class="mobile-sticky-cart">
		<button class="mobile-sticky-cart__meta" type="button" aria-label="Selected variant and price">
			<span>{stickySummaryLabel}</span>
			<span class="mobile-sticky-cart__chevron" aria-hidden="true">&#709;</span>
		</button>
		<button
			class="button-primary mobile-sticky-cart__button"
			onclick={addSelectedToCart}
			disabled={availableQuantity < 1}
		>
			Add to cart
		</button>
	</div>
{/if}

{#if askModalOpen}
	<div
		class="product-modal-backdrop"
		role="button"
		tabindex="0"
		aria-label="Close ask a question modal"
		onclick={() => (askModalOpen = false)}
		onkeydown={(event) => {
			if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
				askModalOpen = false;
			}
		}}
	>
		<div
			class="product-modal"
			role="dialog"
			tabindex="-1"
			aria-modal="true"
			aria-label="Ask a question"
			onclick={(event) => event.stopPropagation()}
			onkeydown={(event) => event.stopPropagation()}
		>
			<button
				class="product-modal__close"
				type="button"
				aria-label="Close"
				onclick={() => (askModalOpen = false)}
			>
				&times;
			</button>
			<h2 class="product-modal__title">Ask a Question</h2>
			<div
				class="product-modal__form"
				role="presentation"
				data-form-type="other"
				data-lpignore="true"
				data-1p-ignore
			>
				<input
					class="product-modal__input"
					id="question-name"
					name="contact_field_name"
					type="text"
					placeholder="Your Name*"
					autocomplete="off"
					autocapitalize="words"
					autocorrect="off"
					spellcheck="false"
					data-lpignore="true"
					data-1p-ignore
				/>
				<input
					class="product-modal__input"
					id="question-phone"
					name="contact_field_phone"
					type="text"
					placeholder="Your Phone Number"
					autocomplete="off"
					inputmode="tel"
					autocorrect="off"
					spellcheck="false"
					data-lpignore="true"
					data-1p-ignore
				/>
				<input
					class="product-modal__input"
					id="question-email"
					name="contact_field_email"
					type="text"
					placeholder="Your Email*"
					autocomplete="off"
					inputmode="email"
					autocapitalize="none"
					autocorrect="off"
					spellcheck="false"
					data-lpignore="true"
					data-1p-ignore
				/>
				<textarea
					class="product-modal__input product-modal__textarea"
					id="question-message"
					name="contact_field_message"
					placeholder="Your Message*"
					autocomplete="off"
					autocapitalize="sentences"
					spellcheck="false"
					data-lpignore="true"
					data-1p-ignore
				></textarea>
				<p class="product-modal__note">* Required fields</p>
				<button class="button-primary product-modal__submit" type="button">Submit Now</button>
			</div>
		</div>
	</div>
{/if}

{#if shareModalOpen}
	<div
		class="product-modal-backdrop"
		role="button"
		tabindex="0"
		aria-label="Close share modal"
		onclick={() => (shareModalOpen = false)}
		onkeydown={(event) => {
			if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
				shareModalOpen = false;
			}
		}}
	>
		<div
			class="product-modal product-modal--share"
			role="dialog"
			tabindex="-1"
			aria-modal="true"
			aria-label="Share product"
			onclick={(event) => event.stopPropagation()}
			onkeydown={(event) => event.stopPropagation()}
		>
			<button
				class="product-modal__close"
				type="button"
				aria-label="Close"
				onclick={() => (shareModalOpen = false)}
			>
				&times;
			</button>
			<h2 class="product-modal__heading">Copy link</h2>
			<button class="product-modal__copy" type="button" onclick={copyProductLink}>
				{productUrl}
			</button>
			<div class="product-modal__share">
				<p class="product-modal__heading">Share:</p>
				<div class="product-modal__share-links">
					<a
						href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`}
						target="_blank"
						rel="noreferrer"
					>
						F
					</a>
					<a
						href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(productUrl)}`}
						target="_blank"
						rel="noreferrer"
					>
						P
					</a>
					<a
						href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(productUrl)}`}
						target="_blank"
						rel="noreferrer"
					>
						X
					</a>
				</div>
			</div>
		</div>
	</div>
{/if}

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

{#if data.similarProducts.length}
	<section class="stack related-section" style="margin-top: 3rem;">
		<div class="section-heading related-section__heading">
			<p class="eyebrow">Similar products</p>
			<h2>You may also like</h2>
		</div>
		<div class="product-rail related-rail">
			{#each data.similarProducts as item (item.id)}
				<div class="product-rail__item">
					<ProductCard product={item} />
				</div>
			{/each}
		</div>
	</section>
{/if}

<section class="stack related-section" style="margin-top: 2.5rem;">
	<div class="section-heading related-section__heading">
		<p class="eyebrow">Recently viewed products</p>
		<h2>Keep browsing</h2>
	</div>
	<div class="product-rail related-rail">
		{#each recentlyViewed.length ? recentlyViewed : recentlyViewedFallback as item (item.id)}
			<div class="product-rail__item">
				<ProductCard product={item} />
			</div>
		{/each}
	</div>
</section>
