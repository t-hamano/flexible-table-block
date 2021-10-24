/**
 * WordPress dependencies
 */
import { createBlock } from '@wordpress/blocks';
import type { TransformBlock } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import {
	splitMergedCell,
	toTableAttributes,
	toVirtualRows,
	toVirtualTable,
	VCell,
} from './utils/table-state';
import type { BlockAttributes, CoreTableBlockAttributes } from './BlockAttributes';

interface Transforms {
	readonly from: ReadonlyArray< TransformBlock< CoreTableBlockAttributes > >;
	readonly to: ReadonlyArray< TransformBlock< BlockAttributes > >;
}

const transforms: Transforms = {
	from: [
		{
			type: 'block',
			blocks: [ 'core/table' ],
			transform: ( attributes: CoreTableBlockAttributes ) => {
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
			transform: ( attributes: BlockAttributes ) => {
				// Create virtual object array with the cells placed in positions based on how they actually look.
				let vTable = toVirtualTable( attributes );

				// Find rowspan & colspan cells.
				const vRows = toVirtualRows( vTable );

				const rowColSpanCells = vRows
					.reduce( ( cells: VCell[], row ) => cells.concat( row.cells ), [] )
					.filter( ( { rowSpan, colSpan } ) => rowSpan > 1 || colSpan > 1 );
				// Split the found rowspan & colspan cells.
				if ( rowColSpanCells.length ) {
					rowColSpanCells.forEach( ( cell ) => {
						vTable = splitMergedCell( vTable, cell );
					} );
				}

				// Convert to core table block attributes.
				const tableAttributes = toTableAttributes( vTable );

				return createBlock( 'core/table', {
					...tableAttributes,
					hasFixedLayout: attributes.hasFixedLayout,
					caption: attributes.caption,
				} );
			},
		},
	],
};

export default transforms;
