/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { RichText, __experimentalUseColorProps as useColorProps } from '@wordpress/block-editor';
import { Button } from '@wordpress/components';
import { plus, trash, moreVertical, moreHorizontal } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { CELL_ARIA_LABEL } from '../constants';
import { isEmptySection, toVirtualRows, toRectangledSelectedCells } from '../utils/helper';
import { insertRow, deleteRow, insertColumn, deleteColumn } from '../utils/table-state';
import { convertToObject } from '../utils/style-converter';
import {
	ButtonRowBeforeInserter,
	ButtonRowAfterInserter,
	ButtonColumnBeforeInserter,
	ButtonColumnAfterInserter,
	ButtonRowSelector,
	ButtonColumnSelector,
	ButtonRowDeleter,
	ButtonColumnDeleter,
} from './styles';

function TSection( { name, ...props } ) {
	const TagName = `t${ name }`;
	return <TagName { ...props } />;
}

function Cell( { name, ...props } ) {
	const TagName = name;
	return <TagName { ...props } />;
}

export default function Table( props ) {
	const {
		attributes,
		setAttributes,
		isSelected,
		options,
		vTable,
		tableStylesObj,
		selectMode,
		selectedCell,
		setSelectedCell,
		selectedCells,
		setSelectedCells,
		selectedLine,
		setSelectedLine,
	} = props;

	const { hasFixedLayout, isStackedOnMobile, sticky } = attributes;

	const colorProps = useColorProps( attributes );

	const onInsertRow = ( sectionName, rowIndex ) => {
		setAttributes( insertRow( attributes, { sectionName, rowIndex } ) );
		setSelectedCell();
		setSelectedCells();
		setSelectedLine();
	};

	const onDeleteRow = ( sectionName, rowIndex ) => {
		// Do not allow tbody to be empty for table with thead /tfoot sections.
		if (
			sectionName === 'body' &&
			vTable.body.length === 1 &&
			vTable.head.length &&
			vTable.foot.length
		) {
			// eslint-disable-next-line no-alert, no-undef
			alert( __( 'The table body must have one or more rows.', 'flexible-table-block' ) );
			return;
		}

		setAttributes( deleteRow( vTable, { sectionName, rowIndex } ) );
		setSelectedCell();
		setSelectedCells();
		setSelectedLine();
	};

	const onInsertColumn = ( vTargetCell, offset ) => {
		// Calculate column index to be inserted considering colspan of the target cell.
		const vColIndex =
			offset === 0
				? vTargetCell.vColIndex
				: vTargetCell.vColIndex +
				  offset +
				  ( vTargetCell.colSpan ? parseInt( vTargetCell.colSpan ) - 1 : 0 );

		setAttributes( insertColumn( vTable, { vColIndex } ) );
		setSelectedCell();
		setSelectedCells();
		setSelectedLine();
	};

	const onDeleteColumn = ( vColIndex ) => {
		setAttributes( deleteColumn( vTable, { vColIndex } ) );
		setSelectedCell();
		setSelectedCells();
		setSelectedLine();
	};

	const onSelectSectionCells = ( sectionName ) => {
		setSelectedCells(
			vTable[ sectionName ].reduce( ( cells, row ) => {
				return cells.concat( row.filter( ( cell ) => ! cell.isDelete ) );
			}, [] )
		);
	};

	const onSelectRow = ( sectionName, rowIndex ) => {
		if ( selectedLine?.sectionName === sectionName && selectedLine?.rowIndex === rowIndex ) {
			setSelectedLine();
			setSelectedCell();
			setSelectedCells();
		} else {
			const firstCell = vTable[ sectionName ][ rowIndex ][ 0 ];
			setSelectedCell( firstCell );
			setSelectedLine( { sectionName, rowIndex } );
			setSelectedCells(
				vTable[ sectionName ].reduce( ( cells, row ) => {
					return cells.concat(
						row.filter( ( cell ) => cell.rowIndex === rowIndex && ! cell.isDelete )
					);
				}, [] )
			);
		}
	};

	const onSelectColumn = ( vColIndex ) => {
		if ( selectedLine?.vColIndex === vColIndex ) {
			setSelectedLine();
			setSelectedCell();
			setSelectedCells();
		} else {
			const firstCell = vTable.body[ 0 ][ vColIndex ];
			const vRows = toVirtualRows( vTable );

			setSelectedCells(
				vRows.reduce(
					( cells, row ) =>
						cells.concat(
							row.filter( ( cell ) => cell.vColIndex === vColIndex && ! cell.isDelete )
						),
					[]
				)
			);

			setSelectedCell( firstCell );
			setSelectedLine( { vColIndex } );
		}
	};

	const onChangeCellContent = ( content ) => {
		if ( ! selectedCell ) return;

		const { sectionName, rowIndex: selectedRowIndex, vColIndex: selectedVColIndex } = selectedCell;

		setAttributes( {
			[ sectionName ]: vTable[ sectionName ].map( ( row, rowIndex ) => {
				if ( rowIndex !== selectedRowIndex ) {
					return { cells: row.filter( ( cell ) => ! cell.isDelete ) };
				}

				return {
					cells: row
						.map( ( cell, vColIndex ) => {
							if ( rowIndex !== selectedRowIndex || vColIndex !== selectedVColIndex ) {
								return cell;
							}
							return {
								...cell,
								content,
							};
						} )
						// Delete cells marked as deletion.
						.filter( ( cell ) => ! cell.isDelete ),
				};
			} ),
		} );
	};

	const onClickCell = ( event, clickedCell ) => {
		const { sectionName, rowIndex, vColIndex } = clickedCell;

		if ( event.shiftKey ) {
			setSelectedCells( toRectangledSelectedCells( vTable, [ selectedCell, clickedCell ] ) );
			setSelectedCell( clickedCell );
		} else if ( event.ctrlKey || event.metaKey ) {
			// Multple select.
			const newSelectedCells = selectedCells ? [ ...selectedCells ] : [];
			const existCellIndex = newSelectedCells.findIndex( ( cell ) => {
				return (
					cell.sectionName === sectionName &&
					cell.rowIndex === rowIndex &&
					cell.colIndex === vColIndex
				);
			} );

			if ( newSelectedCells.length && sectionName !== newSelectedCells[ 0 ].sectionName ) {
				// eslint-disable-next-line no-alert, no-undef
				alert( __( 'Cannot select multi cells from difference section.', 'flexible-table-block' ) );
				return;
			}

			if ( existCellIndex === -1 ) {
				newSelectedCells.push( clickedCell );
				setSelectedCell( clickedCell );
			} else {
				newSelectedCells.splice( existCellIndex, 1 );
				setSelectedCell();
			}

			setSelectedCells( newSelectedCells );
		} else {
			// Select cell for the first time.
			setSelectedCells( [ clickedCell ] );
			setSelectedCell( clickedCell );
		}
	};

	// Remove cells from the virtual table that are not needed for dom rendering.
	const filteredVTable = Object.keys( vTable ).reduce( ( result, sectionName ) => {
		if ( isEmptySection( vTable[ sectionName ] ) ) return result;
		return {
			...result,
			[ sectionName ]: vTable[ sectionName ]
				.map( ( row ) => row.filter( ( cell ) => ! cell.isDelete ) )
				.filter( ( cells ) => cells.length ),
		};
	}, {} );

	const filteredSections = Object.keys( filteredVTable );

	return (
		<table
			className={ classnames( colorProps.className, {
				'has-fixed-layout': hasFixedLayout,
				'is-stacked-on-mobile': isStackedOnMobile,
				[ `is-sticky-${ sticky }` ]: sticky,
			} ) }
			style={ { ...tableStylesObj, ...colorProps.style } }
		>
			{ filteredSections.map( ( sectionName, sectionIndex ) => (
				<TSection name={ sectionName } key={ sectionName }>
					{ filteredVTable[ sectionName ].map( ( row, rowIndex ) => (
						<tr key={ rowIndex }>
							{ row.map( ( cell ) => {
								const { content, tag, styles, rowSpan, colSpan, vColIndex } = cell;

								// Whether or not the current cell is included in the selected cells.
								let isCellSelected =
									selectedCell?.sectionName === sectionName &&
									selectedCell?.rowIndex === rowIndex &&
									selectedCell?.vColIndex === vColIndex;

								if ( selectedCells && selectedCells.length ) {
									isCellSelected = !! selectedCells.some(
										( targetCell ) =>
											targetCell.sectionName === sectionName &&
											targetCell.rowIndex === rowIndex &&
											targetCell.vColIndex === vColIndex
									);
								}

								const cellStylesObj = convertToObject( styles );

								return (
									<Cell
										key={ vColIndex }
										name={ tag }
										className={ classnames( { 'is-selected': isCellSelected } ) }
										rowSpan={ rowSpan }
										colSpan={ colSpan }
										style={ cellStylesObj }
										onClick={ ( event ) => onClickCell( event, cell ) }
									>
										{ isSelected &&
											options.show_label_on_section &&
											rowIndex === 0 &&
											vColIndex === 0 && (
												<Button
													className="ftb-table-cell-label"
													tabIndex={ ! options.focus_control_button && -1 }
													variant="primary"
													onClick={ ( event ) => {
														onSelectSectionCells( sectionName );
														event.stopPropagation();
													} }
												>
													{ `<t${ sectionName }>` }
												</Button>
											) }
										{ isSelected && options.show_control_button && (
											<>
												{ rowIndex === 0 && vColIndex === 0 && (
													<ButtonRowBeforeInserter
														label={ __( 'Insert row before', 'flexible-table-block' ) }
														tabIndex={ ! options.focus_control_button && -1 }
														icon={ plus }
														iconSize="18"
														hasPrevSection={ sectionIndex > 0 }
														onClick={ ( event ) => {
															onInsertRow( sectionName, rowIndex );
															event.stopPropagation();
														} }
													/>
												) }
												{ vColIndex === 0 && (
													<>
														<ButtonRowSelector
															label={ __( 'Select row', 'flexible-table-block' ) }
															tabIndex={ ! options.focus_control_button && -1 }
															icon={ moreVertical }
															iconSize="18"
															variant={
																selectedLine?.sectionName === sectionName &&
																selectedLine?.rowIndex === rowIndex
																	? 'primary'
																	: undefined
															}
															onClick={ ( event ) => {
																onSelectRow( sectionName, rowIndex );
																event.stopPropagation();
															} }
														/>
														{ selectedLine?.sectionName === sectionName &&
															selectedLine?.rowIndex === rowIndex && (
																<ButtonRowDeleter
																	label={ __( 'Delete row', 'flexible-table-block' ) }
																	tabIndex={ ! options.focus_control_button && -1 }
																	icon={ trash }
																	iconSize={ 20 }
																	onClick={ ( event ) => {
																		onDeleteRow( sectionName, rowIndex );
																		event.stopPropagation();
																	} }
																/>
															) }
													</>
												) }
												{ sectionIndex === 0 && rowIndex === 0 && vColIndex === 0 && (
													<ButtonColumnBeforeInserter
														label={ __( 'Insert column before', 'flexible-table-block' ) }
														tabIndex={ ! options.focus_control_button && -1 }
														icon={ plus }
														iconSize="18"
														onClick={ ( event ) => {
															onInsertColumn( cell, 0 );
															event.stopPropagation();
														} }
													/>
												) }
												{ sectionIndex === 0 && rowIndex === 0 && (
													<>
														<ButtonColumnSelector
															label={ __( 'Select column', 'flexible-table-block' ) }
															tabIndex={ ! options.focus_control_button && -1 }
															icon={ moreHorizontal }
															iconSize="18"
															variant={
																selectedLine?.vColIndex === vColIndex ? 'primary' : undefined
															}
															onClick={ ( event ) => {
																onSelectColumn( vColIndex );
																event.stopPropagation();
															} }
														></ButtonColumnSelector>
														{ selectedLine?.vColIndex === vColIndex && (
															<ButtonColumnDeleter
																label={ __( 'Delete column', 'flexible-table-block' ) }
																tabIndex={ ! options.focus_control_button && -1 }
																icon={ trash }
																iconSize={ 20 }
																onClick={ ( event ) => {
																	onDeleteColumn( vColIndex );
																	event.stopPropagation();
																} }
															/>
														) }
													</>
												) }
												{ vColIndex === 0 && (
													<ButtonRowAfterInserter
														label={ __( 'Insert row after', 'flexible-table-block' ) }
														tabIndex={ ! options.focus_control_button && -1 }
														icon={ plus }
														iconSize="18"
														hasNextSection={
															sectionIndex < filteredSections.length - 1 &&
															rowIndex + ( rowSpan ? parseInt( rowSpan ) - 1 : 0 ) ===
																filteredVTable[ sectionName ].length - 1
														}
														onClick={ ( event ) => {
															onInsertRow(
																sectionName,
																rowIndex + ( rowSpan ? parseInt( rowSpan ) : 1 )
															);
															event.stopPropagation();
														} }
													/>
												) }
											</>
										) }
										<RichText
											key={ vColIndex }
											value={ content }
											onChange={ onChangeCellContent }
											unstableOnFocus={ () => {
												if ( ! selectMode ) {
													setSelectedCell( cell );
													setSelectedLine();
													setSelectedCells( [ cell ] );
												}
											} }
											aria-label={ CELL_ARIA_LABEL[ sectionName ] }
										/>
										{ isSelected &&
											options.show_control_button &&
											sectionIndex === 0 &&
											rowIndex === 0 && (
												<ButtonColumnAfterInserter
													label={ __( 'Insert column after', 'flexible-table-block' ) }
													tabIndex={ ! options.focus_control_button && -1 }
													icon={ plus }
													iconSize="18"
													onClick={ ( event ) => {
														onInsertColumn( cell, 1 );
														event.stopPropagation();
													} }
												/>
											) }
									</Cell>
								);
							} ) }
						</tr>
					) ) }
				</TSection>
			) ) }
		</table>
	);
}
