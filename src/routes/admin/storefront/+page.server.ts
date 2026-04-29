import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getHomeHeroContent, saveHomeHeroContent } from '$lib/server/storefront';
import {
	getEffectiveUploadBytes,
	getMaxUploadLabel,
	saveUploadedImage,
	saveUploadedImages,
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
			const currentImagesRaw = formData.get('currentImages')?.toString() ?? '[]';
			const currentImages = (() => {
				try {
					const parsed = JSON.parse(currentImagesRaw);
					return Array.isArray(parsed) ? parsed.map((item) => String(item)).filter(Boolean) : [];
				} catch {
					return [];
				}
			})();
			const removeIndexes = new Set(
				formData
					.getAll('removeImageIndex')
					.map((value) => Number(value.toString()))
					.filter((value) => Number.isInteger(value) && value >= 0)
			);

			const nextImages: string[] = [];

			for (let index = 0; index < currentImages.length; index += 1) {
				if (removeIndexes.has(index)) {
					continue;
				}

				const replacement = await saveUploadedImage(
					formData.get(`replaceImage_${index}`),
					'storefront'
				);
				nextImages.push(replacement || currentImages[index]);
			}

			const appendedImages = await saveUploadedImages(
				formData.getAll('newImageFiles'),
				'storefront'
			);
			nextImages.push(...appendedImages);

			if (!nextImages.length) {
				return fail(400, {
					storefrontMessage: 'At least one hero image is required.'
				});
			}

			await saveHomeHeroContent({
				eyebrow: formData.get('eyebrow')?.toString() ?? '',
				title: formData.get('title')?.toString() ?? '',
				description: formData.get('description')?.toString() ?? '',
				image: nextImages[0],
				images: nextImages
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
