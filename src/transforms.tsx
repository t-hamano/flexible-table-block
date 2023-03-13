/**
 * External dependencies
 */
import { mapValues } from 'lodash';

/**
 * WordPress dependencies
 */
import { createBlock } from '@wordpress/blocks';
import type { TransformBlock } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { splitMergedCell, toVirtualRows, toVirtualTable, VCell } from './utils/table-state';
import type { BlockAttributes, CoreTableCell, CoreTableBlockAttributes } from './BlockAttributes';

interface Transforms {
	readonly from: ReadonlyArray< TransformBlock< CoreTableBlockAttributes > >;
	readonly to: ReadonlyArray< TransformBlock< BlockAttributes > >;
}

const transforms: Transforms = {
	from: [
		{
			type: 'block',
			blocks: [ 'core/table' ],
			transform: ( attributes ) => {
				const { hasFixedLayout, head, body, foot, caption } = attributes;

				// Mapping rowspan and colspan properties.
				const convertedSections = ( section: { cells: CoreTableCell[] }[] ) => {
					if ( ! section.length ) {
						return section;
					}
					return section.map( ( row ) => {
						if ( ! row.cells.length ) {
							return row;
						}
						return {
							cells: row.cells.map( ( cell ) => {
								const { content, tag, colspan, rowspan } = cell;
								return {
									content,
									tag,
									colSpan: colspan,
									rowSpan: rowspan,
								};
							} ),
						};
					} );
				};

				return createBlock( 'flexible-table-block/table', {
					head: convertedSections( head ),
					body: convertedSections( body ),
					foot: convertedSections( foot ),
					hasFixedLayout,
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
				const sectionAttributes: any = mapValues( vTable, ( vSection ) => {
					if ( ! vSection.length ) return [];

					return vSection.map( ( { cells } ) => ( {
						cells: cells
							// Delete cells marked as deletion.
							.filter( ( cell ) => ! cell.isHidden )
							// Keep only the properties needed.
							.map( ( cell ) => ( {
								content: cell.content,
								tag: 'head' === cell.sectionName ? 'th' : 'td',
							} ) ),
					} ) );
				} );

				return createBlock( 'core/table', {
					...sectionAttributes,
					hasFixedLayout: attributes.hasFixedLayout,
					caption: attributes.caption,
				} );
			},
		},
	],
};

export default transforms;
