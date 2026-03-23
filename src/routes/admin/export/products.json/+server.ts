import { getAdminProducts } from '$lib/server/catalog';
import { toProductJsonRow } from '$lib/server/product-json';
import { requireAdmin } from '$lib/server/admin';

export async function GET(event) {
	requireAdmin(event);

	const rows = (await getAdminProducts()).map(toProductJsonRow);

	return new Response(JSON.stringify(rows, null, 2), {
		headers: {
			'content-type': 'application/json; charset=utf-8',
			'content-disposition': 'attachment; filename="products.json"'
		}
	});
}
