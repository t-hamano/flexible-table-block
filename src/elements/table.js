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
import { isMultiSelected, isRangeSelected, toVirtualSection } from '../utils/helper';
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
	};

	const onSelectSectionCells = ( sectionName ) => {
		const selectedSectionCells = attributes[ sectionName ].reduce( ( cells, row, rowIndex ) => {
			return cells.concat(
				row.cells.map( ( cell, colIndex ) => {
					return {
						sectionName,
						rowIndex,
						colIndex,
					};
				} )
			);
		}, [] );

		setSelectedMultiCell( selectedSectionCells );
	};

	const onChangeCellContent = ( content ) => {
		const {
			sectionName: selectedSectionName,
			rowIndex: selectedRowIndex,
			colIndex: selectedColIndex,
		} = selectedCell;

		if ( ! attributes[ selectedSectionName ] ) return;

		const newSection = attributes[ selectedSectionName ].map( ( row, rowIndex ) => {
			if ( rowIndex !== selectedRowIndex ) {
				return row;
			}

			return {
				cells: row.cells.map( ( cell, colIndex ) => {
					if ( colIndex !== selectedColIndex ) {
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

	const onClickCell = ( event, clickedCell ) => {
		const { sectionName, rowIndex, colIndex } = clickedCell;

		// TODO バーチャルセクション上のどのセルをクリックしたかを取得する処理

		if ( event.shiftKey ) {
			// Range select.
			if ( ! selectedRangeCell?.fromCell ) return;
			const { fromCell } = selectedRangeCell;
			if ( sectionName !== fromCell.sectionName ) {
				// eslint-disable-next-line no-alert, no-undef
				alert( __( 'Cannot select multi cells from difference section.', 'flexible-table-block' ) );
				return;
			}
			setSelectedRangeCell( { fromCell, toCell: clickedCell } );
			setSelectedMultiCell();
		} else if ( event.ctrlKey || event.metaKey ) {
			// Multple select.
			const newSelectedMultiCell = selectedMultiCell ? [ ...selectedMultiCell ] : [];
			const existCellIndex = newSelectedMultiCell.findIndex( ( cell ) => {
				return (
					cell.sectionName === sectionName &&
					cell.rowIndex === rowIndex &&
					cell.colIndex === colIndex
				);
			} );

			if ( newSelectedMultiCell.length && sectionName !== newSelectedMultiCell[ 0 ].sectionName ) {
				// eslint-disable-next-line no-alert, no-undef
				alert( __( 'Cannot select multi cells from difference section.', 'flexible-table-block' ) );
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
			// Select cell for the first time.
			setSelectedMultiCell( [ clickedCell ] );
			setSelectedRangeCell( { fromCell: clickedCell } );
		}
	};

	return (
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
								{ cells.map( ( { content, tag, styles, rowSpan, colSpan }, colIndex ) => {
									// Get the corresponding cell on the virtual table.
									const vCell = vTable[ sectionName ][ rowIndex ].find( ( cell ) => {
										return cell.rowIndex === rowIndex && cell.colIndex === colIndex;
									} );

									// Whether or not the current cell is included in the selection.
									let isCellSelected =
										selectedCell &&
										selectedCell.sectionName === sectionName &&
										selectedCell.rowIndex === rowIndex &&
										selectedCell.colIndex === colIndex;

									if ( isRangeSelected( selectedRangeCell ) ) {
										// const { fromCell, toCell } = selectedRangeCell;
										// isCellSelected =
										// 	rowIndex >= Math.min( fromCell.rowIndex, toCell.rowIndex ) &&
										// 	rowIndex <= Math.max( fromCell.rowIndex, toCell.rowIndex ) &&
										// 	colIndex >= Math.min( fromCell.colIndex, toCell.colIndex ) &&
										// 	colIndex <= Math.max( fromCell.colIndex, toCell.colIndex ) &&
										// 	sectionName === fromCell.sectionName;
									} else if ( isMultiSelected( selectedMultiCell ) ) {
										isCellSelected = !! selectedMultiCell.find( ( cell ) => {
											return (
												cell.sectionName === sectionName &&
												cell.rowIndex === rowIndex &&
												cell.colIndex === colIndex
											);
										} );
									}

									// Whether the cell is placed in the first column on the actual table.
									const isFirstCol = colIndex === 0 && vCell.vColIndex === 0;

									const cellClass = classnames( {
										'is-selected': isCellSelected,
									} );

									const cellStylesObj = convertToObject( styles );

									return (
										<Cell
											key={ colIndex }
											name={ tag }
											className={ cellClass }
											rowSpan={ rowSpan }
											colSpan={ colSpan }
											style={ cellStylesObj }
											onClick={ ( event ) => {
												const clickedCell = { sectionName, rowIndex, colIndex };
												onClickCell( event, clickedCell );
											} }
										>
											{ isSelected &&
												options.show_label_on_section &&
												rowIndex === 0 &&
												colIndex === 0 && (
													<Button
														className="ftb-table-cell-label"
														tabIndex={ options.prevent_focus_control_button && -1 }
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
													{ isFirstCol && rowIndex === 0 && colIndex === 0 && (
														<ButtonRowBeforeInserter
															label={ __( 'Insert row before', 'flexible-table-block' ) }
															tabIndex={ options.prevent_focus_control_button && -1 }
															icon={ plus }
															iconSize="18"
															hasPrevSection={ sectionIndex > 0 }
															onClick={ () => onInsertRow( sectionName, rowIndex ) }
														/>
													) }
													{ isFirstCol && colIndex === 0 && (
														<ButtonRowSelector
															label={ __( 'Select row', 'flexible-table-block' ) }
															tabIndex={ options.prevent_focus_control_button && -1 }
															icon={ moreVertical }
															iconSize="18"
															variant={
																selectedLine?.sectionName === sectionName &&
																selectedLine?.rowIndex === rowIndex
																	? 'primary'
																	: undefined
															}
															onClick={ () => {
																setSelectedLine( {
																	sectionName,
																	rowIndex,
																} );
															} }
														>
															{ selectedLine?.sectionName === sectionName &&
																selectedLine?.rowIndex === rowIndex && (
																	<Popover
																		focusOnMount="container"
																		position="top left"
																		onClose={ () => setSelectedLine() }
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
													) }
													{ sectionIndex === 0 && rowIndex === 0 && colIndex === 0 && (
														<ButtonColumnBeforeInserter
															label={ __( 'Insert column before', 'flexible-table-block' ) }
															tabIndex={ options.prevent_focus_control_button && -1 }
															icon={ plus }
															iconSize="18"
															onClick={ () =>
																onInsertColumn( { sectionName, colIndex, offset: 0 } )
															}
														/>
													) }
													{ sectionIndex === 0 && rowIndex === 0 && (
														<ButtonColumnSelector
															label={ __( 'Select column', 'flexible-table-block' ) }
															tabIndex={ options.prevent_focus_control_button && -1 }
															icon={ moreHorizontal }
															iconSize="18"
															variant={
																selectedLine?.colIndex === colIndex ? 'primary' : undefined
															}
															onClick={ () => {
																setSelectedLine( {
																	sectionName,
																	colIndex,
																} );
															} }
														>
															{ selectedLine?.colIndex === colIndex && (
																<Popover
																	focusOnMount="container"
																	position="top center"
																	onClose={ () => setSelectedLine() }
																>
																	<ButtonDeleter
																		label={ __( 'Delete column', 'flexible-table-block' ) }
																		tabIndex={ options.prevent_focus_control_button && -1 }
																		icon={ trash }
																		iconSize={ 20 }
																		onClick={ ( event ) => {
																			onDeleteColumn( colIndex );
																			event.stopPropagation();
																		} }
																	/>
																</Popover>
															) }
														</ButtonColumnSelector>
													) }
													{ colIndex === 0 && (
														<ButtonRowAfterInserter
															label={ __( 'Insert row after', 'flexible-table-block' ) }
															tabIndex={ options.prevent_focus_control_button && -1 }
															icon={ plus }
															iconSize="18"
															hasNextSection={
																sectionIndex < section.length - 1 && rowIndex === row.length - 1
															}
															onClick={ () => onInsertRow( sectionName, rowIndex + 1 ) }
														/>
													) }
												</>
											) }
											<RichText
												key={ colIndex }
												value={ content }
												onChange={ onChangeCellContent }
												unstableOnFocus={ () => {
													setSelectedCell( {
														sectionName,
														rowIndex,
														colIndex,
														rowSpan,
														colSpan,
														tag,
														styles,
													} );
												} }
												aria-label={ CELL_ARIA_LABEL[ sectionName ] }
											/>
											{ isSelected &&
												options.show_control_button &&
												sectionIndex === 0 &&
												rowIndex === 0 && (
													<ButtonColumnAfterInserter
														label={ __( 'Insert column after', 'flexible-table-block' ) }
														tabIndex={ options.prevent_focus_control_button && -1 }
														icon={ plus }
														iconSize="18"
														onClick={ () => onInsertColumn( { sectionName, colIndex, offset: 1 } ) }
													/>
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
	);
}
