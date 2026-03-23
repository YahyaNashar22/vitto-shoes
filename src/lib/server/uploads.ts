import { randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { env } from '$env/dynamic/private';

const execFileAsync = promisify(execFile);
const DEFAULT_MAX_UPLOAD_MB = 8;
const DEFAULT_BODY_SIZE_LIMIT = '512K';

const MIME_BY_EXTENSION: Record<string, string> = {
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.gif': 'image/gif',
	'.webp': 'image/webp',
	'.svg': 'image/svg+xml',
	'.avif': 'image/avif',
	'.bmp': 'image/bmp',
	'.tif': 'image/tiff',
	'.tiff': 'image/tiff',
	'.ico': 'image/x-icon'
};

export class UploadError extends Error {}

function parseByteLimit(value: string) {
	const trimmed = value.trim().toUpperCase();
	const match = trimmed.match(/^(\d+)([KMG])?$/);

	if (!match) {
		return null;
	}

	const amount = Number(match[1]);
	const unit = match[2] || '';

	switch (unit) {
		case 'G':
			return amount * 1024 * 1024 * 1024;
		case 'M':
			return amount * 1024 * 1024;
		case 'K':
			return amount * 1024;
		default:
			return amount;
	}
}

function isUploadableImage(file: unknown): file is File {
	return file instanceof File && file.size > 0 && file.type.startsWith('image/');
}

export function getUploadsRoot() {
	return env.UPLOAD_DIR?.trim() ? path.resolve(env.UPLOAD_DIR) : path.resolve('data', 'uploads');
}

export function getMaxUploadBytes() {
	const configured = Number(env.UPLOAD_MAX_FILE_MB || DEFAULT_MAX_UPLOAD_MB);
	const mb = Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_MAX_UPLOAD_MB;
	return mb * 1024 * 1024;
}

export function getBodySizeLimitBytes() {
	return parseByteLimit(env.BODY_SIZE_LIMIT || DEFAULT_BODY_SIZE_LIMIT) ?? 512 * 1024;
}

export function getEffectiveUploadBytes() {
	return Math.min(getMaxUploadBytes(), getBodySizeLimitBytes());
}

export function formatBytesLabel(bytes: number) {
	if (bytes >= 1024 * 1024) {
		return `${Math.round((bytes / 1024 / 1024) * 10) / 10} MB`;
	}

	return `${Math.round(bytes / 1024)} KB`;
}

export function getMaxUploadLabel() {
	return formatBytesLabel(getEffectiveUploadBytes());
}

function ensureWithinSizeLimit(file: File) {
	if (file.size > getEffectiveUploadBytes()) {
		throw new UploadError(`Image is too large. Maximum allowed size is ${getMaxUploadLabel()}.`);
	}
}

async function optimizeToWebp(inputPath: string, outputPath: string) {
	try {
		await execFileAsync('ffmpeg', [
			'-y',
			'-i',
			inputPath,
			'-c:v',
			'libwebp',
			'-lossless',
			'0',
			'-q:v',
			'75',
			outputPath
		]);
	} catch {
		throw new UploadError(
			'Image optimization failed. Ensure ffmpeg is installed and available on the server PATH.'
		);
	}
}

export function getMimeTypeForUpload(relativePath: string) {
	return MIME_BY_EXTENSION[path.extname(relativePath).toLowerCase()] || 'application/octet-stream';
}

export async function saveUploadedImage(file: unknown, folder: 'categories' | 'products') {
	if (!isUploadableImage(file)) {
		return '';
	}

	ensureWithinSizeLimit(file);

	const uploadsRoot = getUploadsRoot();
	const targetDir = path.join(uploadsRoot, folder);
	const tempDir = path.join(uploadsRoot, '.tmp');
	await Promise.all([mkdir(targetDir, { recursive: true }), mkdir(tempDir, { recursive: true })]);

	const baseName = randomUUID();
	const originalExtension = path.extname(file.name || '').toLowerCase() || '.jpg';
	const tempInputPath = path.join(tempDir, `${baseName}${originalExtension}`);
	const outputFilename = `${baseName}.webp`;
	const outputPath = path.join(targetDir, outputFilename);

	try {
		const buffer = Buffer.from(await file.arrayBuffer());
		await writeFile(tempInputPath, buffer);
		await optimizeToWebp(tempInputPath, outputPath);
	} finally {
		await rm(tempInputPath, { force: true }).catch(() => undefined);
	}

	return `/uploads/${folder}/${outputFilename}`;
}

export async function saveUploadedImages(files: unknown[], folder: 'categories' | 'products') {
	const uploaded: string[] = [];

	for (const file of files) {
		const savedPath = await saveUploadedImage(file, folder);
		if (savedPath) {
			uploaded.push(savedPath);
		}
	}

	return uploaded;
}
