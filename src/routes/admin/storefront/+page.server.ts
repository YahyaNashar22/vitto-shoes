import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getHomeHeroContent, saveHomeHeroContent } from '$lib/server/storefront';
import {
	getEffectiveUploadBytes,
	getMaxUploadLabel,
	saveUploadedImage,
	UploadError
} from '$lib/server/uploads';

export const load: PageServerLoad = async () => {
	return {
		hero: await getHomeHeroContent(),
		maxUploadBytes: getEffectiveUploadBytes(),
		maxUploadLabel: getMaxUploadLabel()
	};
};

export const actions: Actions = {
	saveHero: async ({ request }) => {
		const formData = await request.formData();

		try {
			const uploadedImage = await saveUploadedImage(formData.get('imageFile'), 'storefront');
			await saveHomeHeroContent({
				eyebrow: formData.get('eyebrow')?.toString() ?? '',
				title: formData.get('title')?.toString() ?? '',
				description: formData.get('description')?.toString() ?? '',
				image: uploadedImage || formData.get('currentImage')?.toString() || ''
			});
		} catch (error) {
			if (error instanceof UploadError) {
				return fail(400, { storefrontMessage: error.message });
			}

			return fail(500, { storefrontMessage: 'Could not save homepage hero. Please try again.' });
		}

		return {
			storefrontMessage: 'Homepage hero updated.'
		};
	}
};
