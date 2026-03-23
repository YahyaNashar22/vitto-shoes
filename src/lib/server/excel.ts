import { utils, write } from 'xlsx';

export function createWorkbookBuffer(sheetName: string, rows: Record<string, unknown>[]) {
	const workbook = utils.book_new();
	const worksheet = utils.json_to_sheet(rows);
	utils.book_append_sheet(workbook, worksheet, sheetName);
	return write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

export async function readWorkbookRows(file: File) {
	const { read, utils } = await import('xlsx');
	const workbook = read(Buffer.from(await file.arrayBuffer()), { type: 'buffer' });
	const firstSheetName = workbook.SheetNames[0];

	if (!firstSheetName) {
		return [];
	}

	return utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[firstSheetName], {
		defval: ''
	});
}
