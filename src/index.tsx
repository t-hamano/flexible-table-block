/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls } from '@wordpress/block-editor';
import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
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
import { GlobalSettings } from './settings';
import type { BlockAttributes } from './BlockAttributes';

// Register block.
// @ts-ignore: Not required props are defined as required in @types
const config: BlockConfiguration< BlockAttributes > = {
	icon,
	example,
	transforms,
	edit,
	save,
	styles: [
		{
			name: 'stripes',
			label: __( 'Stripes', 'flexible-table-block' ),
		},
	],
};
registerBlockType( metadata.name, config );

const withInspectorControls = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props: any ) => {
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
