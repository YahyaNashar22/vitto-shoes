import adapter from '@sveltejs/adapter-node';

const trustedOrigins = Array.from(
	new Set(
		[
			process.env.TRUSTED_ORIGINS,
			process.env.ORIGIN,
			'https://vittoshoes.com',
			'https://www.vittoshoes.com'
		]
			.flatMap((value) => (typeof value === 'string' ? value.split(',') : []))
			.map((value) => value.trim())
			.filter(Boolean)
	)
);

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		csrf: {
			trustedOrigins
		}
	},
	vitePlugin: {
		dynamicCompileOptions: ({ filename }) =>
			filename.includes('node_modules') ? undefined : { runes: true }
	}
};

export default config;
