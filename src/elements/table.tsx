/**
 * External dependencies
 */
import clsx from 'clsx';
import type { Properties } from 'csstype';
import type { Dispatch, SetStateAction, MouseEvent, KeyboardEvent } from 'react';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useState, useEffect, useRef } from '@wordpress/element';
import {
	RichText,
	// @ts-ignore: has no exported member
	__experimentalUseColorProps as useColorProps,
} from '@wordpress/block-editor';
import { Button } from '@wordpress/components';
import { plus, trash, chevronRight, chevronDown } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useDispatch } from '@wordpress/data';

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
	type VTable,
	type VCell,
	type VRow,
	type VSelectedLine,
	type VSelectedCells,
} from '../utils/table-state';
import { convertToObject } from '../utils/style-converter';

import type { SectionName, CellTagValue, BlockAttributes } from '../BlockAttributes';
import type { StoreOptions } from '../store';

function TSection( props: any ) {
	const { name, ...restProps } = props;
	const TagName = `t${ name }`;
	return <TagName { ...restProps } />;
}

function Cell( props: any ) {
	const { name, ...restProps } = props;
	const TagName: CellTagValue = name;
	return <TagName { ...restProps } />;
}

type Props = {
	attributes: BlockAttributes;
	setAttributes: ( attrs: Partial< BlockAttributes > ) => void;
	isSelected: boolean;
	options: StoreOptions;
	vTable: VTable;
	tableStylesObj: Properties;
	selectedCells: VSelectedCells;
	setSelectedCells: Dispatch< SetStateAction< VSelectedCells > >;
	selectedLine: VSelectedLine;
	setSelectedLine: Dispatch< SetStateAction< VSelectedLine > >;
	isContentOnlyMode: boolean;
};

export default function Table( {
	attributes,
	setAttributes,
	isSelected,
	options,
	vTable,
	tableStylesObj,
	selectedCells,
	setSelectedCells,
	selectedLine,
	setSelectedLine,
	isContentOnlyMode,
}: Props ) {
	const { hasFixedLayout, isStackedOnMobile, sticky } = attributes;

	const colorProps = useColorProps( attributes );

	const [ isSelectMode, setIsSelectMode ] = useState< boolean >( false );

	// Manage rendering status as state since some processing may be performed before rendering components.
	const [ isReady, setIdReady ] = useState< boolean >( false );
	useEffect( () => setIdReady( true ), [] );

	const tableRef = useRef( null );
	const { createWarningNotice } = useDispatch( noticesStore );

	let isTabMove: boolean = false;

	const isRowSelected = selectedLine && 'sectionName' in selectedLine && 'rowIndex' in selectedLine;
	const isColumnSelected = selectedLine && 'vColIndex' in selectedLine;

	const onInsertRow = ( sectionName: SectionName, rowIndex: number ) => {
		const newVTable = insertRow( vTable, { sectionName, rowIndex } );
		setAttributes( toTableAttributes( newVTable ) );
		setSelectedCells( undefined );
		setSelectedLine( undefined );
	};

	const onDeleteRow = ( sectionName: SectionName, rowIndex: number ) => {
		// Do not allow tbody to be empty for table with thead /tfoot sections.
		if (
			sectionName === 'body' &&
			vTable.body.length === 1 &&
			( ! isEmptySection( vTable.head ) || ! isEmptySection( vTable.foot ) )
		) {
			createWarningNotice(
				__( 'The table body must have one or more rows.', 'flexible-table-block' ),
				{
					id: 'flexible-table-block-body-row',
					type: 'snackbar',
				}
			);
			return;
		}

		const newVTable = deleteRow( vTable, { sectionName, rowIndex } );
		setAttributes( toTableAttributes( newVTable ) );
		setSelectedCells( undefined );
		setSelectedLine( undefined );
	};

	const onInsertColumn = ( vTargetCell: VCell, offset: number ) => {
		// Calculate column index to be inserted considering colspan of the target cell.
		const vColIndex =
			offset === 0
				? vTargetCell.vColIndex
				: vTargetCell.vColIndex + offset + vTargetCell.colSpan - 1;

		const newVTable = insertColumn( vTable, { vColIndex } );
		setAttributes( toTableAttributes( newVTable ) );
		setSelectedCells( undefined );
		setSelectedLine( undefined );
	};

	const onDeleteColumn = ( vColIndex: number ) => {
		const newVTable = deleteColumn( vTable, { vColIndex } );
		setAttributes( toTableAttributes( newVTable ) );
		setSelectedCells( undefined );
		setSelectedLine( undefined );
	};

	const onSelectSectionCells = ( sectionName: SectionName ) => {
		setSelectedCells(
			vTable[ sectionName ].reduce( ( cells: VCell[], row ) => {
				return cells.concat( row.cells.filter( ( cell ) => ! cell.isHidden ) );
			}, [] )
		);
		setSelectedLine( undefined );
	};

	const onSelectRow = ( sectionName: SectionName, rowIndex: number ) => {
		if (
			isRowSelected &&
			selectedLine.sectionName === sectionName &&
			selectedLine.rowIndex === rowIndex
		) {
			setSelectedLine( undefined );
			setSelectedCells( undefined );
		} else {
			setSelectedLine( { sectionName, rowIndex } );
			setSelectedCells(
				vTable[ sectionName ].reduce( ( cells: VCell[], row ) => {
					return cells.concat(
						row.cells.filter( ( cell ) => cell.rowIndex === rowIndex && ! cell.isHidden )
					);
				}, [] )
			);
		}
	};

	const onSelectColumn = ( vColIndex: number ) => {
		if ( isColumnSelected && selectedLine.vColIndex && selectedLine.vColIndex === vColIndex ) {
			setSelectedLine( undefined );
			setSelectedCells( undefined );
		} else {
			const vRows = toVirtualRows( vTable );

			setSelectedCells(
				vRows.reduce(
					( cells: VCell[], row ) =>
						cells.concat(
							row.cells.filter( ( cell ) => cell.vColIndex === vColIndex && ! cell.isHidden )
						),
					[]
				)
			);

			setSelectedLine( { vColIndex } );
		}
	};

	const onChangeCellContent = ( content: string, targetCell: VCell ) => {
		// If inline highlight is applied to the RichText, this process is performed before rendering the component, causing a warning error.
		// Therefore, nothing is performed if the component has not yet been rendered.
		if ( ! isReady ) {
			return;
		}

		const { sectionName, rowIndex: selectedRowIndex, vColIndex: selectedVColIndex } = targetCell;
		setSelectedCells( [ { ...targetCell, isFirstSelected: true } ] );

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

	// Monitor pressed key to determine whether multi-select mode or range-select mode.
	// Also the next cell will be focused if tab key navigation is enabled.
	const onKeyDown = ( event: KeyboardEvent ) => {
		const { key } = event;

		if ( key === 'Shift' || key === 'Control' || key === 'Meta' ) {
			// range-select mode or multi-select mode.
			setIsSelectMode( true );
		} else if ( key === 'Tab' && options.tab_move && tableRef.current ) {
			const isInsideTableBlock =
				( event.target as HTMLElement ).closest( '.wp-block-flexible-table-block-table' ) !== null;

			if ( ! isInsideTableBlock ) {
				return;
			}
			// Focus on the next cell.
			isTabMove = true;

			const tableElement: HTMLElement = tableRef.current;
			const { ownerDocument } = tableElement;
			const { activeElement } = ownerDocument;

			const activeCell = tableElement.querySelector(
				'th.is-selected > [contenteditable="true"], td.is-selected > [contenteditable="true"]'
			);
			const isInsidePopover =
				activeElement && activeElement.closest( '.components-popover' ) !== null;
			const hasLinkControl = !! ownerDocument.querySelector( '.block-editor-link-control' );

			if ( ! activeCell || isInsidePopover || hasLinkControl ) {
				return;
			}

			const tabbableNodes = tableElement.querySelectorAll(
				'th > [contenteditable="true"], td > [contenteditable="true"]'
			);

			const tabbableElements = [].slice.call( tabbableNodes );
			const activeCellIndex = tabbableElements.findIndex(
				( element: Node ) => element === activeCell
			);

			if ( activeCellIndex === -1 ) {
				return;
			}

			let nextCellIndex = event.shiftKey ? activeCellIndex - 1 : activeCellIndex + 1;

			if ( nextCellIndex < 0 ) {
				nextCellIndex = tabbableElements.length - 1;
			} else if ( nextCellIndex >= tabbableElements.length ) {
				nextCellIndex = 0;
			}

			const focusbleElement: HTMLElement = tabbableElements[ nextCellIndex ];

			if ( ! focusbleElement ) {
				return;
			}

			event.preventDefault();
			setIsSelectMode( false );
			focusbleElement.focus();

			// Select all text if the next cell is not empty.
			const selection = ownerDocument.getSelection();
			const range = ownerDocument.createRange();

			if ( selection && focusbleElement.innerText.trim().length ) {
				range.selectNodeContents( focusbleElement );
				selection.removeAllRanges();
				selection.addRange( range );
			}
		}
	};

	const onKeyUp = ( event: KeyboardEvent ) => {
		const { key } = event;

		if ( key === 'Shift' || key === 'Control' || key === 'Meta' ) {
			const isInsideTableBlock =
				( event.target as HTMLElement ).closest( '.wp-block-flexible-table-block-table' ) !== null;

			if ( ! isInsideTableBlock ) {
				return;
			}

			setIsSelectMode( false );
		}
	};

	const onClickCell = ( event: MouseEvent, clickedCell: VCell ) => {
		const { shiftKey, ctrlKey, metaKey } = event;
		const isInsideTableBlock =
			( event.target as HTMLElement ).closest( '.wp-block-flexible-table-block-table' ) !== null;

		if ( ! isInsideTableBlock ) {
			return;
		}

		const { sectionName, rowIndex, vColIndex } = clickedCell;

		if ( shiftKey ) {
			// Range select.
			if ( ! selectedCells ) {
				setSelectedCells( [ { ...clickedCell, isFirstSelected: true } ] );
			} else {
				const fromCell = selectedCells.find( ( { isFirstSelected } ) => isFirstSelected );

				if ( ! fromCell ) {
					return;
				}

				if ( fromCell.sectionName !== sectionName ) {
					createWarningNotice(
						__( 'Cannot select range cells from difference sections.', 'flexible-table-block' ),
						{
							id: 'flexible-table-block-range-sections',
							type: 'snackbar',
						}
					);
					return;
				}
				setSelectedCells( toRectangledSelectedCells( vTable, { fromCell, toCell: clickedCell } ) );
			}
		} else if ( ctrlKey || metaKey ) {
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
				createWarningNotice(
					__( 'Cannot select multi cells from difference sections.', 'flexible-table-block' ),
					{
						id: 'flexible-table-block-multi-sections',
						type: 'snackbar',
					}
				);
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
	const filteredVTable = Object.keys( vTable ).reduce( ( result: any, sectionName ) => {
		if ( isEmptySection( vTable[ sectionName as SectionName ] ) ) {
			return result;
		}
		return {
			...result,
			[ sectionName ]: vTable[ sectionName as SectionName ].map( ( row ) => ( {
				cells: row.cells.filter( ( cell ) => ! cell.isHidden ),
			} ) ),
		};
	}, {} );

	if ( ! filteredVTable ) {
		return null;
	}

	const filteredSections = Object.keys( filteredVTable ) as SectionName[];

	return (
		// eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
		<table
			className={ clsx( colorProps.className, {
				'has-fixed-layout': hasFixedLayout,
				'is-stacked-on-mobile': isStackedOnMobile,
				[ `is-sticky-${ sticky }` ]: sticky,
			} ) }
			style={ { ...tableStylesObj, ...colorProps.style } }
			ref={ tableRef }
			onKeyDown={ onKeyDown }
			onKeyUp={ onKeyUp }
		>
			{ filteredSections.map( ( sectionName: SectionName, sectionIndex ) => (
				<TSection name={ sectionName } key={ sectionIndex }>
					{ filteredVTable[ sectionName ].map( ( row: VRow, rowIndex: number ) => (
						<tr key={ rowIndex }>
							{ row.cells.map( ( cell: VCell ) => {
								const {
									content,
									tag,
									className,
									id,
									headers,
									scope,
									styles,
									rowSpan,
									colSpan,
									vColIndex,
								} = cell;

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
										className={ clsx( className, { 'is-selected': isCellSelected } ) }
										rowSpan={ rowSpan > 1 ? rowSpan : undefined }
										colSpan={ colSpan > 1 ? colSpan : undefined }
										style={ cellStylesObj }
										id={ id }
										headers={ headers }
										scope={ scope }
										onClick={ ( event: MouseEvent ) => onClickCell( event, cell ) }
									>
										{ isSelected &&
											! isContentOnlyMode &&
											options.show_label_on_section &&
											rowIndex === 0 &&
											vColIndex === 0 && (
												<Button
													className="ftb-table-cell-label"
													tabIndex={ options.focus_control_button ? 0 : -1 }
													variant="primary"
													onClick={ ( event: MouseEvent ) => {
														onSelectSectionCells( sectionName );
														event.stopPropagation();
													} }
												>
													{ `t${ sectionName }` }
												</Button>
											) }
										{ isSelected && ! isContentOnlyMode && options.show_control_button && (
											<>
												{ rowIndex === 0 && vColIndex === 0 && (
													<Button
														className={ clsx( 'ftb-row-before-inserter', {
															'ftb-row-before-inserter--has-prev-section': sectionIndex > 0,
														} ) }
														label={ __( 'Insert row before', 'flexible-table-block' ) }
														tabIndex={ options.focus_control_button ? 0 : -1 }
														icon={ plus }
														iconSize="18"
														onClick={ ( event: MouseEvent ) => {
															onInsertRow( sectionName, rowIndex );
															event.stopPropagation();
														} }
													/>
												) }
												{ vColIndex === 0 && (
													<>
														<Button
															className="ftb-row-selector"
															label={ __( 'Select row', 'flexible-table-block' ) }
															tabIndex={ options.focus_control_button ? 0 : -1 }
															icon={ chevronRight }
															iconSize="16"
															variant={
																isRowSelected &&
																selectedLine.sectionName === sectionName &&
																selectedLine.rowIndex === rowIndex
																	? 'primary'
																	: undefined
															}
															onClick={ ( event: MouseEvent ) => {
																onSelectRow( sectionName, rowIndex );
																event.stopPropagation();
															} }
														/>
														{ isRowSelected &&
															selectedLine.sectionName === sectionName &&
															selectedLine.rowIndex === rowIndex && (
																<Button
																	className="ftb-row-deleter"
																	label={ __( 'Delete row', 'flexible-table-block' ) }
																	tabIndex={ options.focus_control_button ? 0 : -1 }
																	icon={ trash }
																	iconSize={ 20 }
																	onClick={ ( event: MouseEvent ) => {
																		onDeleteRow( sectionName, rowIndex );
																		event.stopPropagation();
																	} }
																/>
															) }
													</>
												) }
												{ sectionIndex === 0 && rowIndex === 0 && vColIndex === 0 && (
													<Button
														className={ 'ftb-column-before-inserter' }
														label={ __( 'Insert column before', 'flexible-table-block' ) }
														tabIndex={ options.focus_control_button ? 0 : -1 }
														icon={ plus }
														iconSize="18"
														onClick={ ( event: MouseEvent ) => {
															onInsertColumn( cell, 0 );
															event.stopPropagation();
														} }
													/>
												) }
												{ sectionIndex === 0 && rowIndex === 0 && (
													<>
														<Button
															className="ftb-column-selector"
															label={ __( 'Select column', 'flexible-table-block' ) }
															tabIndex={ options.focus_control_button ? 0 : -1 }
															icon={ chevronDown }
															iconSize="18"
															variant={
																isColumnSelected && selectedLine.vColIndex === vColIndex
																	? 'primary'
																	: undefined
															}
															onClick={ ( event: MouseEvent ) => {
																onSelectColumn( vColIndex );
																event.stopPropagation();
															} }
														/>
														{ isColumnSelected && selectedLine.vColIndex === vColIndex && (
															<Button
																className="ftb-column-deleter"
																label={ __( 'Delete column', 'flexible-table-block' ) }
																tabIndex={ options.focus_control_button ? 0 : -1 }
																icon={ trash }
																iconSize={ 20 }
																onClick={ ( event: MouseEvent ) => {
																	onDeleteColumn( vColIndex );
																	event.stopPropagation();
																} }
															/>
														) }
													</>
												) }
												{ vColIndex === 0 && (
													<Button
														className={ clsx( 'ftb-row-after-inserter', {
															'ftb-row-after-inserter--has-next-section':
																sectionIndex < Object.keys( filteredVTable ).length - 1 &&
																rowIndex + rowSpan - 1 === filteredVTable[ sectionName ].length - 1,
														} ) }
														label={ __( 'Insert row after', 'flexible-table-block' ) }
														tabIndex={ options.focus_control_button ? 0 : -1 }
														icon={ plus }
														iconSize="18"
														onClick={ ( event: MouseEvent ) => {
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
											onChange={ ( value ) => onChangeCellContent( value, cell ) }
											{ ...( ( ! isSelectMode || isTabMove ) && {
												onFocus: () => {
													isTabMove = false;
													setSelectedLine( undefined );
													setSelectedCells( [ { ...cell, isFirstSelected: true } ] );
												},
											} ) }
											aria-label={ CELL_ARIA_LABEL[ sectionName as SectionName ] }
										/>
										{ isSelected &&
											! isContentOnlyMode &&
											options.show_control_button &&
											sectionIndex === 0 &&
											rowIndex === 0 && (
												<Button
													className={ 'ftb-column-after-inserter' }
													label={ __( 'Insert column after', 'flexible-table-block' ) }
													tabIndex={ options.focus_control_button ? 0 : -1 }
													icon={ plus }
													iconSize="18"
													onClick={ ( event: MouseEvent ) => {
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
