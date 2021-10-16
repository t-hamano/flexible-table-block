/**
 * External dependencies
 */
import { mapValues, pick, times } from 'lodash';

/**
 * Internal dependencies
 */
import { convertToInline, convertToObject } from './style-converter';
import {
	updateBorderColor,
	updateBorderRadius,
	updateBorderStyle,
	updateBorderWidth,
	updatePadding,
} from './style-updater';

/**
 * Creates a table state.
 *
 * @param {Object}  options
 * @param {number}  options.rowCount      Row count for the table to create.
 * @param {number}  options.colCount      Column count for the table to create.
 * @param {boolean} options.headerSection With/without header section.
 * @param {boolean} options.footerSection With/without footer section.
 * @return {import('./VirtualTable').VirtualTable} New table state.
 */
export function createTable( { rowCount, colCount, headerSection, footerSection } ) {
	const createRows = (
		/** @type {number} */ rows,
		/** @type {number} */ cols,
		/** @type {'th'|'td'} */ tag
	) => {
		return times( rows, () => ( {
			cells: times( cols, () => ( {
				content: '',
				tag,
			} ) ),
		} ) );
	};

	return {
		head: createRows( Number( headerSection ), colCount, 'th' ),
		body: createRows( rowCount, colCount, 'td' ),
		foot: createRows( Number( footerSection ), colCount, 'td' ),
	};
}

/**
 * Inserts a row in the virtual table state.
 *
 * @param {import('./VirtualTable').VirtualTable} vTable              Virtual table in which to insert the row.
 * @param {Object}                                options
 * @param {import('./VirtualTable').SectionName}  options.sectionName Section in which to insert the row.
 * @param {number}                                options.rowIndex    Row index at which to insert the row.
 * @return {import('./VirtualTable').VirtualTable} New table state.
 */

export function insertRow( vTable, { sectionName, rowIndex } ) {
	// Number of columns in the row to be inserted.
	const sourceRowIndex = vTable[ sectionName ].length <= rowIndex ? 0 : rowIndex;
	const newRowColCount = vTable[ sectionName ][ sourceRowIndex ].cells.reduce(
		( count, cell ) => count + ( parseInt( cell.colSpan ?? '' ) || 1 ),
		0
	);

	// Row state to be inserted.
	const newRow = {
		cells: times( newRowColCount, () => ( {
			content: '',
			tag: 'head' === sectionName ? 'th' : 'td',
		} ) ),
	};

	return {
		[ sectionName ]: [
			...vTable[ sectionName ].slice( 0, rowIndex ),
			newRow,
			...vTable[ sectionName ].slice( rowIndex ),
		].map( ( { cells }, cRowIndex ) => ( {
			cells: cells.map( ( cell ) => {
				// Expand cells with rowspan in the before and inserted rows.
				if (
					cell.rowSpan &&
					cRowIndex <= rowIndex &&
					cRowIndex + parseInt( cell.rowSpan ) - 1 >= rowIndex
				) {
					return {
						...cell,
						rowSpan: parseInt( cell.rowSpan ) + 1,
					};
				}
				return cell;
			} ),
		} ) ),
	};
}

/**
 * Deletes a row from the virtual table.
 *
 * @param {import('./VirtualTable').VirtualTable} vTable              Virtual table in which to delete the row.
 * @param {Object}                                options
 * @param {import('./VirtualTable').SectionName}  options.sectionName Section in which to delete the row.
 * @param {number}                                options.rowIndex    Row index at which to delete the row.
 * @return {import('./VirtualTable').VirtualTable} New table state.
 */
export function deleteRow( vTable, { sectionName, rowIndex } ) {
	// Find the number of rowspan cells in the row to be deleted.
	const rowSpanCellsCount = vTable[ sectionName ][ rowIndex ].cells.filter(
		( cell ) => cell.rowSpan
	).length;

	// Split the found rowspan cells.
	if ( rowSpanCellsCount ) {
		for ( let i = 0; i < rowSpanCellsCount; i++ ) {
			const vMergedCells = vTable[ sectionName ]
				.reduce( ( cells, row ) => cells.concat( row.cells ), [] )
				.filter( ( cell ) => cell.rowSpan && cell.rowIndex === rowIndex );

			if ( vMergedCells.length ) {
				vTable = splitMergedCell( vTable, {
					selectedCell: vMergedCells[ 0 ],
				} );
			}
		}
	}

	return {
		[ sectionName ]: vTable[ sectionName ].map( ( { cells }, cRowIndex ) => ( {
			cells: cells.map( ( cell ) => {
				// Contract cells with rowspan in the before rows.
				if (
					cell.rowSpan &&
					cRowIndex < rowIndex &&
					cRowIndex + parseInt( cell.rowSpan ) - 1 >= rowIndex
				) {
					return {
						...cell,
						rowSpan: parseInt( cell.rowSpan ) - 1,
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
 * @param {import('./VirtualTable').VirtualTable} vTable            Virtual table in which to insert column.
 * @param {Object}                                options
 * @param {number}                                options.vColIndex Virtual column index at which to insert column.
 * @return {import('./VirtualTable').VirtualTable} New table state.
 */
export function insertColumn( vTable, { vColIndex } ) {
	// Whether to add a column after the last column.
	const isLastColumnInsert = vTable.body[ 0 ].cells.length === vColIndex;

	// Some cells will not be filled if there are cells with rowspan in the column to be inserted,
	// so record the rowindex of the additional cells to be inserted in advance.
	const rowIndexesToFill = { head: [], body: [], foot: [] };

	[ 'head', 'body', 'foot' ].forEach( ( sectionName ) => {
		vTable[ sectionName ].forEach( ( { cells }, cRowIndex ) => {
			cells.forEach( ( cell, cVColIndex ) => {
				if ( cVColIndex === vColIndex && cell.rowSpan ) {
					for ( let i = 1; i < parseInt( cell.rowSpan ); i++ ) {
						rowIndexesToFill[ sectionName ].push( cRowIndex + i );
					}
				}
			} );
		} );
	} );

	const vSections = pick( vTable, [ 'head', 'body', 'foot' ] );

	return mapValues( vSections, ( section, sectionName ) => {
		if ( ! section.length ) return [];

		return section.map( ( { cells }, cRowIndex ) => ( {
			cells: cells.reduce( ( newCells, cell, cVColIndex ) => {
				// Expand cells with colspan in the before columns.
				if (
					cell.colSpan &&
					cVColIndex < vColIndex &&
					cVColIndex + parseInt( cell.colSpan ) - 1 >= vColIndex
				) {
					newCells.push( {
						...cell,
						colSpan: parseInt( cell.colSpan ) + 1,
					} );
					return newCells;
				}

				// Insert cell (after the last column).
				if ( isLastColumnInsert && cVColIndex + 1 === vColIndex ) {
					newCells.push( cell, {
						content: '',
						tag: 'head' === sectionName ? 'th' : 'td',
					} );
					return newCells;
				}

				// Insert cell (between columns).
				if ( cVColIndex === vColIndex && ! cell.isDelete ) {
					newCells.push(
						{
							content: '',
							tag: 'head' === sectionName ? 'th' : 'td',
						},
						cell
					);
					return newCells;
				}

				// Insert cell (additional).
				if ( cVColIndex === vColIndex && rowIndexesToFill[ sectionName ].includes( cRowIndex ) ) {
					newCells.push(
						{
							content: '',
							tag: 'head' === sectionName ? 'th' : 'td',
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
 * Determines whether a virtual section is empty.
 *
 * @param {Object} vSection Virtual section state.
 * @return {boolean} True if the virtual section is empty, false otherwise.
 */
export function isEmptySection( vSection ) {
	return (
		! vSection ||
		! vSection.length ||
		vSection.every( ( { cells } ) => ! ( cells && cells.length ) )
	);
}

/**
 * Determines whether multiple sections are selected on the virtual table.
 *
 * @param {Array} selectedCells Current selected multi cell.
 * @return {boolean} True if multiple sections are selected, false otherwise.
 */
export function isMultiSectionSelected( selectedCells ) {
	const selectedSections = selectedCells.reduce( ( result, selectedCell ) => {
		if ( ! result.includes( selectedCell.sectionName ) ) {
			result.push( selectedCell.sectionName );
		}
		return result;
	}, [] );

	return selectedSections.length > 1;
}

/**
 * Create virtual table object with the cells placed in positions based on how they actually look.
 * This function is used to determine the apparent position of a cell when insert / delete row / column, or merge / split cells, etc.
 *
 * @param {Object} state Current table state.
 * @return {Object} Object of virtual table.
 */
export function toVirtualTable( state ) {
	const vSections = pick( state, [ 'head', 'body', 'foot' ] );

	return mapValues( vSections, ( section, sectionName ) => {
		if ( ! section.length ) return [];

		// Create a virtual section array.
		const vRowCount = section.length;
		const vColCount = section[ 0 ].cells.reduce( ( count, cell ) => {
			return cell.isDelete ? count : count + ( parseInt( cell.colSpan ) || 1 );
		}, 0 );

		const vSection = times( vRowCount, () => ( {
			cells: times( vColCount, () => ( {
				isFilled: false, // Whether the actual cell is placed or not.
			} ) ),
		} ) );

		// Mapping the actual section cells on the virtual section cell.
		section.forEach( ( { cells }, cRowIndex ) => {
			cells.forEach( ( cell, cColIndex ) => {
				// Colmun index on the virtual section excluding cells already marked as "filled".
				const vColIndex = vSection[ cRowIndex ].cells.findIndex( ( { isFilled } ) => ! isFilled );

				if ( vColIndex === -1 ) {
					return;
				}

				// Mark the cell as "filled" and record the position on the virtual section.
				vSection[ cRowIndex ].cells[ vColIndex ] = {
					...cell,
					sectionName,
					isFilled: true,
					rowIndex: cRowIndex,
					colIndex: cColIndex,
					vColIndex,
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

		// Fallback: Fill with empty cells if any cells are not filled correctly.
		vSection.forEach( ( { cells }, cRowIndex ) => {
			cells.forEach( ( cell, cVColIndex ) => {
				if ( ! cell.isFilled ) {
					vSection[ cRowIndex ].cells[ cVColIndex ] = {
						content: '',
						tag: 'head' === sectionName ? 'th' : 'td',
						isFilled: true,
						rowIndex: null,
						colIdex: null,
						vColIndex: cVColIndex,
					};
				}
			} );
		} );

		return vSection;
	} );
}

/**
 * Remove cells from the virtual table that are not actually needed and convert them to table attributes.
 *
 * @param {import('./VirtualTable').VirtualTable} vTable Current table state.
 * @return {Object} Table attributes.
 */
export function toTableAttributes( vTable ) {
	const vSections = pick( vTable, [ 'head', 'body', 'foot' ] );

	return mapValues( vSections, ( section ) => {
		if ( ! section.length ) return [];

		return section
			.map( ( { cells } ) => ( {
				// Delete cells marked as deletion.
				cells: cells.filter( ( cell ) => ! cell.isDelete && ! cell.isMerged ),
			} ) )
			.filter( ( { cells } ) => cells.length );
	} );
}

/**
 * Create an array of rows from a virtual table by removing empty sections.
 *
 * @param {import('./VirtualTable').VirtualTable} vTable Current virtual table state.
 * @return {Object} Object of virtual table.
 */
export function toVirtualRows( vTable ) {
	return Object.keys( vTable ).reduce( ( result, sectionName ) => {
		if ( isEmptySection( vTable[ sectionName ] ) ) return result;
		result.push( ...vTable[ sectionName ] );
		return result;
	}, [] );
}

/**
 * Get the minimum / maximum row / column virtual indexes on virtual table from selected cells.
 *
 * @param {Array} selectedCells Current selected multi cell.
 * @return {Object} Minimum / maximum virtual indexes.
 */
export function getVirtualRange( selectedCells ) {
	return selectedCells.reduce(
		( { minRowIndex, maxRowIndex, minColIndex, maxColIndex }, cell ) => {
			const vRowIndex = cell.rowSpan ? cell.rowIndex + parseInt( cell.rowSpan ) - 1 : cell.rowIndex;
			const vColIndex = cell.colSpan
				? cell.vColIndex + parseInt( cell.colSpan ) - 1
				: cell.vColIndex;

			return {
				minRowIndex: minRowIndex < cell.rowIndex ? minRowIndex : cell.rowIndex,
				maxRowIndex: maxRowIndex > vRowIndex ? maxRowIndex : vRowIndex,
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
 * @param {Array} selectedCells Current selected multi cell.
 * @return {boolean} True if a rectangle will be formed from the selected cells, false otherwise.
 */
export function isRectangleSelected( selectedCells ) {
	if ( ! selectedCells ) return false;

	// No need to merge If only one or no cell is selected.
	if ( selectedCells.length <= 1 ) return false;

	// Check if multiple sections are selected.
	if ( isMultiSectionSelected( selectedCells ) ) return false;

	// Get the minimum / maximum virtual indexes of the matrix from the selected cells.
	const vRangeIndexes = getVirtualRange( selectedCells );

	// Generate indexed matrix from the indexes.
	const vRange = [];

	for ( let i = vRangeIndexes.minRowIndex; i <= vRangeIndexes.maxRowIndex; i++ ) {
		vRange[ i ] = [];
		for ( let j = vRangeIndexes.minColIndex; j <= vRangeIndexes.maxColIndex; j++ ) {
			vRange[ i ][ j ] = false;
		}
	}

	// Map the selected cells to the matrix (mark the cell as "true").
	selectedCells.forEach( ( { rowIndex, vColIndex, rowSpan, colSpan } ) => {
		if ( rowIndex in vRange && vColIndex in vRange[ rowIndex ] ) {
			vRange[ rowIndex ][ vColIndex ] = true;

			if ( colSpan ) {
				for ( let i = 1; i < parseInt( colSpan ); i++ ) {
					vRange[ rowIndex ][ vColIndex + i ] = true;
				}
			}

			if ( rowSpan ) {
				for ( let i = 1; i < parseInt( rowSpan ); i++ ) {
					vRange[ rowIndex + i ][ vColIndex ] = true;

					if ( colSpan ) {
						for ( let j = 1; j < parseInt( colSpan ); j++ ) {
							vRange[ rowIndex + i ][ vColIndex + j ] = true;
						}
					}
				}
			}
		}
	} );

	// Whether all cells in the matrix are filled (whether cell merging is possible).
	return vRange
		.reduce( ( cells, row ) => cells.concat( row ), [] )
		.every( ( cell ) => cell === true );
}

/**
 * Return a set of cells from the start cell and the end cell that will form a rectangle, taking into account the join cells.
 *
 * @param {import('./VirtualTable').VirtualTable} vTable           Current virtual table state.
 * @param {Object}                                options
 * @param {Object}                                options.fromCell Start cell of the selected range.
 * @param {Object}                                options.toCell   End cell of the selected range.
 * @return {Array} Selected cells that represent a rectangle.
 */
export function toRectangledSelectedCells( vTable, { fromCell, toCell } ) {
	if ( ! fromCell || ! toCell ) return [];

	// Check if multiple sections are selected.
	if ( fromCell.sectionName !== toCell.sectionName ) return [];

	// Get the minimum / maximum virtual indexes of the matrix from the selected cells.
	const vRangeIndexes = getVirtualRange( [ fromCell, toCell ] );

	let isRectangled = false;

	let { minRowIndex, maxRowIndex, minColIndex, maxColIndex } = vRangeIndexes;

	const vSection = vTable[ fromCell.sectionName ];
	const vRowCount = vSection.length;
	const vColCount = vSection[ 0 ].length;

	const vCells = vSection
		.reduce( ( cells, row ) => cells.concat( row.cells ), [] )
		.map( ( cell ) => {
			if ( cell.rowIndex === fromCell.rowIndex && cell.vColIndex === fromCell.vColIndex ) {
				cell.isFirstSelected = true;
			}
			return cell;
		} )
		.filter( ( cell ) => ! cell.isDelete );

	// Expand the rectangle if there is a combined cell that passes through each edge.
	while ( ! isRectangled ) {
		// Extend the virtual range to top if there are cells that overlap to top.
		const topCells = vCells.filter( ( cell ) => {
			const rowSpan = cell.rowSpan ? parseInt( cell.rowSpan ) - 1 : 0;
			const colSpan = cell.colSpan ? parseInt( cell.colSpan ) - 1 : 0;

			return (
				( ( cell.vColIndex + colSpan >= minColIndex && cell.vColIndex + colSpan <= maxColIndex ) ||
					( cell.vColIndex >= minColIndex && cell.vColIndex <= maxColIndex ) ) &&
				cell.rowIndex < minRowIndex &&
				cell.rowIndex + rowSpan >= minRowIndex &&
				cell.rowSpan
			);
		} );

		const isTopFixed = minRowIndex === 0 || ! topCells.length;
		if ( ! isTopFixed ) minRowIndex--;

		// Extend the virtual range to right if there are cells that overlap to right.
		const rightCells = vCells.filter( ( cell ) => {
			const rowSpan = cell.rowSpan ? parseInt( cell.rowSpan ) - 1 : 0;
			const colSpan = cell.colSpan ? parseInt( cell.colSpan ) - 1 : 0;

			return (
				( ( cell.rowIndex + rowSpan >= minRowIndex && cell.rowIndex + rowSpan <= maxRowIndex ) ||
					( cell.rowIndex >= minRowIndex && cell.rowIndex <= maxRowIndex ) ) &&
				cell.vColIndex <= maxColIndex &&
				cell.vColIndex + colSpan > maxColIndex &&
				cell.colSpan
			);
		} );

		const isRightFixed = maxColIndex === vColCount - 1 || ! rightCells.length;
		if ( ! isRightFixed ) maxColIndex++;

		// Extend the virtual range to bottom if there are cells that overlap to bottom.
		const bottomCells = vCells.filter( ( cell ) => {
			const rowSpan = cell.rowSpan ? parseInt( cell.rowSpan ) - 1 : 0;
			const colSpan = cell.colSpan ? parseInt( cell.colSpan ) - 1 : 0;

			return (
				( ( cell.vColIndex + colSpan >= minColIndex && cell.vColIndex + colSpan <= maxColIndex ) ||
					( cell.vColIndex >= minColIndex && cell.vColIndex <= maxColIndex ) ) &&
				cell.rowIndex <= maxRowIndex &&
				cell.rowIndex + rowSpan > maxRowIndex &&
				cell.rowSpan
			);
		} );

		const isBottomFixed = maxRowIndex === vRowCount - 1 || ! bottomCells.length;
		if ( ! isBottomFixed ) maxRowIndex++;

		// Extend the virtual range to left if there are cells that overlap to left.
		const leftCells = vCells.filter( ( cell ) => {
			const rowSpan = cell.rowSpan ? parseInt( cell.rowSpan ) - 1 : 0;
			const colSpan = cell.colSpan ? parseInt( cell.colSpan ) - 1 : 0;

			return (
				( ( cell.rowIndex + rowSpan >= minRowIndex && cell.rowIndex + rowSpan <= maxRowIndex ) ||
					( cell.rowIndex >= minRowIndex && cell.rowIndex <= maxRowIndex ) ) &&
				cell.vColIndex < minColIndex &&
				cell.vColIndex + colSpan >= minColIndex &&
				cell.colSpan
			);
		} );

		const isLeftFixed = maxColIndex === vColCount - 1 || ! leftCells.length;
		if ( ! isLeftFixed ) minColIndex--;

		isRectangled = isTopFixed && isRightFixed && isBottomFixed && isLeftFixed;
	}

	// Cells in the newly computed rectangle.
	return vCells.filter(
		( cell ) =>
			cell.rowIndex >= minRowIndex &&
			cell.rowIndex <= maxRowIndex &&
			cell.vColIndex >= minColIndex &&
			cell.vColIndex <= maxColIndex
	);
}

/**
 * Determines whether the selected cells in the virtual table contain merged cells.
 *
 * @param {Array} selectedCells Current selected multi cell.
 * @return {boolean} True if the selected cells in the virtual table contain merged cells, false otherwise.
 */
export function hasMergedCells( selectedCells ) {
	if ( ! selectedCells ) return false;
	return selectedCells.some( ( cell ) => cell.rowSpan || cell.colSpan );
}

/**
 * Deletes a column from the virtual table.
 *
 * @param {import('./VirtualTable').VirtualTable} vTable            Virtual table in which to delete column.
 * @param {Object}                                options
 * @param {number}                                options.vColIndex Virtual column index at which to delete column.
 * @return {import('./VirtualTable').VirtualTable} New table state.
 */
export function deleteColumn( vTable, { vColIndex } ) {
	// Find the colspan cells in the column to be deleted.
	const vRows = toVirtualRows( vTable );
	const colSpanCells = vRows
		.reduce( ( cells, row ) => cells.concat( row ), [] )
		.filter( ( cell ) => cell.colSpan && cell.vColIndex === vColIndex );

	// Split the found colspan cells.
	if ( colSpanCells.length ) {
		colSpanCells.forEach(
			( colSpanCell ) => ( vTable = splitMergedCell( vTable, { selectedCell: colSpanCell } ) )
		);
	}

	const vSections = pick( vTable, [ 'head', 'body', 'foot' ] );

	return mapValues( vSections, ( section ) => {
		if ( ! section.length ) return [];

		return section.map( ( { cells } ) => ( {
			cells: cells.map( ( cell, cVColIndex ) => {
				// Contract cells with colspan in the before columns.
				if (
					cell.colSpan &&
					cVColIndex < vColIndex &&
					cVColIndex + parseInt( cell.colSpan ) - 1 >= vColIndex
				) {
					return {
						...cell,
						colSpan: parseInt( cell.colSpan ) - 1,
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
 * Toggles the existance of a section.
 *
 * @param {import('./VirtualTable').VirtualTable} vTable      Current virtual table state.
 * @param {string}                                sectionName Name of the section to toggle.
 * @return {import('./VirtualTable').VirtualTable} New table state.
 */
export function toggleSection( vTable, sectionName ) {
	// Section exists, replace it with an empty row to remove it.
	if ( ! isEmptySection( vTable[ sectionName ] ) ) {
		return { [ sectionName ]: [] };
	}

	// Number of columns in the row to be inserted.
	const newRowColCount = vTable.body[ 0 ].cells.reduce( ( count, cell ) => {
		if ( cell.isDelete ) return count;
		return count + ( parseInt( cell.colSpan ) || 1 );
	}, 0 );

	// Row state to be inserted.
	const newRow = {
		cells: times( newRowColCount, () => ( {
			content: '',
			tag: 'head' === sectionName ? 'th' : 'td',
		} ) ),
	};

	return { [ sectionName ]: [ newRow ] };
}

/**
 * Merge cells in the virtual table.
 *
 * @param {import('./VirtualTable').VirtualTable} vTable                Current virtual table state.
 * @param {Object}                                options
 * @param {number}                                options.selectedCells Current selected multi cell.
 * @return {import('./VirtualTable').VirtualTable} New table state.
 */
export function mergeCells( vTable, { selectedCells } ) {
	const { sectionName } = selectedCells[ 0 ];

	// Get the minimum / maximum virtual indexes of the matrix from the selected cells.
	const vRangeIndexes = getVirtualRange( selectedCells );

	const { minRowIndex, maxRowIndex, minColIndex, maxColIndex } = vRangeIndexes;

	// Find the rowspan & colspan cells.
	const rowColSpanCellsCount = selectedCells.filter( ( cell ) => cell.rowSpan || cell.colSpan );

	// Split the found rowspan & colspan cells.
	if ( rowColSpanCellsCount ) {
		for ( let i = 0; i < rowColSpanCellsCount; i++ ) {
			const vMergedCells = vTable[ sectionName ]
				.reduce( ( cells, row ) => cells.concat( row ), [] )
				.filter(
					( cell ) =>
						( cell.rowSpan || cell.colSpan ) &&
						minRowIndex <= cell.rowIndex &&
						maxRowIndex >= cell.rowIndex &&
						minColIndex <= cell.vColIndex &&
						maxColIndex >= cell.vColIndex
				);

			if ( vMergedCells.length ) {
				vTable = splitMergedCell( vTable, { selectedCell: vMergedCells[ 0 ] } );
			}
		}
	}

	return {
		[ sectionName ]: vTable[ sectionName ].map( ( { cells }, rowIndex ) => {
			if ( rowIndex < minRowIndex || rowIndex > maxRowIndex ) {
				// Row not to be merged.
				return { cells: cells.filter( ( cell ) => ! cell.isDelete ) };
			}

			return {
				cells: cells.map( ( cell, colIndex ) => {
					if ( colIndex === minColIndex && rowIndex === minRowIndex ) {
						// Cells to merge.
						const rowSpan = Math.abs( maxRowIndex - minRowIndex ) + 1;
						const colSpan = Math.abs( maxColIndex - minColIndex ) + 1;

						return {
							...cell,
							rowSpan: rowSpan > 1 ? rowSpan : undefined,
							colSpan: colSpan > 1 ? colSpan : undefined,
						};
					}

					// Cells to be merged (Mark as deletion).
					if (
						rowIndex >= minRowIndex &&
						rowIndex <= maxRowIndex &&
						colIndex >= minColIndex &&
						colIndex <= maxColIndex
					) {
						return {
							...cell,
							isMerged: true,
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
 * @param {import('./VirtualTable').VirtualTable} vTable                Current virtual table state.
 * @param {Object}                                options
 * @param {number}                                options.selectedCells Current selected multi cell.
 * @return {import('./VirtualTable').VirtualTable} New table state.
 */
export function splitMergedCells( vTable, { selectedCells } ) {
	// Find the rowspan & colspan cells.
	const rowColSpanCells = selectedCells.filter( ( cell ) => cell.rowSpan || cell.colSpan );

	// Split the found rowspan & colspan cells.
	if ( rowColSpanCells.length ) {
		rowColSpanCells.forEach( ( selectedCell ) => {
			vTable = splitMergedCell( vTable, { selectedCell } );
		} );
	}

	const vSections = pick( vTable, [ 'head', 'body', 'foot' ] );

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
 * @param {import('./VirtualTable').VirtualTable} vTable               Current virtual table state.
 * @param {Object}                                options
 * @param {number}                                options.selectedCell Current selected virtual cell.
 * @return {import('./VirtualTable').VirtualTable} New table state.
 */
export function splitMergedCell( vTable, { selectedCell } ) {
	const { sectionName, rowIndex, vColIndex, rowSpan, colSpan } = selectedCell;

	const vSection = vTable[ sectionName ];

	// Split the selected cells and map them on the virtual section.
	vSection[ rowIndex ].cells[ vColIndex ] = {
		...vSection[ rowIndex ].cells[ vColIndex ],
		rowSpan: undefined,
		colSpan: undefined,
	};

	if ( colSpan ) {
		for ( let i = 1; i < parseInt( colSpan ); i++ ) {
			vSection[ rowIndex ].cells[ vColIndex + i ] = {
				...vSection[ rowIndex ].cells[ vColIndex ],
				content: undefined,
			};
		}
	}

	if ( rowSpan ) {
		for ( let i = 1; i < parseInt( rowSpan ); i++ ) {
			vSection[ rowIndex + i ].cells[ vColIndex ] = {
				...vSection[ rowIndex ].cells[ vColIndex ],
				content: undefined,
			};

			if ( colSpan ) {
				for ( let j = 1; j < parseInt( colSpan ); j++ ) {
					vSection[ rowIndex + i ].cells[ vColIndex + j ] = {
						...vSection[ rowIndex ].cells[ vColIndex ],
						content: undefined,
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
 * @param {import('./VirtualTable').VirtualTable} vTable                Current virtual table state.
 * @param {Object}                                cellState             Cell states to update.
 * @param {Object}                                options
 * @param {Array}                                 options.selectedCells Current selected multi cell.
 * @return {import('./VirtualTable').VirtualTable} New table state.
 */
export function updateCellsState( vTable, cellState, { selectedCells } ) {
	const vSections = pick( vTable, [ 'head', 'body', 'foot' ] );

	return mapValues( vSections, ( section, cSectionName ) => {
		if ( ! section.length ) return [];

		return section.map( ( { cells }, cRowIndex ) => ( {
			cells: cells.map( ( cell, cVColIndex ) => {
				// Refer to the selected cell to determine if it is the target cell to update.
				const isTargetCell = !! selectedCells.some(
					( targetCell ) =>
						targetCell.sectionName === cSectionName &&
						targetCell.rowIndex === cRowIndex &&
						targetCell.vColIndex === cVColIndex
				);

				if ( ! isTargetCell ) return cell;

				let stylesObj = convertToObject( cell?.styles );

				if ( cellState.styles ) {
					const styles = cellState.styles;

					stylesObj = { ...stylesObj, ...styles };
					stylesObj = updatePadding( stylesObj, styles?.padding );
					stylesObj = updateBorderWidth( stylesObj, styles?.borderWidth );
					stylesObj = updateBorderRadius( stylesObj, styles?.borderRadius );
					stylesObj = updateBorderStyle( stylesObj, styles?.borderStyle );
					stylesObj = updateBorderColor( stylesObj, styles?.borderColor );
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
