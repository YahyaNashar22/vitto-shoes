import process from 'node:process';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const [inputPath, outputPath] = process.argv.slice(2);

if (!inputPath || !outputPath) {
	console.error('Usage: node scripts/optimize-image.mjs <input-image> <output-webp>');
	process.exit(1);
}

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
	console.log(`Optimized ${inputPath} -> ${outputPath}`);
} catch (error) {
	console.error('ffmpeg optimization failed.');
	console.error(error);
	process.exit(1);
}
