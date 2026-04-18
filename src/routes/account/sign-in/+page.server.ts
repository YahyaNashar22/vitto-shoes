import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { isAdminRole } from '$lib/server/auth-user';
import { isAdminEmail } from '$lib/server/admin';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user) {
		const next = url.searchParams.get('next');
		const target =
			next ||
			(isAdminRole(locals.user) || isAdminEmail(locals.user.email) ? '/admin' : '/account/profile');
		throw redirect(302, target);
	}

	return {};
};

export const actions: Actions = {
	signIn: async ({ request, url }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const next =
			formData.get('next')?.toString() || url.searchParams.get('next') || '/account/profile';

		try {
			await auth.api.signInEmail({
				body: { email, password, callbackURL: next }
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Sign in failed.' });
			}

			return fail(500, { message: 'Unexpected error.' });
		}

		throw redirect(303, next);
	},
	signUp: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name')?.toString() ?? '';
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const next = '/account/profile';

		try {
			await auth.api.signUpEmail({
				body: { name, email, password, callbackURL: next }
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Registration failed.' });
			}

			return fail(500, { message: 'Unexpected error.' });
		}

		throw redirect(303, next);
	}
};
