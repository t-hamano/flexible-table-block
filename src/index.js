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
import metadata from './block.json';
import example from './example';
import { blockIcon as icon } from './icons';
import edit from './edit';
import save from './save';
import { GlobalSettings } from './settings';

// Register block.
registerBlockType( metadata.name, {
	icon,
	example,
	edit,
	save,
	styles: [
		{
			name: 'stripes',
			label: __( 'Stripes' ),
		},
	],
} );

// Add Global Setting to InspectorControls.
const withInspectorControls = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		const { name, isSelected } = props;

		if ( name !== 'flexible-table-block/table' || ! isSelected ) {
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
