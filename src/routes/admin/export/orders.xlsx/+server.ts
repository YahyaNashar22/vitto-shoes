import { createWorkbookBuffer } from '$lib/server/excel';
import { getAdminOrders } from '$lib/server/catalog';
import { requireAdmin } from '$lib/server/admin';

export async function GET(event) {
	requireAdmin(event);
	const rows = (await getAdminOrders()).flatMap((order) =>
		order.items.map((item) => ({
			orderNumber: order.orderNumber,
			status: order.status,
			customerName: order.customerName,
			customerPhone: order.customerPhone,
			customerEmail: order.customerEmail,
			customerCity: order.customerCity,
			customerAddress: order.customerAddress,
			notes: order.notes,
			productName: item.productName,
			quantity: item.quantity,
			unitPrice: item.unitPrice,
			lineTotal: item.lineTotal,
			orderTotal: order.total,
			createdAt: order.createdAt
		}))
	);

	return new Response(createWorkbookBuffer('Orders', rows), {
		headers: {
			'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'content-disposition': 'attachment; filename="orders.xlsx"'
		}
	});
}
