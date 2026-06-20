/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';

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

// Register block.
const config = {
	title: __( 'Flexible Table', 'flexible-table-block' ),
	category: 'text',
	description: __( 'Create a flexible configuration table.', 'flexible-table-block' ),
	icon,
	example,
	transforms,
	edit,
	save,
	deprecated,
	styles: [
		{
			name: 'stripes',
			label: __( 'Stripes', 'flexible-table-block' ),
		},
	],
};
registerBlockType( metadata.name, config );
