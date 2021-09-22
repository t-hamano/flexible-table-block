/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { createBlock } from '@wordpress/blocks';
import { hasMergedCells } from './utils/helper';

const transforms = {
	from: [
		{
			type: 'block',
			blocks: [ 'core/table' ],
			transform: ( attributes ) => {
				const { hasFixedLayout, head, body, foot, caption } = attributes;
				return createBlock( 'flexible-table-block/table', {
					hasFixedLayout,
					head,
					body,
					foot,
					caption,
				} );
			},
		},
	],
	to: [
		{
			type: 'block',
			blocks: [ 'core/table' ],
			transform: ( attributes ) => {
				const { hasFixedLayout, head, body, foot, caption } = attributes;

				// Show alert if table has merged cells.
				if ( ! hasMergedCells( attributes ) ) {
					// eslint-disable-next-line no-alert, no-undef
					alert( __( 'Split all cells before transform.', 'flexible-table-block' ) );
					return null;
				}

				return createBlock( 'core/table', {
					hasFixedLayout,
					head,
					body,
					foot,
					caption,
				} );
			},
		},
	],
};

export default transforms;
