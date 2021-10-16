/**
 * External dependencies
 */
import { mapValues, pick } from 'lodash';

/**
 * WordPress dependencies
 */
import { createBlock } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { splitMergedCell } from './utils/table-state';
import { toVirtualTable } from './utils/helper';

const transforms = {
	from: [
		{
			type: 'block',
			blocks: [ 'core/table' ],
			transform: ( attributes ) => {
				const {
					hasFixedLayout,
					head,
					body,
					foot,
					caption,
				} = attributes;
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
				// Create virtual object array with the cells placed in positions based on how they actually look.
				let vTable = toVirtualTable( attributes );

				// Split all merged cells.
				[ 'head', 'body', 'foot' ].forEach( ( sectionName ) => {
					if ( ! vTable[ sectionName ].length ) return;

					// Number of merged cells in the current virtual section.
					const vMergedCellsCount = vTable[ sectionName ]
						.reduce( ( cells, row ) => {
							return cells.concat( row );
						}, [] )
						.filter( ( cell ) => cell.rowSpan || cell.colSpan )
						.length;

					if ( vMergedCellsCount ) {
						for ( let i = 0; i < vMergedCellsCount; i++ ) {
							// Get the merged virtual cells.
							const vMergedCells = vTable[ sectionName ]
								.reduce( ( cells, row ) => {
									return cells.concat( row );
								}, [] )
								.filter(
									( cell ) => cell.rowSpan || cell.colSpan
								);

							// Split merged virtual cell.
							if ( vMergedCells.length ) {
								vTable = splitMergedCell( vTable, {
									selectedCell: vMergedCells[ 0 ],
								} );
							}
						}
					}
				} );

				// Convert to core table block attributes.
				const vSections = pick( vTable, [ 'head', 'body', 'foot' ] );

				const tableAttributes = mapValues( vSections, ( section ) => {
					if ( ! section.length ) return [];

					return section.map( ( row ) => {
						return {
							cells: row.cells.map( ( cell ) => {
								return cell;
							} ),
						};
					} );
				} );

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
