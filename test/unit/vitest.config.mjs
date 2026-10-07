/**
 * External dependencies
 */
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig( {
	root: fileURLToPath( new URL( '../../', import.meta.url ) ),
	test: {
		include: [ 'src/**/*.test.{js,ts}' ],
		environment: 'node',
		globals: false,
		restoreMocks: true,
	},
} );
