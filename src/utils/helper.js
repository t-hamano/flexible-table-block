/**
 * External dependencies
 */
import {
	identity,
	isEmpty,
	isObject,
	mapValues,
	pick,
	pickBy,
	times,
} from 'lodash';

/**
 * Sanitize the value of UnitControl.
 *
 * @param {string} value UnitControl value.
 * @return {string} Sanitized UnitControl value.
 */
export function toUnitVal( value ) {
	const parsedValue = parseFloat( value );

	if ( isNaN( parsedValue ) || 0 > parsedValue ) {
		return undefined;
	} else if ( parsedValue === 0 ) {
		return 0;
	}

	return value;
}

/**
 * Parses a number and unit from a value.
 *
 * @param {string} initialValue Value to parse
 * @return {Array} The extracted number and unit.
 */
export function parseUnit( initialValue ) {
	const value = String( initialValue ).trim();

	let num = parseFloat( value );
	num = isNaN( num ) ? '' : num;

	const unitMatch = value.match( /[\d.\-+]*\s*(.*)/ )[ 1 ];

	let unit = unitMatch !== undefined ? unitMatch : '';
	unit = unit.toLowerCase();

	return [ num, unit ];
}

/**
 * Removed falsy values from nested object.
 *
 * @param {Object} object
 * @return {Object} Object cleaned from falsy values
 */
export const cleanEmptyObject = ( object ) => {
	if ( ! isObject( object ) || Array.isArray( object ) ) {
		return object;
	}

	const cleanedNestedObjects = pickBy(
		mapValues( object, cleanEmptyObject ),
		identity
	);

	return isEmpty( cleanedNestedObjects ) ? undefined : cleanedNestedObjects;
};

/**
 * Convert shorthand / longhand CSS values to array.
 *
 * @param {string} value CSS value.
 * @return {string[]} CSS values.
 */
export function parseCssValue( value ) {
	if ( typeof value !== 'string' ) {
		return [ '', '', '', '' ];
	}

	const values = value.split( ' ' );

	switch ( values.length ) {
		case 1:
			return [ values[ 0 ], values[ 0 ], values[ 0 ], values[ 0 ] ];
		case 2:
			return [ values[ 0 ], values[ 1 ], values[ 0 ], values[ 1 ] ];
		case 3:
			return [ values[ 0 ], values[ 1 ], values[ 2 ], values[ 1 ] ];
		case 4:
			return [ values[ 0 ], values[ 1 ], values[ 2 ], values[ 3 ] ];
		default:
			return [ '', '', '', '' ];
	}
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
			return cell.isDelete
				? count
				: count + ( parseInt( cell.colSpan ) || 1 );
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
				const vColIndex = vSection[ cRowIndex ].cells.findIndex(
					( { isFilled } ) => ! isFilled
				);

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
						vSection[ cRowIndex ].cells[
							vColIndex + i
						].isFilled = true;
						vSection[ cRowIndex ].cells[
							vColIndex + i
						].isDelete = true;
					}
				}

				if ( cell.rowSpan ) {
					for ( let i = 1; i < parseInt( cell.rowSpan ); i++ ) {
						vSection[ cRowIndex + i ].cells[
							vColIndex
						].isFilled = true;
						vSection[ cRowIndex + i ].cells[
							vColIndex
						].isDelete = true;

						if ( cell.colSpan ) {
							for (
								let j = 1;
								j < parseInt( cell.colSpan );
								j++
							) {
								vSection[ cRowIndex + i ].cells[
									vColIndex + j
								].isFilled = true;
								vSection[ cRowIndex + i ].cells[
									vColIndex + j
								].isDelete = true;
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
 * @param {Object} vTable Current table state.
 * @return {Object} Table attributes.
 */
export function toTableAttributes( vTable ) {
	const vSections = pick( vTable, [ 'head', 'body', 'foot' ] );

	return mapValues( vSections, ( section ) => {
		if ( ! section.length ) return [];

		return section
			.map( ( { cells } ) => ( {
				// Delete cells marked as deletion.
				cells: cells.filter(
					( cell ) => ! cell.isDelete && ! cell.isMerged
				),
			} ) )
			.filter( ( { cells } ) => cells.length );
	} );
}

/**
 * Create an array of rows from a virtual table by removing empty sections.
 *
 * @param {Object} vTable Current virtual table state.
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
			const vRowIndex = cell.rowSpan
				? cell.rowIndex + parseInt( cell.rowSpan ) - 1
				: cell.rowIndex;
			const vColIndex = cell.colSpan
				? cell.vColIndex + parseInt( cell.colSpan ) - 1
				: cell.vColIndex;

			return {
				minRowIndex:
					minRowIndex < cell.rowIndex ? minRowIndex : cell.rowIndex,
				maxRowIndex: maxRowIndex > vRowIndex ? maxRowIndex : vRowIndex,
				minColIndex:
					minColIndex < cell.vColIndex ? minColIndex : cell.vColIndex,
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

	for (
		let i = vRangeIndexes.minRowIndex;
		i <= vRangeIndexes.maxRowIndex;
		i++
	) {
		vRange[ i ] = [];
		for (
			let j = vRangeIndexes.minColIndex;
			j <= vRangeIndexes.maxColIndex;
			j++
		) {
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
 * @param {Object} vTable           Current virtual table state.
 * @param {Object} options
 * @param {Object} options.fromCell Start cell of the selected range.
 * @param {Object} options.toCell   End cell of the selected range.
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
			if (
				cell.rowIndex === fromCell.rowIndex &&
				cell.vColIndex === fromCell.vColIndex
			) {
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
				( ( cell.vColIndex + colSpan >= minColIndex &&
					cell.vColIndex + colSpan <= maxColIndex ) ||
					( cell.vColIndex >= minColIndex &&
						cell.vColIndex <= maxColIndex ) ) &&
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
				( ( cell.rowIndex + rowSpan >= minRowIndex &&
					cell.rowIndex + rowSpan <= maxRowIndex ) ||
					( cell.rowIndex >= minRowIndex &&
						cell.rowIndex <= maxRowIndex ) ) &&
				cell.vColIndex <= maxColIndex &&
				cell.vColIndex + colSpan > maxColIndex &&
				cell.colSpan
			);
		} );

		const isRightFixed =
			maxColIndex === vColCount - 1 || ! rightCells.length;
		if ( ! isRightFixed ) maxColIndex++;

		// Extend the virtual range to bottom if there are cells that overlap to bottom.
		const bottomCells = vCells.filter( ( cell ) => {
			const rowSpan = cell.rowSpan ? parseInt( cell.rowSpan ) - 1 : 0;
			const colSpan = cell.colSpan ? parseInt( cell.colSpan ) - 1 : 0;

			return (
				( ( cell.vColIndex + colSpan >= minColIndex &&
					cell.vColIndex + colSpan <= maxColIndex ) ||
					( cell.vColIndex >= minColIndex &&
						cell.vColIndex <= maxColIndex ) ) &&
				cell.rowIndex <= maxRowIndex &&
				cell.rowIndex + rowSpan > maxRowIndex &&
				cell.rowSpan
			);
		} );

		const isBottomFixed =
			maxRowIndex === vRowCount - 1 || ! bottomCells.length;
		if ( ! isBottomFixed ) maxRowIndex++;

		// Extend the virtual range to left if there are cells that overlap to left.
		const leftCells = vCells.filter( ( cell ) => {
			const rowSpan = cell.rowSpan ? parseInt( cell.rowSpan ) - 1 : 0;
			const colSpan = cell.colSpan ? parseInt( cell.colSpan ) - 1 : 0;

			return (
				( ( cell.rowIndex + rowSpan >= minRowIndex &&
					cell.rowIndex + rowSpan <= maxRowIndex ) ||
					( cell.rowIndex >= minRowIndex &&
						cell.rowIndex <= maxRowIndex ) ) &&
				cell.vColIndex < minColIndex &&
				cell.vColIndex + colSpan >= minColIndex &&
				cell.colSpan
			);
		} );

		const isLeftFixed = maxColIndex === vColCount - 1 || ! leftCells.length;
		if ( ! isLeftFixed ) minColIndex--;

		isRectangled =
			isTopFixed && isRightFixed && isBottomFixed && isLeftFixed;
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
