import type { Actions, PageServerLoad } from './$types';
import {
	importCategoriesAction,
	importProductsAction,
	loadCatalogImports
} from '$lib/server/admin-catalog';

export const load: PageServerLoad = async () => loadCatalogImports();

export const actions: Actions = {
	importCategories: async ({ request }) => importCategoriesAction(request),
	importProducts: async ({ request }) => importProductsAction(request)
};
