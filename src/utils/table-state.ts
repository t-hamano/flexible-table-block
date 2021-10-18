/**
 * External dependencies
 */
import type { Properties } from 'csstype';
import { mapValues, pick, times } from 'lodash';

/**
 * Internal dependencies
 */
import { convertToInline, convertToObject } from './style-converter';
import type { Corners, Direction } from './style-picker';
import {
	updateBorderColor,
	updateBorderRadius,
	updateBorderStyle,
	updateBorderWidth,
	updatePadding,
} from './style-updater';

// Section name types
export type SectionName = 'head' | 'body' | 'foot';

// Table attributes
type TableAttributes = Record< SectionName, { cells: Cell[] }[] >;

// Table cell attributes
interface Cell {
	content: string;
	styles?: string;
	tag: 'td' | 'th';
	className?: string;
	rowSpan?: string;
	colSpan?: string;
}

// Virtual table
export type VTable = Record< SectionName, VRow[] >;

// Virtual table section type
type VSection = VRow[];

// Virtual table row state
export interface VRow {
	cells: VCell[];
}

// Virtual table cell state
export interface VCell {
	content: string;
	styles?: string;
	tag: 'td' | 'th';
	className?: string;
	rowSpan: number;
	colSpan: number;
	sectionName: string;
	rowIndex: number;
	colIndex: number;
	vColIndex: number;
	isDelete: boolean;
	isFirstSelected?: boolean;
	isFilled?: boolean;
}

// Minimum / maximum row / column virtual indexes on virtual table
interface VRangeIndexes {
	minRowIndex: number;
	maxRowIndex: number;
	minColIndex: number;
	maxColIndex: number;
}

// Parameters for creating virtual table
interface createTableParams {
	rowCount: number;
	colCount: number;
	headerSection: boolean;
	footerSection: boolean;
}
/**
 * Creates a table state.
 *
 * @param  options
 * @param  options.rowCount      Row count for the table to create.
 * @param  options.colCount      Column count for the table to create.
 * @param  options.headerSection With/without header section.
 * @param  options.footerSection With/without footer section.
 * @return New virtual table state.
 */
export function createTable( {
	rowCount,
	colCount,
	headerSection,
	footerSection,
}: createTableParams ) {
	const createSection = ( rows: number, cols: number, sectionName: SectionName ): VSection => {
		return times(
			rows,
			( rowIndex ): VRow => ( {
				cells: times(
					cols,
					( colIndex ): VCell => ( {
						content: '',
						tag: sectionName === 'head' ? 'th' : 'td',
						rowSpan: 1,
						colSpan: 1,
						sectionName,
						rowIndex,
						isFirstSelected: false,
						colIndex,
						vColIndex: colIndex,
						isDelete: false,
					} )
				),
			} )
		);
	};

	return {
		head: createSection( Number( headerSection ), colCount, 'head' ),
		body: createSection( rowCount, colCount, 'body' ),
		foot: createSection( Number( footerSection ), colCount, 'foot' ),
	};
}

/**
 * Inserts a row in the virtual table state.
 *
 * @param  vTable              Virtual table in which to insert the row.
 * @param  options
 * @param  options.sectionName Section in which to insert the row.
 * @param  options.rowIndex    Row index at which to insert the row.
 * @return  New virtual table state.
 */

export function insertRow(
	vTable: VTable,
	{ sectionName, rowIndex }: { sectionName: SectionName; rowIndex: number }
): VTable {
	// Number of columns in the row to be inserted.
	const newRowColCount: number = vTable.body[ 0 ].cells.length;

	// Row state to be inserted.
	const newRow: VRow = {
		cells: times(
			newRowColCount,
			( colIndex ): VCell => ( {
				content: '',
				tag: 'head' === sectionName ? 'th' : 'td',
				rowSpan: 1,
				colSpan: 1,
				sectionName,
				rowIndex,
				colIndex,
				isFirstSelected: false,
				vColIndex: colIndex,
				isDelete: false,
			} )
		),
	};

	return {
		...vTable,
		[ sectionName ]: [
			...vTable[ sectionName ].slice( 0, rowIndex ),
			newRow,
			...vTable[ sectionName ].slice( rowIndex ),
		].map( ( { cells }, cRowIndex ) => ( {
			cells: cells.map( ( cell ) => {
				// Expand cells with rowspan in the before and inserted rows.
				if (
					cell.rowSpan > 1 &&
					cRowIndex <= rowIndex &&
					cRowIndex + cell.rowSpan - 1 >= rowIndex
				) {
					return {
						...cell,
						sectionName,
						rowIndex: cRowIndex,
						rowSpan: cell.rowSpan + 1,
					};
				}
				return { ...cell, rowIndex: cRowIndex };
			} ),
		} ) ),
	};
}

/**
 * Deletes a row from the virtual table.
 *
 * @param  vTable              Virtual table in which to delete the row.
 * @param  options
 * @param  options.sectionName Section in which to delete the row.
 * @param  options.rowIndex    Row index at which to delete the row.
 * @return  New virtual table state.
 */
export function deleteRow(
	vTable: VTable,
	{ sectionName, rowIndex }: { sectionName: SectionName; rowIndex: number }
) {
	// Find the number of rowspan cells in the row to be deleted.
	const rowSpanCellsCount: number = vTable[ sectionName ][ rowIndex ].cells.filter(
		( cell ) => cell.rowSpan > 1
	).length;

	// Split the found rowspan cells.
	if ( rowSpanCellsCount ) {
		for ( let i = 0; i < rowSpanCellsCount; i++ ) {
			const vMergedCells: VCell[] = vTable[ sectionName ]
				.reduce( ( cells: VCell[], row: VRow ) => cells.concat( row.cells ), [] )
				.filter( ( cell: VCell ) => cell.rowSpan > 1 && cell.rowIndex === rowIndex );

			if ( vMergedCells.length ) {
				vTable = splitMergedCell( vTable, vMergedCells[ 0 ] );
			}
		}
	}

	return {
		...vTable,
		[ sectionName ]: vTable[ sectionName ].map( ( { cells }, cRowIndex ) => ( {
			cells: cells.map( ( cell ) => {
				// Contract cells with rowspan in the before rows.
				if (
					cell.rowSpan > 1 &&
					cRowIndex < rowIndex &&
					cRowIndex + cell.rowSpan - 1 >= rowIndex
				) {
					return {
						...cell,
						rowSpan: cell.rowSpan - 1,
					};
				}

				// Cells to be deleted (Mark as deletion).
				if ( cRowIndex === rowIndex ) {
					return {
						...cell,
						isDelete: true,
					};
				}

				return cell;
			} ),
		} ) ),
	};
}

/**
 * Inserts a column in the virtual table.
 *
 * @param  vTable            Virtual table in which to insert column.
 * @param  options
 * @param  options.vColIndex Virtual column index at which to insert column.
 * @return  New virtual table state.
 */
export function insertColumn( vTable: VTable, { vColIndex }: { vColIndex: number } ): VTable {
	// Whether to add a column after the last column.
	const isLastColumnInsert: boolean = vTable.body[ 0 ].cells.length === vColIndex;

	// Some cells will not be filled if there are cells with rowspan in the column to be inserted,
	// so record the rowindex of the additional cells to be inserted in advance.
	const rowIndexesToFill: { head: number[]; body: number[]; foot: number[] } = {
		head: [],
		body: [],
		foot: [],
	};

	[ 'head', 'body', 'foot' ].forEach( ( sectionName ) => {
		vTable[ sectionName as SectionName ].forEach( ( row: VRow, cRowIndex ) => {
			row.cells.forEach( ( cell, cVColIndex ) => {
				if ( cVColIndex === vColIndex && cell.rowSpan > 1 ) {
					for ( let i = 1; i < cell.rowSpan; i++ ) {
						rowIndexesToFill[ sectionName as SectionName ].push( cRowIndex + i );
					}
				}
			} );
		} );
	} );

	const vSections: VTable = pick( vTable, [ 'head', 'body', 'foot' ] );

	return mapValues( vSections, ( section, sectionName ) => {
		if ( ! section.length ) return [];

		return section.map( ( { cells }, cRowIndex ) => ( {
			cells: cells.reduce( ( newCells: VCell[], cell, cVColIndex ) => {
				// Expand cells with colspan in the before columns.
				if (
					cell.colSpan > 1 &&
					cVColIndex < vColIndex &&
					cVColIndex + cell.colSpan - 1 >= vColIndex
				) {
					newCells.push( {
						...cell,
						colSpan: cell.colSpan + 1,
					} );
					return newCells;
				}

				// Insert cell (after the last column).
				if ( isLastColumnInsert && cVColIndex + 1 === vColIndex ) {
					newCells.push( cell, {
						content: '',
						tag: 'head' === sectionName ? 'th' : 'td',
						rowSpan: 1,
						colSpan: 1,
						sectionName: cell.sectionName,
						rowIndex: cell.rowIndex,
						colIndex: cell.colIndex + 1,
						vColIndex: cell.vColIndex + 1,
						isDelete: false,
					} );
					return newCells;
				}

				// Insert cell (between columns).
				if ( cVColIndex === vColIndex && ! cell.isDelete ) {
					newCells.push(
						{
							content: '',
							tag: 'head' === sectionName ? 'th' : 'td',
							rowSpan: 1,
							colSpan: 1,
							sectionName: cell.sectionName,
							rowIndex: cell.rowIndex,
							colIndex: cell.colIndex - 1,
							vColIndex: cell.vColIndex - 1,
							isDelete: false,
						},
						cell
					);
					return newCells;
				}

				// Insert cell (additional).
				if (
					cVColIndex === vColIndex &&
					rowIndexesToFill[ sectionName as SectionName ].includes( cRowIndex )
				) {
					newCells.push(
						{
							content: '',
							tag: 'head' === sectionName ? 'th' : 'td',
							rowSpan: 1,
							colSpan: 1,
							sectionName: cell.sectionName,
							rowIndex: cRowIndex,
							colIndex: cell.colIndex - 1,
							vColIndex: cell.vColIndex - 1,
							isDelete: false,
						},
						cell
					);
					return newCells;
				}

				newCells.push( cell );
				return newCells;
			}, [] ),
		} ) );
	} );
}

/**
 * Deletes a column from the virtual table.
 *
 * @param  vTable            Virtual table in which to delete column.
 * @param  options
 * @param  options.vColIndex Virtual column index at which to delete column.
 * @return  New virtual table state.
 */
export function deleteColumn( vTable: VTable, { vColIndex }: { vColIndex: number } ): VTable {
	// Find the colspan cells in the column to be deleted.
	const vRows: VRow[] = toVirtualRows( vTable );

	const colSpanCells: VCell[] = vRows
		.reduce( ( cells: VCell[], row ) => cells.concat( row.cells ), [] )
		.filter( ( cell: VCell ) => cell.colSpan && cell.vColIndex === vColIndex );

	// Split the found colspan cells.
	if ( colSpanCells.length ) {
		colSpanCells.forEach( ( cell ) => ( vTable = splitMergedCell( vTable, cell ) ) );
	}

	const vSections: VTable = pick( vTable, [ 'head', 'body', 'foot' ] );

	return mapValues( vSections, ( section ) => {
		if ( ! section.length ) return [];

		return section.map( ( { cells } ) => ( {
			cells: cells.map( ( cell, cVColIndex ) => {
				// Contract cells with colspan in the before columns.
				if (
					cell.colSpan &&
					cVColIndex < vColIndex &&
					cVColIndex + cell.colSpan - 1 >= vColIndex
				) {
					return {
						...cell,
						colSpan: cell.colSpan - 1,
					};
				}

				// Cells to be deleted (Mark as deletion).
				if ( cVColIndex === vColIndex ) {
					return {
						...cell,
						isDelete: true,
					};
				}

				return cell;
			}, [] ),
		} ) );
	} );
}

/**
 * Merge cells in the virtual table.
 *
 * @param  vTable        Current virtual table state.
 * @param  selectedCells Current selected cells.
 * @return New virtual table state.
 */
export function mergeCells( vTable: VTable, selectedCells: VCell[] ): VTable {
	if ( ! selectedCells.length ) return vTable;

	const sectionName: SectionName = selectedCells[ 0 ].sectionName as SectionName;

	// Create the minimum / maximum virtual indexes of the matrix from the selected cells.
	const vRangeIndexes: VRangeIndexes = getVirtualRangeIndexes( selectedCells );

	const { minRowIndex, maxRowIndex, minColIndex, maxColIndex } = vRangeIndexes;

	// Find the rowspan & colspan cells in selected cells.
	const rowColSpanCellsCount: number = selectedCells.filter(
		( { rowSpan, colSpan } ) => rowSpan > 1 || colSpan > 1
	).length;

	// Split the found rowspan & colspan cells before merge cell.
	if ( rowColSpanCellsCount ) {
		for ( let i = 0; i < rowColSpanCellsCount; i++ ) {
			const vMergedCells: VCell[] = vTable[ sectionName as SectionName ]
				.reduce( ( cells: VCell[], row ) => cells.concat( row.cells ), [] )
				.filter(
					( cell: VCell ) =>
						( cell.rowSpan > 1 || cell.colSpan > 1 ) &&
						minRowIndex <= cell.rowIndex &&
						maxRowIndex >= cell.rowIndex &&
						minColIndex <= cell.vColIndex &&
						maxColIndex >= cell.vColIndex
				);

			if ( vMergedCells.length ) {
				vTable = splitMergedCell( vTable, vMergedCells[ 0 ] );
			}
		}
	}

	return {
		...vTable,
		[ sectionName ]: vTable[ sectionName as SectionName ].map( ( row, rowIndex ) => {
			if ( rowIndex < minRowIndex || rowIndex > maxRowIndex ) {
				// Row not to be merged.
				return row;
			}

			return {
				cells: row.cells.map( ( cell, vColIndex ) => {
					if ( vColIndex === minColIndex && rowIndex === minRowIndex ) {
						// Cell to merge.
						return {
							...cell,
							rowSpan: Math.abs( maxRowIndex - minRowIndex ) + 1,
							colSpan: Math.abs( maxColIndex - minColIndex ) + 1,
						};
					}

					// Cells to be merged (Mark as deletion).
					if (
						rowIndex >= minRowIndex &&
						rowIndex <= maxRowIndex &&
						vColIndex >= minColIndex &&
						vColIndex <= maxColIndex
					) {
						return {
							...cell,
							isDelete: true,
						};
					}

					// Cells not to be merged.
					return cell;
				} ),
			};
		} ),
	};
}

/**
 * Split selected cells in the virtual table state.
 *
 * @param  vTable        Current virtual table state.
 * @param  selectedCells Current selected cells.
 * @return  New virtual table state.
 */
export function splitMergedCells( vTable: VTable, selectedCells: VCell[] ): VTable {
	// Find the rowspan & colspan cells.
	const rowColSpanCells: VCell[] = selectedCells.filter(
		( { rowSpan, colSpan } ) => rowSpan > 1 || colSpan > 1
	);

	// Split the found rowspan & colspan cells.
	if ( rowColSpanCells.length ) {
		rowColSpanCells.forEach( ( cell ) => {
			vTable = splitMergedCell( vTable, cell );
		} );
	}

	const vSections: VTable = pick( vTable, [ 'head', 'body', 'foot' ] );

	return mapValues( vSections, ( section ) => {
		if ( ! section.length ) return [];

		return section.map( ( { cells } ) => ( {
			cells: cells.map( ( cell ) => cell, [] ),
		} ) );
	} );
}

/**
 * Split single cell in the virtual table state.
 *
 * @param  vTable       Current virtual table state.
 * @param  selectedCell Current selected cells.
 * @return New virtual table state.
 */
export function splitMergedCell( vTable: VTable, selectedCell: VCell ): VTable {
	const { sectionName, rowIndex, vColIndex, rowSpan, colSpan } = selectedCell;

	const vSection: VSection = vTable[ sectionName as SectionName ];

	// Split the selected cells and map them on the virtual section.
	vSection[ rowIndex ].cells[ vColIndex ] = {
		...vSection[ rowIndex ].cells[ vColIndex ],
		rowSpan: 1,
		colSpan: 1,
	};

	if ( colSpan > 1 ) {
		for ( let i = 1; i < colSpan; i++ ) {
			vSection[ rowIndex ].cells[ vColIndex + i ] = {
				...vSection[ rowIndex ].cells[ vColIndex ],
				content: '',
			};
		}
	}

	if ( rowSpan > 1 ) {
		for ( let i = 1; i < rowSpan; i++ ) {
			vSection[ rowIndex + i ].cells[ vColIndex ] = {
				...vSection[ rowIndex ].cells[ vColIndex ],
				content: '',
			};

			if ( colSpan > 1 ) {
				for ( let j = 1; j < colSpan; j++ ) {
					vSection[ rowIndex + i ].cells[ vColIndex + j ] = {
						...vSection[ rowIndex ].cells[ vColIndex ],
						content: '',
					};
				}
			}
		}
	}

	return {
		...vTable,
		[ sectionName ]: vSection,
	};
}

/**
 * Update cells state( styles, tag ) of selected section.
 *
 * @param  vTable                        Current virtual table state.
 * @param  cellState                     Cell states to update.
 * @param  cellState.styles              Cell styles.
 * @param  cellState.tag                 Cell tag.
 * @param  cellState.className           Cell classes.
 * @param  cellState.styles.padding      Cell padding values.
 * @param  cellState.styles.borderWidth  Cell border-width values.
 * @param  cellState.styles.borderRadius Cell border-radius values.
 * @param  cellState.styles.borderStyle  Cell border-style values.
 * @param  cellState.styles.borderColor  Cell border-color values.
 * @param  selectedCells                 Current selected cells.
 * @return  New virtual table state.
 */
export function updateCells(
	vTable: VTable,
	cellState: {
		styles?: {
			padding: Partial< Direction > | undefined;
			borderWidth: Partial< Direction > | undefined;
			borderRadius: Partial< Corners > | undefined;
			borderStyle: Partial< Direction > | undefined;
			borderColor: Partial< Direction > | undefined;
		};
		tag: 'th' | 'td';
		className?: string;
	},
	selectedCells: VCell[]
): VTable {
	const vSections: VTable = pick( vTable, [ 'head', 'body', 'foot' ] );

	return mapValues( vSections, ( section, cSectionName ) => {
		if ( ! section.length ) return [];

		return section.map( ( { cells }, cRowIndex ) => ( {
			cells: cells.map( ( cell, cVColIndex ) => {
				// Refer to the selected cell to determine if it is the target cell to update.
				const isTargetCell: boolean = selectedCells.some(
					( targetCell ) =>
						targetCell.sectionName === cSectionName &&
						targetCell.rowIndex === cRowIndex &&
						targetCell.vColIndex === cVColIndex
				);

				if ( ! isTargetCell ) return cell;

				let stylesObj: Properties = convertToObject( cell?.styles );

				if ( cellState.styles ) {
					stylesObj = updatePadding( stylesObj, cellState.styles?.padding );
					stylesObj = updateBorderWidth( stylesObj, cellState.styles?.borderWidth );
					stylesObj = updateBorderRadius( stylesObj, cellState.styles?.borderRadius );
					stylesObj = updateBorderStyle( stylesObj, cellState.styles?.borderStyle );
					stylesObj = updateBorderColor( stylesObj, cellState.styles?.borderColor );
				}

				return {
					...cell,
					styles: convertToInline( stylesObj ),
					tag: cellState.tag || cell.tag,
					className: cellState.className || undefined,
				};
			}, [] ),
		} ) );
	} );
}

/**
 * Determines whether a virtual section is empty.
 *
 * @param  section Virtual section state.
 * @return True if the virtual section is empty, false otherwise.
 */
export function isEmptySection( section: VSection ): boolean {
	return (
		! section ||
		! section.length ||
		section.every( ( { cells }: { cells: VCell[] } ) => ! ( cells && cells.length ) )
	);
}

/**
 * Determines whether multiple sections are selected on the virtual table.
 *
 * @param  selectedCells Current selected cells.
 * @return True if multiple sections are selected, false otherwise.
 */
export function isMultiSectionSelected( selectedCells: VCell[] ): boolean {
	const selectedSections: SectionName[] = selectedCells.reduce(
		( result: SectionName[], selectedCell ) => {
			if ( ! result.includes( selectedCell.sectionName as SectionName ) ) {
				result.push( selectedCell.sectionName as SectionName );
			}
			return result;
		},
		[]
	);

	return selectedSections.length > 1;
}

/**
 * Create virtual table object with the cells placed in positions based on how they actually look.
 * This function is used to determine the apparent position of a cell when insert / delete row / column, or merge / split cells, etc.
 *
 * @param  state Current table state.
 * @return Object of virtual table.
 */
export function toVTable( state: TableAttributes ): VTable {
	const vSections = pick( state, [ 'head', 'body', 'foot' ] );

	return mapValues( vSections, ( section, sectionName ) => {
		if ( ! section.length ) return [];
		// Create a virtual section array.
		const rowCount: number = section.length;
		const colCount: number = section[ 0 ].cells.reduce( ( count: number, cell: Cell ) => {
			return count + ( cell.colSpan ? parseInt( cell.colSpan ) : 1 );
		}, 0 );

		const vSection: VSection = times(
			rowCount,
			(): VRow => ( {
				cells: times(
					colCount,
					(): VCell => ( {
						content: '',
						tag: 'head' === sectionName ? 'th' : 'td',
						rowSpan: 1,
						colSpan: 1,
						sectionName,
						isDelete: false,
						// Whether the actual cell is placed or not.
						isFilled: false,
						// Dummy indexes.
						rowIndex: -1,
						colIndex: -1,
						vColIndex: -1,
					} )
				),
			} )
		);

		// Mapping the actual section cells on the virtual section cell.
		section.forEach( ( row, cRowIndex: number ) => {
			row.cells.forEach( ( cell, cColIndex: number ) => {
				// Colmun index on the virtual section excluding cells already marked as "filled".
				const vColIndex: number = vSection[ cRowIndex ].cells.findIndex(
					( { isFilled } ) => ! isFilled
				);
				if ( vColIndex === -1 ) {
				}

				// Mark the cell as "filled" and record the position on the virtual section.
				vSection[ cRowIndex ].cells[ vColIndex ] = {
					...cell,
					isFilled: true,
					sectionName,
					rowSpan: cell.rowSpan ? parseInt( cell.rowSpan ) : 1,
					colSpan: cell.colSpan ? parseInt( cell.colSpan ) : 1,
					rowIndex: cRowIndex,
					colIndex: cColIndex,
					vColIndex,
					isDelete: false,
				};

				// For cells with rowspan / colspan, mark cells that are visually filled as "filled".
				// Additionaly mark it as a cell to be deleted because it does not exist in the actual section.
				if ( cell.colSpan ) {
					for ( let i = 1; i < parseInt( cell.colSpan ); i++ ) {
						vSection[ cRowIndex ].cells[ vColIndex + i ].isFilled = true;
						vSection[ cRowIndex ].cells[ vColIndex + i ].isDelete = true;
					}
				}
				if ( cell.rowSpan ) {
					for ( let i = 1; i < parseInt( cell.rowSpan ); i++ ) {
						vSection[ cRowIndex + i ].cells[ vColIndex ].isFilled = true;
						vSection[ cRowIndex + i ].cells[ vColIndex ].isDelete = true;
						if ( cell.colSpan ) {
							for ( let j = 1; j < parseInt( cell.colSpan ); j++ ) {
								vSection[ cRowIndex + i ].cells[ vColIndex + j ].isFilled = true;
								vSection[ cRowIndex + i ].cells[ vColIndex + j ].isDelete = true;
							}
						}
					}
				}
			} );
		} );

		// // Fallback: Fill with empty cells if any cells are not filled correctly.
		// vSection.forEach( ( { cells }, cRowIndex ) => {
		// 	cells.forEach( ( cell, cVColIndex ) => {
		// 		if ( ! cell.isFilled ) {
		// 			vSection[ cRowIndex ].cells[ cVColIndex ] = {
		// 				tag: 'head' === sectionName ? 'th' : 'td',
		// 				isFilled: true,
		// 				sectionName,
		// 				rowIndex: 1,
		// 				colIndex: 1,
		// 				vColIndex: cVColIndex,
		// 				rowSpan: 1,
		// 				colSpan: 1,
		// 				isDelete: false,
		// 				isFirstSelected: false,
		// 			};
		// 		}
		// 	} );
		// } );
		return vSection;
	} );
}

/**
 * Remove cells from the virtual table that are not actually needed and convert them to table attributes.
 *
 * @param  vTable Current table state.
 * @return {Object} Table attributes.
 */
export function toTableAttributes( vTable: VTable ): TableAttributes {
	const vSections: VTable = pick( vTable, [ 'head', 'body', 'foot' ] );

	return mapValues( vSections, ( vSection ) => {
		if ( ! vSection.length ) return [];

		return (
			vSection
				.map( ( { cells } ) => ( {
					cells: cells
						// Delete cells marked as deletion.
						.filter( ( cell ) => ! cell.isDelete )
						// Keep only the properties needed.
						.map( ( cell ) => ( {
							content: cell.content,
							styles: cell.styles,
							tag: cell.tag,
							className: cell.className,
							rowSpan: cell.rowSpan > 1 ? String( cell.rowSpan ) : undefined,
							colSpan: cell.colSpan > 1 ? String( cell.colSpan ) : undefined,
						} ) ),
				} ) )
				// Delete empty row.
				.filter( ( { cells } ) => cells.length )
		);
	} );
}

/**
 * Create an array of rows from a virtual table by removing empty sections.
 *
 * @param  vTable Current virtual table state.
 * @return virtual table rows array.
 */
export function toVirtualRows( vTable: VTable ): VRow[] {
	return Object.keys( vTable ).reduce( ( result: VRow[], sectionName ) => {
		if ( isEmptySection( vTable[ sectionName as SectionName ] ) ) return result;
		result.push( ...vTable[ sectionName as SectionName ] );
		return result;
	}, [] );
}

/**
 * Get the minimum / maximum row / column virtual indexes on virtual table from selected cells.
 *
 * @param  selectedCells Current selected cells.
 * @return Minimum / maximum virtual indexes.
 */
export function getVirtualRangeIndexes( selectedCells: VCell[] ): VRangeIndexes {
	return selectedCells.reduce(
		( { minRowIndex, maxRowIndex, minColIndex, maxColIndex }, cell ) => {
			const VRowIndex: number = cell.rowSpan > 1 ? cell.rowIndex + cell.rowSpan - 1 : cell.rowIndex;
			const vColIndex: number =
				cell.colSpan > 1 ? cell.vColIndex + cell.colSpan - 1 : cell.vColIndex;

			return {
				minRowIndex: minRowIndex < cell.rowIndex ? minRowIndex : cell.rowIndex,
				maxRowIndex: maxRowIndex > VRowIndex ? maxRowIndex : VRowIndex,
				minColIndex: minColIndex < cell.vColIndex ? minColIndex : cell.vColIndex,
				maxColIndex: maxColIndex > vColIndex ? maxColIndex : vColIndex,
			};
		},
		{
			minRowIndex: selectedCells[ 0 ].rowIndex,
			maxRowIndex: selectedCells[ 0 ].rowIndex,
			minColIndex: selectedCells[ 0 ].vColIndex,
			maxColIndex: selectedCells[ 0 ].vColIndex,
		}
	);
}

/**
 * Determines whether a rectangle will be formed from the selected cells in the virtual table.
 * This function is used to determines whether to allow cell merging from the selected cells.
 *
 * @param  selectedCells Current selected cells.
 * @return True if a rectangle will be formed from the selected cells, false otherwise.
 */
export function isRectangleSelected( selectedCells: VCell[] ): boolean {
	if ( ! selectedCells ) return false;

	// No need to merge If only one or no cell is selected.
	if ( selectedCells.length <= 1 ) return false;

	// Check if multiple sections are selected.
	if ( isMultiSectionSelected( selectedCells ) ) return false;

	// Get the minimum / maximum virtual indexes of the matrix from the selected cells.
	const vRangeIndexes: VRangeIndexes = getVirtualRangeIndexes( selectedCells );

	// Generate indexed matrix from the indexes.
	const vRange: boolean[][] = [];

	for ( let i = vRangeIndexes.minRowIndex; i <= vRangeIndexes.maxRowIndex; i++ ) {
		vRange[ i ] = [];
		for ( let j = vRangeIndexes.minColIndex; j <= vRangeIndexes.maxColIndex; j++ ) {
			vRange[ i ][ j ] = false;
		}
	}

	// Map the selected cells to the matrix (mark the cell as "true").
	selectedCells.forEach( ( cell: VCell ) => {
		if ( cell.rowIndex in vRange && cell.vColIndex in vRange[ cell.rowIndex ] ) {
			vRange[ cell.rowIndex ][ cell.vColIndex ] = true;

			if ( cell.colSpan > 1 ) {
				for ( let i = 1; i < cell.colSpan; i++ ) {
					vRange[ cell.rowIndex ][ cell.vColIndex + i ] = true;
				}
			}

			if ( cell.rowSpan > 1 ) {
				for ( let i = 1; i < cell.rowSpan; i++ ) {
					vRange[ cell.rowIndex + i ][ cell.vColIndex ] = true;

					if ( cell.colSpan > 1 ) {
						for ( let j = 1; j < cell.colSpan; j++ ) {
							vRange[ cell.rowIndex + i ][ cell.vColIndex + j ] = true;
						}
					}
				}
			}
		}
	} );

	// Whether all cells in the matrix are filled (whether cell merging is possible).
	return vRange.reduce( ( cells, row ) => cells.concat( row ), [] ).every( ( cell ) => cell );
}

/**
 * Return a set of cells from the start cell and the end cell that will form a rectangle, taking into account the join cells.
 *
 * @param  vTable           Current virtual table state.
 * @param  options
 * @param  options.fromCell Start cell of the selected range.
 * @param  options.toCell   End cell of the selected range.
 * @return Selected cells that represent a rectangle.
 */
export function toRectangledSelectedCells(
	vTable: VTable,
	{ fromCell, toCell }: { fromCell: VCell; toCell: VCell }
): VCell[] {
	if ( ! fromCell || ! toCell ) return [];

	// Check if multiple sections are selected.
	if ( fromCell.sectionName !== toCell.sectionName ) return [];

	// Get the minimum / maximum virtual indexes of the matrix from the selected cells.
	const vRangeIndexes: VRangeIndexes = getVirtualRangeIndexes( [ fromCell, toCell ] );

	let isRectangled: boolean = false;

	let { minRowIndex, maxRowIndex, minColIndex, maxColIndex } = vRangeIndexes;

	const currentSection: VSection = vTable[ fromCell.sectionName as SectionName ];
	const rowCount: number = currentSection.length;
	const colCount: number = currentSection[ 0 ].cells.length;

	const VCells: VCell[] = currentSection
		.reduce( ( cells: VCell[], row: VRow ) => cells.concat( row.cells ), [] )
		.map( ( cell: VCell ) => {
			if ( cell.rowIndex === fromCell.rowIndex && cell.vColIndex === fromCell.vColIndex ) {
				cell.isFirstSelected = true;
			}
			return cell;
		} )
		.filter( ( cell: VCell ) => ! cell.isDelete );

	// Expand the rectangle if there is a combined cell that passes through each edge.
	while ( ! isRectangled ) {
		// Extend the virtual range to top if there are cells that overlap to top.
		const topCells: VCell[] = VCells.filter( ( cell: VCell ) => {
			return (
				( ( cell.vColIndex + cell.colSpan - 1 >= minColIndex &&
					cell.vColIndex + cell.colSpan - 1 <= maxColIndex ) ||
					( cell.vColIndex >= minColIndex && cell.vColIndex <= maxColIndex ) ) &&
				cell.rowIndex < minRowIndex &&
				cell.rowIndex + cell.rowSpan - 1 >= minRowIndex &&
				cell.rowSpan > 1
			);
		} );

		const isTopFixed: boolean = minRowIndex === 0 || ! topCells.length;
		if ( ! isTopFixed ) minRowIndex--;

		// Extend the virtual range to right if there are cells that overlap to right.
		const rightCells: VCell[] = VCells.filter( ( cell: VCell ) => {
			return (
				( ( cell.rowIndex + cell.rowSpan - 1 >= minRowIndex &&
					cell.rowIndex + cell.rowSpan - 1 <= maxRowIndex ) ||
					( cell.rowIndex >= minRowIndex && cell.rowIndex <= maxRowIndex ) ) &&
				cell.vColIndex <= maxColIndex &&
				cell.vColIndex + cell.colSpan - 1 > maxColIndex &&
				cell.colSpan > 1
			);
		} );

		const isRightFixed: boolean = maxColIndex === colCount - 1 || ! rightCells.length;
		if ( ! isRightFixed ) maxColIndex++;

		// Extend the virtual range to bottom if there are cells that overlap to bottom.
		const bottomCells: VCell[] = VCells.filter( ( cell: VCell ) => {
			return (
				( ( cell.vColIndex + cell.colSpan - 1 >= minColIndex &&
					cell.vColIndex + cell.colSpan - 1 <= maxColIndex ) ||
					( cell.vColIndex >= minColIndex && cell.vColIndex <= maxColIndex ) ) &&
				cell.rowIndex <= maxRowIndex &&
				cell.rowIndex + cell.rowSpan - 1 > maxRowIndex &&
				cell.rowSpan - 1
			);
		} );

		const isBottomFixed: boolean = maxRowIndex === rowCount - 1 || ! bottomCells.length;
		if ( ! isBottomFixed ) maxRowIndex++;

		// Extend the virtual range to left if there are cells that overlap to left.
		const leftCells: VCell[] = VCells.filter( ( cell: VCell ) => {
			return (
				( ( cell.rowIndex + cell.rowSpan - 1 >= minRowIndex &&
					cell.rowIndex + cell.rowSpan - 1 <= maxRowIndex ) ||
					( cell.rowIndex >= minRowIndex && cell.rowIndex <= maxRowIndex ) ) &&
				cell.vColIndex < minColIndex &&
				cell.vColIndex + cell.colSpan - 1 >= minColIndex &&
				cell.colSpan > 1
			);
		} );

		const isLeftFixed: boolean = maxColIndex === colCount - 1 || ! leftCells.length;
		if ( ! isLeftFixed ) minColIndex--;

		isRectangled = isTopFixed && isRightFixed && isBottomFixed && isLeftFixed;
	}

	// Cells in the newly computed rectangle.
	return VCells.filter(
		( cell: VCell ) =>
			cell.rowIndex >= minRowIndex &&
			cell.rowIndex <= maxRowIndex &&
			cell.vColIndex >= minColIndex &&
			cell.vColIndex <= maxColIndex
	);
}

/**
 * Determines whether the selected cells in the virtual table contain merged cells.
 *
 * @param  selectedCells Current selected cells.
 * @return True if the selected cells in the virtual table contain merged cells, false otherwise.
 */
export function hasMergedCells( selectedCells: VCell[] ): boolean {
	if ( ! selectedCells ) return false;
	return selectedCells.some(
		( { rowSpan, colSpan }: { rowSpan: number; colSpan: number } ) => rowSpan > 1 || colSpan > 1
	);
}

/**
 * Toggles the existance of a section.
 *
 * @param  vTable      Current virtual table state.
 * @param  sectionName Name of the section to toggle.
 * @return New virtual table state.
 */
export function toggleSection( vTable: VTable, sectionName: SectionName ): VTable {
	// Section exists, replace it with an empty row to remove it.
	if ( ! isEmptySection( vTable[ sectionName ] ) ) {
		return {
			...vTable,
			[ sectionName ]: [],
		};
	}

	// Number of columns in the row to be inserted.
	const newRowColCount: number = vTable.body[ 0 ].cells.length;

	// Row state to be inserted.
	const newRow: VRow = {
		cells: times( newRowColCount, ( colIndex ) => ( {
			content: '',
			tag: 'head' === sectionName ? 'th' : 'td',
			rowSpan: 1,
			colSpan: 1,
			sectionName,
			rowIndex: 0,
			colIndex,
			vColIndex: colIndex,
			isDelete: false,
			isFirstSelected: false,
		} ) ),
	};

	return {
		...vTable,
		[ sectionName ]: [ newRow ],
	};
}