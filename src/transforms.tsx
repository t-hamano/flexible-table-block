/**
 * WordPress dependencies
 */
import { createBlock, type TransformBlock } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { toVirtualTable } from './utils/table-state';
import { normalizeRowColSpan } from './utils/helper';
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
				const { hasFixedLayout, head, body, foot, caption, style } = attributes;

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
									colSpan: normalizeRowColSpan( colspan ),
									rowSpan: normalizeRowColSpan( rowspan ),
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
					style,
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
				const vTable = toVirtualTable( attributes );

				// Convert to core table block attributes.
				const sectionAttributes = Object.entries( vTable ).reduce(
					( coreTableAttributes: any, [ sectionName, section ] ) => {
						if ( ! section.length ) {
							return coreTableAttributes;
						}

						const newSection = section.map( ( { cells } ) => ( {
							cells: cells
								// Delete cells marked as deletion.
								.filter( ( cell ) => ! cell.isHidden )
								// Keep only the properties needed.
								.map( ( cell ) => ( {
									content: cell.content,
									tag: 'head' === cell.sectionName ? 'th' : 'td',
									rowspan: normalizeRowColSpan( cell.rowSpan ),
									colspan: normalizeRowColSpan( cell.colSpan ),
								} ) ),
						} ) );
						coreTableAttributes[ sectionName ] = newSection;
						return coreTableAttributes;
					},
					{}
				);

				return createBlock( 'core/table', {
					...sectionAttributes,
					hasFixedLayout: attributes.hasFixedLayout,
					caption: attributes.caption,
					style: attributes.style,
				} );
			},
		},
	],
};

export default transforms;
