import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { requireAdmin } from '$lib/server/admin';

export const load: LayoutServerLoad = async (event) => {
	if (!event.locals.user) {
		throw redirect(302, `/account/sign-in?next=${encodeURIComponent('/admin')}`);
	}

	requireAdmin(event);

	return {};
};
