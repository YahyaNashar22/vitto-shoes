import type { PageServerLoad } from './$types';
import { redirectCatalogToDefault } from '$lib/server/admin-catalog';

export const load: PageServerLoad = async () => redirectCatalogToDefault();
