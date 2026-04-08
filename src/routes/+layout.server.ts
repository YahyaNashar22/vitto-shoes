import type { LayoutServerLoad } from './$types';
import { isAdminEmail } from '$lib/server/admin';
import { getCategories } from '$lib/server/catalog';
import { isAdminRole } from '$lib/server/auth-user';
import { env } from '$env/dynamic/private';

export const load: LayoutServerLoad = async ({ locals }) => {
	const isAdmin = isAdminRole(locals.user) || isAdminEmail(locals.user?.email);
	locals.isAdmin = isAdmin;

	return {
		categories: await getCategories(),
		session: locals.session ?? null,
		user: locals.user ?? null,
		isAdmin,
		whatsappHref: `https://wa.me/${env.WHATSAPP_NUMBER || '96100000000'}`
	};
};
