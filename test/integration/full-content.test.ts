/// <reference types="node" />

/**
 * External dependencies
 */
import fs from 'node:fs';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

/**
 * WordPress dependencies
 */
import { parse, registerBlockType, serialize } from '@wordpress/blocks';
import type { Block, BlockConfiguration } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from '../../src/block.json';
import save from '../../src/save';
import deprecated from '../../src/deprecated';
import type { BlockAttributes } from '../../src/BlockAttributes';

const FIXTURES_DIR = path.join( __dirname, 'fixtures' );

// Set this to write the expected files that do not exist yet, as Gutenberg does.
const shouldGenerate = !! process.env.GENERATE_MISSING_FIXTURES;

type SerializedBlock = Pick< Block, 'name' | 'isValid' | 'attributes' > & {
	innerBlocks: SerializedBlock[];
};

// Strip unpredictable properties such as the client ID.
function normalizeBlocks( blocks: Block[] ): SerializedBlock[] {
	return blocks.map( ( { name, isValid, attributes, innerBlocks } ) => ( {
		name,
		isValid,
		attributes,
		innerBlocks: normalizeBlocks( innerBlocks ),
	} ) );
}

function readOrGenerate( file: string, actual: string ): string {
	const filePath = path.join( FIXTURES_DIR, file );
	if ( ! fs.existsSync( filePath ) && shouldGenerate ) {
		fs.writeFileSync( filePath, actual );
	}
	return fs.readFileSync( filePath, 'utf8' );
}

const fixtures = fs
	.readdirSync( FIXTURES_DIR )
	.filter( ( file ) => file.endsWith( '.html' ) && ! file.endsWith( '.serialized.html' ) )
	.map( ( file ) => path.basename( file, '.html' ) );

describe( 'full post content fixture', () => {
	beforeAll( () => {
		// Register only what parsing and serializing need, as the editor UI is not loaded.
		registerBlockType< BlockAttributes >( metadata as BlockConfiguration< BlockAttributes >, {
			save,
			deprecated: deprecated as unknown as BlockConfiguration< BlockAttributes >[ 'deprecated' ],
		} );
	} );

	it.each( fixtures )( '%s', ( fixture: string ) => {
		const content = fs.readFileSync( path.join( FIXTURES_DIR, `${ fixture }.html` ), 'utf8' );
		const blocks = parse( content );

		const actualJson = JSON.stringify( normalizeBlocks( blocks ), null, '\t' ) + '\n';
		expect( actualJson ).toBe( readOrGenerate( `${ fixture }.json`, actualJson ) );

		const actualSerialized = serialize( blocks ) + '\n';
		expect( actualSerialized ).toBe(
			readOrGenerate( `${ fixture }.serialized.html`, actualSerialized )
		);
	} );
} );
