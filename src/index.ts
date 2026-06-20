/**
 * WordPress dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import type { BlockConfiguration } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import './store';
import './style.scss';
import metadata from './block.json';
import example from './example';
import { blockIcon as icon } from './icons';
import edit from './edit';
import save from './save';
import transforms from './transforms';
import deprecated from './deprecated';
import type { BlockAttributes } from './BlockAttributes';

// Register block.
registerBlockType< BlockAttributes >( metadata as BlockConfiguration< BlockAttributes >, {
	icon,
	edit,
	save,
	example: example as BlockConfiguration< BlockAttributes >[ 'example' ],
	transforms: transforms as unknown as BlockConfiguration< BlockAttributes >[ 'transforms' ],
	deprecated: deprecated as unknown as BlockConfiguration< BlockAttributes >[ 'deprecated' ],
} );
