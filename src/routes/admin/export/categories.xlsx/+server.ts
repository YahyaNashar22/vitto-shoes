import { createWorkbookBuffer } from '$lib/server/excel';
import { getCategories } from '$lib/server/catalog';
import { requireAdmin } from '$lib/server/admin';

export async function GET(event) {
	requireAdmin(event);
	const rows = (await getCategories()).map((item) => ({
		name: item.name,
		slug: item.slug,
		description: item.description,
		image: item.image,
		featured: item.featured,
		sortOrder: item.sortOrder
	}));

	return new Response(createWorkbookBuffer('Categories', rows), {
		headers: {
			'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'content-disposition': 'attachment; filename="categories.xlsx"'
		}
	});
}
