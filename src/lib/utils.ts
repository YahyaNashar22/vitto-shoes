export function cn(...classes: Array<string | false | null | undefined>) {
	return classes.filter(Boolean).join(' ');
}

export function slugify(value: string) {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

export function formatCurrency(value: number | string) {
	const amount = typeof value === 'string' ? Number(value) : value;

	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 2
	}).format(amount || 0);
}

export function toTitleCase(value: string) {
	return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
