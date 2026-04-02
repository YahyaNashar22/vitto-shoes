import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user) {
		throw redirect(302, '/account/profile');
	}

	return {
		token: url.searchParams.get('token') || ''
	};
};

export const actions: Actions = {
	resetPassword: async ({ request }) => {
		const formData = await request.formData();
		const token = formData.get('token')?.toString() ?? '';
		const newPassword = formData.get('newPassword')?.toString() ?? '';
		const confirmPassword = formData.get('confirmPassword')?.toString() ?? '';

		if (!token) {
			return fail(400, { message: 'Missing reset token.' });
		}

		if (newPassword !== confirmPassword) {
			return fail(400, { message: 'Passwords do not match.' });
		}

		try {
			await auth.api.resetPassword({
				body: { token, newPassword }
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Reset password failed.' });
			}

			return fail(500, { message: 'Unexpected error.' });
		}

		throw redirect(303, '/account/sign-in');
	}
};
