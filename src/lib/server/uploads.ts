import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']);

function getSafeExtension(file: File) {
	const extension = path.extname(file.name || '').toLowerCase();
	return IMAGE_EXTENSIONS.has(extension) ? extension : '.jpg';
}

function isUploadableImage(file: unknown): file is File {
	return file instanceof File && file.size > 0 && file.type.startsWith('image/');
}

export async function saveUploadedImage(file: unknown, folder: 'categories' | 'products') {
	if (!isUploadableImage(file)) {
		return '';
	}

	const uploadsDir = path.resolve('static', 'uploads', folder);
	await mkdir(uploadsDir, { recursive: true });

	const filename = `${randomUUID()}${getSafeExtension(file)}`;
	const filepath = path.join(uploadsDir, filename);
	const buffer = Buffer.from(await file.arrayBuffer());

	await writeFile(filepath, buffer);

	return `/uploads/${folder}/${filename}`;
}

export async function saveUploadedImages(files: unknown[], folder: 'categories' | 'products') {
	const uploaded: string[] = [];

	for (const file of files) {
		const path = await saveUploadedImage(file, folder);
		if (path) {
			uploaded.push(path);
		}
	}

	return uploaded;
}
