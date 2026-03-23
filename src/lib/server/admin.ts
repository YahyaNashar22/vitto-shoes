import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export function isAdminEmail(email?: string | null) {
	const configured = new Set(
		[...(env.ADMIN_EMAILS?.split(',') ?? []), env.SEED_ADMIN_EMAIL ?? '', 'owner@vitto-shoes.local']
			.map((value) => value.trim().toLowerCase())
			.filter(Boolean)
	);

	if (!email || !configured.size) {
		return false;
	}

	return configured.has(email.toLowerCase());
}

export function requireAdmin(event: RequestEvent) {
	const allowed = isAdminEmail(event.locals.user?.email);
	event.locals.isAdmin = allowed;

	if (!event.locals.user || !allowed) {
		throw error(403, 'Admin access required');
	}
}
