import type { Actions, PageServerLoad } from './$types';
import {
	deleteProductAction,
	loadCatalogProducts,
	saveProductAction
} from '$lib/server/admin-catalog';

export const load: PageServerLoad = async () => loadCatalogProducts();

export const actions: Actions = {
	saveProduct: async ({ request }) => saveProductAction(request),
	deleteProduct: async ({ request }) => deleteProductAction(request)
};
