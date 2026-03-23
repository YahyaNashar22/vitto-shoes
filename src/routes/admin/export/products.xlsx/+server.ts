import { createWorkbookBuffer } from '$lib/server/excel';
import { getAdminProducts } from '$lib/server/catalog';
import { toProductJsonRow } from '$lib/server/product-json';
import { requireAdmin } from '$lib/server/admin';

export async function GET(event) {
	requireAdmin(event);
	const rows = (await getAdminProducts()).map((item) => {
		const row = toProductJsonRow(item);

		return {
			...row,
			Gallery: row.Gallery.join(', '),
			Details: JSON.stringify(row.Details)
		};
	});

	return new Response(createWorkbookBuffer('Products', rows), {
		headers: {
			'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'content-disposition': 'attachment; filename="products.xlsx"'
		}
	});
}
