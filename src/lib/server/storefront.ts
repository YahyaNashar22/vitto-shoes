import { existsSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { HomeHeroContent } from '$lib/types';

const STOREFRONT_CONTENT_DIR = path.resolve('data', 'storefront');
const HOME_HERO_PATH = path.join(STOREFRONT_CONTENT_DIR, 'home-hero.json');

export const DEFAULT_HOME_HERO: HomeHeroContent = {
	eyebrow: 'New season selection',
	title: 'Sharp pairs for every step.',
	description:
		'Discover standout pairs for everyday wear, occasion dressing, and on-sale picks, all in one fast storefront designed to help shoppers find the right fit without friction.',
	image: '/hero-banner-1.webp'
};

function sanitizeHeroContent(value: Partial<HomeHeroContent> | null | undefined): HomeHeroContent {
	return {
		eyebrow: value?.eyebrow?.trim() || DEFAULT_HOME_HERO.eyebrow,
		title: value?.title?.trim() || DEFAULT_HOME_HERO.title,
		description: value?.description?.trim() || DEFAULT_HOME_HERO.description,
		image: value?.image?.trim() || DEFAULT_HOME_HERO.image
	};
}

export async function getHomeHeroContent() {
	if (!existsSync(HOME_HERO_PATH)) {
		return DEFAULT_HOME_HERO;
	}

	try {
		const content = readFileSync(HOME_HERO_PATH, 'utf8');
		const parsed = JSON.parse(content) as Partial<HomeHeroContent>;
		return sanitizeHeroContent(parsed);
	} catch {
		return DEFAULT_HOME_HERO;
	}
}

export async function saveHomeHeroContent(nextValue: Partial<HomeHeroContent>) {
	const current = await getHomeHeroContent();
	const merged = sanitizeHeroContent({
		...current,
		...nextValue
	});

	await mkdir(STOREFRONT_CONTENT_DIR, { recursive: true });
	await writeFile(HOME_HERO_PATH, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');

	return merged;
}
