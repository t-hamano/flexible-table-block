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
import { isMultiSelected, isRangeSelected } from '../utils/helper';
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
		options,
		vTable,
		attributes,
		setAttributes,
		tableStylesObj,
		isSelected,
		selectedLine,
		setSelectedLine,
		vSelectedCells,
		setVSelectedCells,
	} = props;

	const { hasFixedLayout, isStackedOnMobile, sticky } = attributes;

	const colorProps = useColorProps( attributes );

	const onInsertRow = ( sectionName, rowIndex ) => {
		setAttributes(
			insertRow( attributes, {
				sectionName,
				rowIndex,
			} )
		);
		setVSelectedCells( [] );
	};

	const onDeleteRow = ( sectionName, rowIndex ) => {
		setAttributes( deleteRow( vTable, { sectionName, rowIndex } ) );
		setVSelectedCells( [] );
	};

	const onInsertColumn = ( vTargetCell, offset ) => {
		// Calculate column index to be inserted considering colspan of the target cell.
		const insertVColIndex =
			offset === 0
				? vTargetCell.vColIndex
				: vTargetCell.vColIndex +
				  offset +
				  ( vTargetCell.colSpan ? parseInt( vTargetCell.colSpan ) - 1 : 0 );

		setAttributes( insertColumn( vTable, { vColIndex: insertVColIndex } ) );
		setVSelectedCells( [] );
	};

	const onDeleteColumn = ( vColIndex ) => {
		setAttributes( deleteColumn( vTable, { vColIndex } ) );
		setVSelectedCells( [] );
	};

	const onSelectSectionCells = ( sectionName ) => {
		setVSelectedCells(
			vTable[ sectionName ].reduce( ( cells, row ) => {
				return cells.concat( row.map( ( cell ) => cell ) );
			}, [] )
		);
	};

	const onChangeCellContent = ( content ) => {
		if ( ! vSelectedCells.length === 1 ) return;

		const {
			sectionName,
			rowIndex: selectedRowIndex,
			vColIndex: selectedVColIndex,
		} = vSelectedCells[ 0 ];

		setAttributes( {
			[ sectionName ]: vTable[ sectionName ].map( ( row, rowIndex ) => {
				if ( rowIndex !== selectedRowIndex ) {
					return { cells: row };
				}

				return {
					cells: row.map( ( cell, vColIndex ) => {
						if ( vColIndex !== selectedVColIndex ) {
							return cell;
						}

						return {
							...cell,
							content,
						};
					} ),
				};
			} ),
		} );
	};

	const onClickCell = ( event, cell ) => {
		const { sectionName, rowIndex, vColIndex } = cell;

		// TODO バーチャルセクション上のどのセルをクリックしたかを取得する処理

		if ( event.shiftKey ) {
			// TODO: Range select.
		} else if ( event.ctrlKey || event.metaKey ) {
			// Multple select.

			// const newSelectedMultiCell = selectedMultiCell ? [ ...selectedMultiCell ] : [];
			// const existCellIndex = newSelectedMultiCell.findIndex( ( cell ) => {
			// 	return (
			// 		cell.sectionName === sectionName &&
			// 		cell.rowIndex === rowIndex &&
			// 		cell.colIndex === colIndex
			// 	);
			// } );

			// if ( newSelectedMultiCell.length && sectionName !== newSelectedMultiCell[ 0 ].sectionName ) {
			// 	// eslint-disable-next-line no-alert, no-undef
			// 	alert( __( 'Cannot select multi cells from difference section.', 'flexible-table-block' ) );
			// 	return;
			// }

			// if ( existCellIndex === -1 ) {
			// 	newSelectedMultiCell.push( clickedCell );
			// } else {
			// 	newSelectedMultiCell.splice( existCellIndex, 1 );
			// }

			setVSelectedCells( [ ...vSelectedCells, cell ] );

			// setSelectedMultiCell( newSelectedMultiCell );
			// setSelectedRangeCell();
		} else {
			// Select cell for the first time.
			setVSelectedCells( [ cell ] );
		}

		event.preventDefault();
		event.stopPropagation();
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
			{ [ 'head', 'body', 'foot' ].map( ( sectionName, sectionIndex ) => {
				if ( ! vTable[ sectionName ].length ) return null;

				return (
					<TSection name={ sectionName } key={ sectionName }>
						{ vTable[ sectionName ].map( ( row, rowIndex ) => {
							return (
								<tr key={ rowIndex }>
									{ row.map( ( cell ) => {
										const { content, tag, styles, rowSpan, colSpan, vColIndex } = cell;

										// // Whether or not the current cell is included in the selection.
										const isCellSelected = !! vSelectedCells.find( ( vSelectedCell ) => {
											return (
												vSelectedCell.sectionName === sectionName &&
												vSelectedCell.rowIndex === rowIndex &&
												vSelectedCell.vColIndex === vColIndex
											);
										} );

										const cellClass = classnames( { 'is-selected': isCellSelected } );

										const cellStylesObj = convertToObject( styles );

										return (
											<Cell
												key={ vColIndex }
												name={ tag }
												className={ cellClass }
												rowSpan={ rowSpan }
												colSpan={ colSpan }
												style={ cellStylesObj }
												onClick={ ( event ) => {
													// onClickCell( event, cell );
												} }
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
															<ButtonColumnSelector
																label={ __( 'Select column', 'flexible-table-block' ) }
																tabIndex={ ! options.focus_control_button && -1 }
																icon={ moreHorizontal }
																iconSize="18"
																variant={
																	selectedLine?.colIndex === vColIndex ? 'primary' : undefined
																}
																onClick={ () => {
																	setSelectedLine( {
																		sectionName,
																		vColIndex,
																	} );
																} }
															>
																{ selectedLine?.colIndex === vColIndex && (
																	<Popover
																		focusOnMount="container"
																		position="top center"
																		onClose={ () => setSelectedLine() }
																	>
																		<ButtonDeleter
																			label={ __( 'Delete column', 'flexible-table-block' ) }
																			tabIndex={ ! options.focus_control_button && -1 }
																			icon={ trash }
																			iconSize={ 20 }
																			onClick={ ( event ) => {
																				onDeleteColumn( sectionName, vColIndex );
																				event.stopPropagation();
																			} }
																		/>
																	</Popover>
																) }
															</ButtonColumnSelector>
														) }
														{ vColIndex === 0 && (
															<ButtonRowAfterInserter
																label={ __( 'Insert row after', 'flexible-table-block' ) }
																tabIndex={ ! options.focus_control_button && -1 }
																icon={ plus }
																iconSize="18"
																hasNextSection={
																	sectionIndex < vTable[ sectionName ].length - 1 &&
																	rowIndex === row.length - 1
																}
																onClick={ ( event ) => {
																	onInsertRow( sectionName, rowIndex + 1 );
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
													unstableOnFocus={ () => setVSelectedCells( [ cell ] ) }
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
							);
						} ) }
					</TSection>
				);
			} ) }
		</table>
	);
}
