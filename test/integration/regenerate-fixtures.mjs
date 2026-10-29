/**
 * External dependencies
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FIXTURES_DIR = path.join( path.dirname( fileURLToPath( import.meta.url ) ), 'fixtures' );

// Remove the generated expected files, keeping the input HTML files.
for ( const file of fs.readdirSync( FIXTURES_DIR ) ) {
	if ( file.endsWith( '.json' ) || file.endsWith( '.serialized.html' ) ) {
		fs.rmSync( path.join( FIXTURES_DIR, file ) );
	}
}

// Run the integration tests so that they write the missing expected files, as Gutenberg does.
const { status } = spawnSync( 'npm', [ 'run', 'test:unit', '--', '--project', 'integration' ], {
	stdio: 'inherit',
	shell: true,
	env: { ...process.env, GENERATE_MISSING_FIXTURES: '1' },
} );

process.exit( status ?? 1 );
