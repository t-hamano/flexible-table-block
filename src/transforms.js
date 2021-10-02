/**
 * WordPress dependencies
 */
import { createBlock } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { splitMergedCells } from './utils/table-state';

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
				let newAttributes = attributes;

				// Split all merged cells.
				[ 'head', 'body', 'foot' ].forEach( ( sectionName ) => {
					if ( ! newAttributes[ sectionName ].length ) return;

					// Number of merged cells in the current section.
					const mergedCellsCount = newAttributes[ sectionName ]
						.reduce( ( cells, row ) => {
							return cells.concat( row.cells );
						}, [] )
						.filter( ( cell ) => cell.rowSpan || cell.colSpan ).length;

					if ( mergedCellsCount ) {
						for ( let i = 0; i < mergedCellsCount; i++ ) {
							// Get the merged cells.
							const mergedCells = newAttributes[ sectionName ]
								.reduce( ( cells, row, rowIndex ) => {
									return cells.concat(
										row.cells.map( ( cell, colIndex ) => {
											return {
												sectionName,
												rowIndex,
												colIndex,
												rowSpan: cell.rowSpan,
												colSpan: cell.colSpan,
											};
										} )
									);
								}, [] )
								.filter( ( cell ) => cell.rowSpan || cell.colSpan );

							// Split merged cell.
							if ( mergedCells.length ) {
								newAttributes = {
									...newAttributes,
									...splitMergedCells( newAttributes, {
										selectedCell: mergedCells[ 0 ],
									} ),
								};
							}
						}
					}
				} );

				return createBlock( 'core/table', {
					hasFixedLayout: attributes.hasFixedLayout,
					head: newAttributes.head,
					body: newAttributes.body,
					foot: newAttributes.foot,
					caption: attributes.caption,
				} );
			},
		},
	],
};

export default transforms;
