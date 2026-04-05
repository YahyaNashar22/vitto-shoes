export const WHATSAPP_NUMBER = '96100000000';

export const ORDER_STATUSES = [
	'pending',
	'confirmed',
	'processing',
	'completed',
	'cancelled'
] as const;

export const SORT_OPTIONS = [
	{ value: 'featured', label: 'Top selling' },
	{ value: 'newest', label: 'Newest' },
	{ value: 'price-asc', label: 'Price: Low to High' },
	{ value: 'price-desc', label: 'Price: High to Low' },
	{ value: 'name', label: 'Name' }
] as const;

export const DEFAULT_COLLECTION_COPY = {
	eyebrow: 'Handpicked styles',
	title: 'Shoes made for everyday polish',
	description:
		'Lightweight silhouettes, neutral tones, and a clean shopping flow designed for fast browsing on mobile and desktop.'
};
