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
import { plus, trash, chevronRight, chevronDown } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { CELL_ARIA_LABEL } from '../constants';
import {
	insertRow,
	deleteRow,
	insertColumn,
	deleteColumn,
	toRectangledSelectedCells,
	toVirtualRows,
	toTableAttributes,
	isEmptySection,
} from '../utils/table-state';
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
		selectedCells,
		setSelectedCells,
		selectedLine,
		setSelectedLine,
	} = props;

	const { hasFixedLayout, isStackedOnMobile, sticky } = attributes;

	const colorProps = useColorProps( attributes );

	const onInsertRow = ( sectionName, rowIndex ) => {
		const newVTable = insertRow( vTable, { sectionName, rowIndex } );
		setAttributes( toTableAttributes( newVTable ) );
		setSelectedCells();
		setSelectedLine();
	};

	const onDeleteRow = ( sectionName, rowIndex ) => {
		// Do not allow tbody to be empty for table with thead /tfoot sections.
		if (
			sectionName === 'body' &&
			vTable.body.length === 1 &&
			( ! isEmptySection( vTable.head ) || ! isEmptySection( vTable.foot ) )
		) {
			// eslint-disable-next-line no-alert, no-undef
			alert( __( 'The table body must have one or more rows.', 'flexible-table-block' ) );
			return;
		}

		const newVTable = deleteRow( vTable, { sectionName, rowIndex } );
		setAttributes( toTableAttributes( newVTable ) );
		setSelectedCells();
		setSelectedLine();
	};

	const onInsertColumn = ( vTargetCell, offset ) => {
		// Calculate column index to be inserted considering colspan of the target cell.
		const vColIndex =
			offset === 0
				? vTargetCell.vColIndex
				: vTargetCell.vColIndex + offset + vTargetCell.colSpan - 1;

		const newVTable = insertColumn( vTable, { vColIndex } );
		setAttributes( toTableAttributes( newVTable ) );
		setSelectedCells();
		setSelectedLine();
	};

	const onDeleteColumn = ( vColIndex ) => {
		const newVTable = deleteColumn( vTable, { vColIndex } );
		setAttributes( toTableAttributes( newVTable ) );
		setSelectedCells();
		setSelectedLine();
	};

	const onSelectSectionCells = ( sectionName ) => {
		setSelectedCells(
			vTable[ sectionName ].reduce( ( cells, row ) => {
				return cells.concat( row.cells.filter( ( cell ) => ! cell.isHidden ) );
			}, [] )
		);
		setSelectedLine();
	};

	const onSelectRow = ( sectionName, rowIndex ) => {
		if ( selectedLine?.sectionName === sectionName && selectedLine?.rowIndex === rowIndex ) {
			setSelectedLine();
			setSelectedCells();
		} else {
			setSelectedLine( { sectionName, rowIndex } );
			setSelectedCells(
				vTable[ sectionName ].reduce( ( cells, row ) => {
					return cells.concat(
						row.cells.filter( ( cell ) => cell.rowIndex === rowIndex && ! cell.isHidden )
					);
				}, [] )
			);
		}
	};

	const onSelectColumn = ( vColIndex ) => {
		if ( selectedLine?.vColIndex === vColIndex ) {
			setSelectedLine();
			setSelectedCells();
		} else {
			const vRows = toVirtualRows( vTable );

			setSelectedCells(
				vRows.reduce(
					( cells, row ) =>
						cells.concat(
							row.cells.filter( ( cell ) => cell.vColIndex === vColIndex && ! cell.isHidden )
						),
					[]
				)
			);

			setSelectedLine( { vColIndex } );
		}
	};

	const onChangeCellContent = ( content ) => {
		if ( ( selectedCells || [] ).length !== 1 ) return;

		const {
			sectionName,
			rowIndex: selectedRowIndex,
			vColIndex: selectedVColIndex,
		} = selectedCells[ 0 ];

		const newVTable = {
			...vTable,
			[ sectionName ]: vTable[ sectionName ].map( ( row, rowIndex ) => {
				if ( rowIndex !== selectedRowIndex ) {
					return { cells: row.cells.filter( ( cell ) => ! cell.isHidden ) };
				}

				return {
					cells: row.cells.map( ( cell, vColIndex ) => {
						if ( rowIndex !== selectedRowIndex || vColIndex !== selectedVColIndex ) {
							return cell;
						}
						return {
							...cell,
							content,
						};
					} ),
				};
			} ),
		};

		setAttributes( toTableAttributes( newVTable ) );
	};

	const onClickCell = ( event, clickedCell ) => {
		const { sectionName, rowIndex, vColIndex } = clickedCell;

		if ( event.shiftKey ) {
			// Range select.
			const fromCell = selectedCells.find( ( { isFirstSelected } ) => isFirstSelected );

			if ( ! fromCell ) return;

			if ( fromCell.sectionName !== sectionName ) {
				// eslint-disable-next-line no-alert, no-undef
				alert( __( 'Cannot select range cells from difference section.', 'flexible-table-block' ) );
				return;
			}

			setSelectedCells( toRectangledSelectedCells( vTable, { fromCell, toCell: clickedCell } ) );
		} else if ( event.ctrlKey || event.metaKey ) {
			// Multple select.
			const newSelectedCells = selectedCells ? [ ...selectedCells ] : [];
			const existCellIndex = newSelectedCells.findIndex( ( cell ) => {
				return (
					cell.sectionName === sectionName &&
					cell.rowIndex === rowIndex &&
					cell.vColIndex === vColIndex
				);
			} );

			if ( newSelectedCells.length && sectionName !== newSelectedCells[ 0 ].sectionName ) {
				// eslint-disable-next-line no-alert, no-undef
				alert( __( 'Cannot select multi cells from difference section.', 'flexible-table-block' ) );
				return;
			}

			if ( existCellIndex === -1 ) {
				newSelectedCells.push( clickedCell );
			} else {
				newSelectedCells.splice( existCellIndex, 1 );
			}

			setSelectedCells( newSelectedCells );
		} else {
			// Select cell for the first time.
			setSelectedCells( [ { ...clickedCell, isFirstSelected: true } ] );
		}
	};

	// Remove cells from the virtual table that are not needed for dom rendering.
	const filteredVTable = Object.keys( vTable ).reduce( ( result, sectionName ) => {
		if ( isEmptySection( vTable[ sectionName ] ) ) return result;
		return {
			...result,
			[ sectionName ]: vTable[ sectionName ].map( ( row ) => ( {
				cells: row.cells.filter( ( cell ) => ! cell.isHidden ),
			} ) ),
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
							{ row.cells.map( ( cell ) => {
								const { content, tag, className, styles, rowSpan, colSpan, vColIndex } = cell;

								// Whether or not the current cell is included in the selected cells.
								const isCellSelected = ( selectedCells || [] ).some(
									( targetCell ) =>
										targetCell.sectionName === sectionName &&
										targetCell.rowIndex === rowIndex &&
										targetCell.vColIndex === vColIndex
								);

								const cellStylesObj = convertToObject( styles );

								return (
									<Cell
										key={ vColIndex }
										name={ tag }
										className={ classnames( className, { 'is-selected': isCellSelected } ) }
										rowSpan={ rowSpan > 1 ? rowSpan : undefined }
										colSpan={ colSpan > 1 ? colSpan : undefined }
										style={ cellStylesObj }
										onClick={ ( event ) => onClickCell( event, cell ) }
									>
										{ isSelected &&
											options.show_label_on_section &&
											rowIndex === 0 &&
											vColIndex === 0 && (
												<Button
													className="ftb-table-cell-label"
													tabIndex={ options.focus_control_button ? 0 : -1 }
													isPrimary
													variant="primary"
													onClick={ ( event ) => {
														onSelectSectionCells( sectionName );
														event.stopPropagation();
													} }
												>
													{ `t${ sectionName }` }
												</Button>
											) }
										{ isSelected && options.show_control_button && (
											<>
												{ rowIndex === 0 && vColIndex === 0 && (
													<ButtonRowBeforeInserter
														label={ __( 'Insert row before', 'flexible-table-block' ) }
														tabIndex={ options.focus_control_button ? 0 : -1 }
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
															tabIndex={ options.focus_control_button ? 0 : -1 }
															icon={ chevronRight }
															iconSize="16"
															isPrimary={
																selectedLine?.sectionName === sectionName &&
																selectedLine?.rowIndex === rowIndex
															}
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
																	tabIndex={ options.focus_control_button ? 0 : -1 }
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
														tabIndex={ options.focus_control_button ? 0 : -1 }
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
															tabIndex={ options.focus_control_button ? 0 : -1 }
															icon={ chevronDown }
															iconSize="18"
															isPrimary={ selectedLine?.vColIndex === vColIndex }
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
																tabIndex={ options.focus_control_button ? 0 : -1 }
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
														tabIndex={ options.focus_control_button ? 0 : -1 }
														icon={ plus }
														iconSize="18"
														hasNextSection={
															sectionIndex < filteredSections.length - 1 &&
															rowIndex + rowSpan - 1 === filteredVTable[ sectionName ].length - 1
														}
														onClick={ ( event ) => {
															onInsertRow( sectionName, rowIndex + rowSpan );
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
													setSelectedLine();
													setSelectedCells( [ { ...cell, isFirstSelected: true } ] );
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
													tabIndex={ options.focus_control_button ? 0 : -1 }
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
