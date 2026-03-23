import { randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { existsSync, readFileSync } from 'node:fs';
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

let cachedDotenv: Record<string, string> | null = null;

function readDotenvFallback() {
	if (cachedDotenv) {
		return cachedDotenv;
	}

	const envPath = path.resolve('.env');
	const values: Record<string, string> = {};

	if (!existsSync(envPath)) {
		cachedDotenv = values;
		return values;
	}

	const content = readFileSync(envPath, 'utf8');

	for (const line of content.split(/\r?\n/)) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;

		const separatorIndex = trimmed.indexOf('=');
		if (separatorIndex === -1) continue;

		const key = trimmed.slice(0, separatorIndex).trim();
		const rawValue = trimmed.slice(separatorIndex + 1).trim();
		values[key] = rawValue.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
	}

	cachedDotenv = values;
	return values;
}

function getRuntimeEnvValue(key: string) {
	const fromDynamicEnv = env[key as keyof typeof env];
	if (typeof fromDynamicEnv === 'string' && fromDynamicEnv.trim()) {
		return fromDynamicEnv.trim();
	}

	const fromProcess = process.env[key];
	if (typeof fromProcess === 'string' && fromProcess.trim()) {
		return fromProcess.trim();
	}

	const fromDotenv = readDotenvFallback()[key];
	return typeof fromDotenv === 'string' && fromDotenv.trim() ? fromDotenv.trim() : undefined;
}

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
	const configured = getRuntimeEnvValue('UPLOAD_DIR');
	return configured ? path.resolve(configured) : path.resolve('data', 'uploads');
}

export function getMaxUploadBytes() {
	const configured = Number(getRuntimeEnvValue('UPLOAD_MAX_FILE_MB') || DEFAULT_MAX_UPLOAD_MB);
	const mb = Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_MAX_UPLOAD_MB;
	return mb * 1024 * 1024;
}

export function getBodySizeLimitBytes() {
	return (
		parseByteLimit(getRuntimeEnvValue('BODY_SIZE_LIMIT') || DEFAULT_BODY_SIZE_LIMIT) ?? 512 * 1024
	);
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
