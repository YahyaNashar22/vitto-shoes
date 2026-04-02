import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { isAdminEmail } from '$lib/server/admin';
import { getUserRole, isAdminRole } from '$lib/server/auth-user';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/account/sign-in?next=/account/profile');
	}

	return {
		role: getUserRole(locals.user),
		isAdmin: isAdminRole(locals.user) || isAdminEmail(locals.user.email)
	};
};

export const actions: Actions = {
	updateProfile: async ({ request, locals }) => {
		const formData = await request.formData();
		const name = formData.get('name')?.toString() ?? '';
		const phone = formData.get('phone')?.toString() ?? '';
		const city = formData.get('city')?.toString() ?? '';
		const address = formData.get('address')?.toString() ?? '';

		if (!locals.user) {
			throw redirect(302, '/account/sign-in?next=/account/profile');
		}

		try {
			await auth.api.updateUser({
				body: { name },
				headers: request.headers
			});
			await db.update(user).set({ phone, city, address }).where(eq(user.id, locals.user.id));
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Could not update profile.' });
			}

			return fail(500, { message: 'Unexpected error.' });
		}

		return { message: 'Profile updated successfully.' };
	},
	changePassword: async ({ request }) => {
		const formData = await request.formData();
		const currentPassword = formData.get('currentPassword')?.toString() ?? '';
		const newPassword = formData.get('newPassword')?.toString() ?? '';
		const confirmPassword = formData.get('confirmPassword')?.toString() ?? '';

		if (newPassword !== confirmPassword) {
			return fail(400, { message: 'New passwords do not match.' });
		}

		try {
			await auth.api.changePassword({
				body: {
					currentPassword,
					newPassword,
					revokeOtherSessions: false
				},
				headers: request.headers
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Could not change password.' });
			}

			return fail(500, { message: 'Unexpected error.' });
		}

		return { message: 'Password updated successfully.' };
	},
	signOut: async ({ request }) => {
		await auth.api.signOut({
			headers: request.headers
		});

		throw redirect(303, '/');
	}
};
