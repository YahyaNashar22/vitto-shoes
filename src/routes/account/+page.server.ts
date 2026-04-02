import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { isAdminEmail } from '$lib/server/admin';
import { isAdminRole } from '$lib/server/auth-user';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/account/sign-in');
	}

	throw redirect(
		302,
		isAdminRole(locals.user) || isAdminEmail(locals.user.email) ? '/admin' : '/account/profile'
	);
};
