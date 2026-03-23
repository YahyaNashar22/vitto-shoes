import type { Actions, PageServerLoad } from './$types';
import {
	deleteCategoryAction,
	importCategoriesAction,
	loadCatalogCategories,
	saveCategoryAction
} from '$lib/server/admin-catalog';

export const load: PageServerLoad = async () => loadCatalogCategories();

export const actions: Actions = {
	saveCategory: async ({ request }) => saveCategoryAction(request),
	deleteCategory: async ({ request }) => deleteCategoryAction(request),
	importCategories: async ({ request }) => importCategoriesAction(request)
};
