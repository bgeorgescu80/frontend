import preprocess from 'svelte-preprocess';
import node from '@sveltejs/adapter-node';

let config;

const FRONTEND_PORT = process.env.FRONTEND_PORT || 3000;
const FRONTEND_SSR = process.env.FRONTEND_SSR || false;

console.log(`Frontend SSR: ${FRONTEND_SSR}`);
console.log(`Frontend post: ${FRONTEND_PORT}`);

if(FRONTEND_SSR || process.env.PRODUCTION) {
	console.log("Using SSR config");
	// build server-side rendering
	config = {

		onwarn: (warning, defaultHandler) => {
			// Disable all warnings during the local compilation for now
		},

		compilerOptions: {
			enableSourcemap: true,
		},
		// Consult https://github.com/sveltejs/svelte-preprocess
		// for more information about preprocessors
		preprocess: preprocess({
			sourceMap: true,
		}),


		// Create an adapter that creates build/index.js Node application
		// https://github.com/sveltejs/kit/tree/master/packages/adapter-node
		kit: {
			adapter: node({
				env: {
					port: 'FRONTEND_PORT',
			}}),
			files: {
				hooks: "src/hooks"
			},

			// https://kit.svelte.dev/docs#configuration-hostheader
			headers: {
				host: 'X-Forwarded-Host',
				protocol: 'X-Forwarded-Proto'
			},

		}

	};
} else {
	// build single page app
	console.log("Using local dev env config");
	config = {

		onwarn: (warning, defaultHandler) => {
			// Disable all warnings during the local compilation for now
		},

		compilerOptions: {
			enableSourcemap: true,
		},
		// Consult https://github.com/sveltejs/svelte-preprocess
		// for more information about preprocessors
		preprocess: preprocess({
			sourceMap: true,
		}),


		kit: {
			// hydrate the <div id="svelte"> element in src/app.html
			target: '#svelte'
		}
	};
}

config.kit.vite = {
	optimizeDeps: {
	},
	server: {
		fs: {
		  allow: [
		  	`${process.env.PWD}`
		  ]
		}
  	},

	// Disable 300kb vendor.js chunk generation
	// https://rollupjs.org/guide/en/#big-list-of-options
	// This will give us some 0.2 seconds on FCP and LCP
	// https://stackoverflow.com/a/70499134/315168
	build: {
		rollupOptions: {
			output: {
				manualChunks: undefined
			}
		}
	}

}

export default config;
