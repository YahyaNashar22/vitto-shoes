import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { error } from '@sveltejs/kit';
import { getMimeTypeForUpload, getUploadsRoot } from '$lib/server/uploads';

function resolveUploadPath(requestedPath: string) {
	const normalized = path.posix.normalize(requestedPath);

	if (
		!normalized ||
		normalized === '.' ||
		normalized.startsWith('../') ||
		normalized.includes('..')
	) {
		throw error(404, 'File not found');
	}

	return path.join(getUploadsRoot(), normalized);
}

export async function GET({ params }) {
	if (!params.path) {
		throw error(404, 'File not found');
	}

	const filePath = resolveUploadPath(params.path);

	try {
		const buffer = await readFile(filePath);
		return new Response(buffer, {
			headers: {
				'content-type': getMimeTypeForUpload(params.path),
				'cache-control': 'public, max-age=31536000, immutable'
			}
		});
	} catch {
		throw error(404, 'File not found');
	}
}
