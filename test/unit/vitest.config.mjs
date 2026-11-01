/**
 * External dependencies
 */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const require = createRequire( import.meta.url );
const blockEditorPath = require.resolve( '@wordpress/block-editor/package.json' );

export default defineConfig( {
	root: fileURLToPath( new URL( '../../', import.meta.url ) ),
	test: {
		globals: false,
		restoreMocks: true,
		projects: [
			{
				extends: true,
				test: {
					name: 'unit',
					include: [ 'src/**/*.test.{js,ts}' ],
					environment: 'node',
				},
			},
			{
				extends: true,
				plugins: [
					{
						// In the browser, each WordPress package is a single global. npm installs
						// several copies of some packages, and packages such as hooks and
						// private-apis keep module-level state, so resolve every WordPress package
						// from the block editor to load one copy of each.
						name: 'dedupe-wordpress-packages',
						enforce: 'pre',
						resolveId( source, importer, options ) {
							if ( ! source.startsWith( '@wordpress/' ) || importer === blockEditorPath ) {
								return null;
							}
							return this.resolve( source, blockEditorPath, { ...options, skipSelf: true } );
						},
					},
				],
				// The tsconfig preserves JSX for the build, so transform it here.
				oxc: {
					jsx: { runtime: 'automatic' },
				},
				test: {
					name: 'integration',
					include: [ 'test/integration/**/*.test.ts' ],
					environment: 'jsdom',
					server: {
						deps: {
							// WordPress packages import JSON without import attributes, so let Vite transform them.
							inline: [ /@wordpress\// ],
						},
					},
				},
			},
		],
	},
} );
