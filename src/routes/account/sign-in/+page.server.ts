import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user) {
		throw redirect(302, url.searchParams.get('next') || '/admin');
	}

	return {};
};

export const actions: Actions = {
	signIn: async ({ request, url }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const next = formData.get('next')?.toString() || url.searchParams.get('next') || '/admin';

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
	register: async ({ request, url }) => {
		const formData = await request.formData();
		const name = formData.get('name')?.toString() ?? '';
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const next = formData.get('next')?.toString() || url.searchParams.get('next') || '/admin';

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
