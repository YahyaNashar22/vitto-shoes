import type { LayoutServerLoad } from './$types';
import { isAdminEmail } from '$lib/server/admin';
import { getCategories } from '$lib/server/catalog';
import { isAdminRole } from '$lib/server/auth-user';

export const load: LayoutServerLoad = async ({ locals }) => {
	const isAdmin = isAdminRole(locals.user) || isAdminEmail(locals.user?.email);
	locals.isAdmin = isAdmin;

	return {
		categories: await getCategories(),
		session: locals.session ?? null,
		user: locals.user ?? null,
		isAdmin
	};
};
