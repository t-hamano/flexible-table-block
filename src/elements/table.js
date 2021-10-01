/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { RichText, __experimentalUseColorProps as useColorProps } from '@wordpress/block-editor';
import { Button, Popover } from '@wordpress/components';
import { plus, trash, moreVertical, moreHorizontal } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { CELL_ARIA_LABEL } from '../constants';
import {
	isMultiSelected,
	isRangeSelected,
	getSectionRange,
	toVirtualSection,
} from '../utils/helper';
import { insertRow, deleteRow, insertColumn, deleteColumn } from '../utils/table-state';
import { convertToObject } from '../utils/style-converter';
import {
	ButtonRowBeforeInserter,
	ButtonRowAfterInserter,
	ButtonColumnBeforeInserter,
	ButtonColumnAfterInserter,
	ButtonRowSelector,
	ButtonColumnSelector,
	ButtonDeleter,
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
		filteredSections,
		options,
		attributes,
		setAttributes,
		tableStylesObj,
		isSelected,
		selectedCell,
		setSelectedCell,
		selectedMultiCell,
		setSelectedMultiCell,
		selectedRangeCell,
		setSelectedRangeCell,
		selectedLine,
		setSelectedLine,
	} = props;

	const { hasFixedLayout, isStackedOnMobile, sticky } = attributes;

	const colorProps = useColorProps( attributes );

	// Create virtual table array with the cells placed in positions based on how they actually look.
	const vTable = {
		head: attributes.head.length ? toVirtualSection( attributes, { sectionName: 'head' } ) : [],
		body: attributes.body.length ? toVirtualSection( attributes, { sectionName: 'body' } ) : [],
		foot: attributes.foot.length ? toVirtualSection( attributes, { sectionName: 'foot' } ) : [],
	};

	const onInsertRow = ( sectionName, rowIndex ) => {
		setAttributes(
			insertRow( attributes, {
				sectionName,
				rowIndex,
			} )
		);
	};

	const onDeleteRow = ( sectionName, rowIndex ) => {
		setAttributes(
			deleteRow( attributes, {
				sectionName,
				rowIndex,
			} )
		);

		setSelectedCell();
		setSelectedMultiCell();
		setSelectedRangeCell();
		setSelectedLine();
	};

	const onChangeCellContent = ( content ) => {
		const {
			sectionName: selectedSectionName,
			rowIndex: selectedRowIndex,
			columnIndex: selectedColumnIndex,
		} = selectedCell;

		if ( ! attributes[ selectedSectionName ] ) return;

		const newSection = attributes[ selectedSectionName ].map( ( row, rowIndex ) => {
			if ( rowIndex !== selectedRowIndex ) {
				return row;
			}

			return {
				cells: row.cells.map( ( cell, columnIndex ) => {
					if ( columnIndex !== selectedColumnIndex ) {
						return cell;
					}

					return {
						...cell,
						content,
					};
				} ),
			};
		} );

		setAttributes( { [ selectedSectionName ]: newSection } );
	};

	return (
		<>
			<table
				className={ classnames( colorProps.className, {
					'has-fixed-layout': hasFixedLayout,
					'is-stacked-on-mobile': isStackedOnMobile,
					[ `is-sticky-${ sticky }` ]: sticky,
				} ) }
				style={ { ...tableStylesObj, ...colorProps.style } }
			>
				{ filteredSections.map( ( sectionName, sectionIndex, section ) => {
					return (
						<TSection name={ sectionName } key={ sectionName }>
							{ attributes[ sectionName ].map( ( { cells }, rowIndex, row ) => (
								<tr key={ rowIndex }>
									{ cells.map( ( { content, tag, styles, rowSpan, colSpan }, columnIndex ) => {
										const cellStylesObj = convertToObject( styles );

										// Get the corresponding cell on the virtual table.
										// const vCell = vTable[ sectionName ][ rowIndex ].find( ( cell ) => {
										// 	return cell.rowIndex === rowIndex && cell.columnIndex === columnIndex;
										// } );

										let isCellSelected =
											selectedCell &&
											selectedCell.sectionName === sectionName &&
											selectedCell.rowIndex === rowIndex &&
											selectedCell.columnIndex === columnIndex;

										if ( isRangeSelected( selectedRangeCell ) ) {
											const { fromCell, toCell } = selectedRangeCell;
											isCellSelected =
												rowIndex >= Math.min( fromCell.rowIndex, toCell.rowIndex ) &&
												rowIndex <= Math.max( fromCell.rowIndex, toCell.rowIndex ) &&
												columnIndex >= Math.min( fromCell.columnIndex, toCell.columnIndex ) &&
												columnIndex <= Math.max( fromCell.columnIndex, toCell.columnIndex ) &&
												sectionName === fromCell.sectionName;
										} else if ( isMultiSelected( selectedMultiCell ) ) {
											isCellSelected = !! selectedMultiCell.find( ( cell ) => {
												return (
													cell.sectionName === sectionName &&
													cell.rowIndex === rowIndex &&
													cell.columnIndex === columnIndex
												);
											} );
										}

										// Whether the cell is placed in the first column on the actual table.
										// const isFirstColumn = columnIndex === 0 && vCell.vColumnIndex === 0;
										const isFirstColumn = false;

										const cellClass = classnames( {
											'is-selected': isCellSelected,
										} );

										return (
											<Cell
												key={ columnIndex }
												name={ tag }
												className={ cellClass }
												rowSpan={ rowSpan }
												colSpan={ colSpan }
												style={ cellStylesObj }
												onClick={ ( e ) => {
													const clickedCell = { sectionName, rowIndex, columnIndex };

													if ( e.shiftKey ) {
														if ( ! selectedRangeCell?.fromCell ) return;
														const { fromCell } = selectedRangeCell;
														if ( sectionName !== fromCell.sectionName ) {
															// eslint-disable-next-line no-alert, no-undef
															alert(
																__(
																	'Cannot select multi cells from difference section.',
																	'flexible-table-block'
																)
															);
															return;
														}
														setSelectedRangeCell( { fromCell, toCell: clickedCell } );
														setSelectedMultiCell();
													} else if ( e.ctrlKey || e.metaKey ) {
														const newSelectedMultiCell = selectedMultiCell
															? [ ...selectedMultiCell ]
															: [];

														const existCellIndex = newSelectedMultiCell.findIndex( ( cell ) => {
															return (
																cell.sectionName === sectionName &&
																cell.rowIndex === rowIndex &&
																cell.columnIndex === columnIndex
															);
														} );

														if (
															newSelectedMultiCell.length &&
															sectionName !== newSelectedMultiCell[ 0 ].sectionName
														) {
															// eslint-disable-next-line no-alert, no-undef
															alert(
																__(
																	'Cannot select multi cells from difference section.',
																	'flexible-table-block'
																)
															);
															return;
														}

														if ( existCellIndex === -1 ) {
															newSelectedMultiCell.push( clickedCell );
														} else {
															newSelectedMultiCell.splice( existCellIndex, 1 );
														}

														setSelectedMultiCell( newSelectedMultiCell );
														setSelectedRangeCell();
													} else {
														setSelectedMultiCell( [ clickedCell ] );
														setSelectedRangeCell( { fromCell: clickedCell } );
													}
												} }
											>
												{ isSelected &&
													options.show_label_on_section &&
													rowIndex === 0 &&
													columnIndex === 0 && (
														<Button
															className="ftb-table-cell-label"
															tabIndex={ options.prevent_focus_control_button && -1 }
															variant="primary"
															onClick={ ( e ) => {
																const sectionRange = getSectionRange( attributes, sectionName );
																setSelectedRangeCell( sectionRange );
																e.stopPropagation();
															} }
														>
															{ `<t${ sectionName }>` }
														</Button>
													) }
												{ isSelected && options.show_control_button && (
													<>
														{ isFirstColumn && rowIndex === 0 && columnIndex === 0 && (
															<ButtonRowBeforeInserter
																label={ __( 'Insert row before', 'flexible-table-block' ) }
																tabIndex={ options.prevent_focus_control_button && -1 }
																icon={ plus }
																iconSize="18"
																hasPrevSection={ sectionIndex > 0 }
																onClick={ () => {
																	onInsertRow( sectionName, rowIndex );
																} }
															/>
														) }
														{ isFirstColumn && columnIndex === 0 && (
															<>
																<ButtonRowSelector
																	label={ __( 'Select row', 'flexible-table-block' ) }
																	tabIndex={ options.prevent_focus_control_button && -1 }
																	icon={ moreVertical }
																	iconSize="18"
																	variant={
																		selectedLine?.direction === 'row' &&
																		selectedLine?.sectionName === sectionName &&
																		selectedLine?.rowIndex === rowIndex
																			? 'primary'
																			: undefined
																	}
																	onClick={ () => {
																		setSelectedCell();
																		setSelectedLine( {
																			direction: 'row',
																			sectionName,
																			rowIndex,
																		} );
																	} }
																>
																	{ selectedLine?.direction === 'row' &&
																		selectedLine?.sectionName === sectionName &&
																		selectedLine?.rowIndex === rowIndex && (
																			<Popover
																				focusOnMount="container"
																				position="top left"
																				onClose={ () => {
																					setSelectedLine();
																				} }
																			>
																				<ButtonDeleter
																					label={ __( 'Delete row', 'flexible-table-block' ) }
																					icon={ trash }
																					iconSize={ 20 }
																					isSmall
																					onClick={ ( event ) => {
																						onDeleteRow( sectionName, rowIndex );
																						event.stopPropagation();
																					} }
																				/>
																			</Popover>
																		) }
																</ButtonRowSelector>
															</>
														) }
														{ sectionIndex === 0 && rowIndex === 0 && columnIndex === 0 && (
															<ButtonColumnBeforeInserter
																label={ __( 'Insert column before', 'flexible-table-block' ) }
																tabIndex={ options.prevent_focus_control_button && -1 }
																icon={ plus }
																iconSize="18"
																onClick={ () => {
																	onInsertColumn( { sectionName, columnIndex, offset: 0 } );
																} }
															/>
														) }
														{ sectionIndex === 0 && rowIndex === 0 && (
															<>
																<ButtonColumnSelector
																	label={ __( 'Select column', 'flexible-table-block' ) }
																	tabIndex={ options.prevent_focus_control_button && -1 }
																	icon={ moreHorizontal }
																	iconSize="18"
																	variant={
																		selectedLine?.direction === 'column' &&
																		selectedLine?.columnIndex === columnIndex
																			? 'primary'
																			: undefined
																	}
																	onClick={ () => {
																		setSelectedCell();
																		setSelectedLine( { direction: 'column', columnIndex } );
																	} }
																>
																	{ selectedLine?.direction === 'column' &&
																		selectedLine?.columnIndex === columnIndex && (
																			<Popover
																				focusOnMount="container"
																				position="top center"
																				onClose={ () => {
																					setSelectedLine();
																				} }
																			>
																				<ButtonDeleter
																					label={ __( 'Delete column', 'flexible-table-block' ) }
																					tabIndex={ options.prevent_focus_control_button && -1 }
																					icon={ trash }
																					iconSize={ 20 }
																					onClick={ ( event ) => {
																						onDeleteColumn( columnIndex );
																						event.stopPropagation();
																					} }
																				/>
																			</Popover>
																		) }
																</ButtonColumnSelector>
															</>
														) }
														{ columnIndex === 0 && (
															<ButtonRowAfterInserter
																label={ __( 'Insert row after', 'flexible-table-block' ) }
																tabIndex={ options.prevent_focus_control_button && -1 }
																icon={ plus }
																iconSize="18"
																hasNextSection={
																	sectionIndex < section.length - 1 && rowIndex === row.length - 1
																}
																onClick={ () => {
																	onInsertRow( sectionName, rowIndex + 1 );
																} }
															/>
														) }
													</>
												) }
												<RichText
													key={ columnIndex }
													value={ content }
													onChange={ onChangeCellContent }
													unstableOnFocus={ () => {
														setSelectedLine();
														setSelectedCell( {
															sectionName,
															rowIndex,
															columnIndex,
															rowSpan,
															colSpan,
															tag,
															styles,
														} );
													} }
													aria-label={ CELL_ARIA_LABEL[ sectionName ] }
												/>
												{ isSelected && isFirstColumn && options.show_control_button && (
													<>
														{ sectionIndex === 0 && rowIndex === 0 && (
															<ButtonColumnAfterInserter
																label={ __( 'Insert column after', 'flexible-table-block' ) }
																tabIndex={ options.prevent_focus_control_button && -1 }
																icon={ plus }
																iconSize="18"
																onClick={ () => {
																	onInsertColumn( { sectionName, columnIndex, offset: 1 } );
																} }
															/>
														) }
													</>
												) }
											</Cell>
										);
									} ) }
								</tr>
							) ) }
						</TSection>
					);
				} ) }
			</table>
		</>
	);
}
