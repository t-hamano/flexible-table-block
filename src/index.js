/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls } from '@wordpress/block-editor';
import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';

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
import { GlobalSettings } from './settings';

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

const withInspectorControls = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		const { name } = props;

		if ( name !== 'flexible-table-block/table' ) {
			return <BlockEdit { ...props } />;
		}

		return (
			<>
				<InspectorControls>
					<GlobalSettings />
				</InspectorControls>
				<BlockEdit { ...props } />
			</>
		);
	};
}, 'withInspectorControl' );

addFilter(
	'editor.BlockEdit',
	'flexible-table-block/withInspectorControls',
	withInspectorControls
);
