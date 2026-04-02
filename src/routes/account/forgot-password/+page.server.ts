import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(302, '/account/profile');
	}

	return {};
};

export const actions: Actions = {
	requestReset: async ({ request, url }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const redirectTo = `${url.origin}/account/reset-password`;

		try {
			await auth.api.requestPasswordReset({
				body: { email, redirectTo }
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, {
					message: error.message || 'Could not start the password reset process.'
				});
			}

			return fail(500, { message: 'Unexpected error.' });
		}

		return {
			message:
				'If that email exists, a password reset link has been created. Check the server logs for the reset URL until email delivery is configured.'
		};
	}
};
