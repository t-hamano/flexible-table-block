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
	// @ts-expect-error Not exported in the type definitions.
	__experimentalUseColorProps as useColorProps,
} from '@wordpress/block-editor';
import { store as noticesStore } from '@wordpress/notices';
import { useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
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
import TableCell, { type CellHandlers, type CellPosition } from './table-cell';

import type { SectionName, BlockAttributes } from '../BlockAttributes';
import type { StoreOptions } from '../store';

function TSection( props: any ) {
	const { name, ...restProps } = props;
	const TagName = `t${ name }`;
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

	const [ isSelectMode, setIsSelectMode ] = useState( false );

	// Manage rendering status as state since some processing may be performed before rendering components.
	const [ isReady, setIsReady ] = useState( false );
	useEffect( () => setIsReady( true ), [] );

	const tableRef = useRef( null );
	const { createWarningNotice } = useDispatch( noticesStore );

	// Use a ref so the flag survives re-renders and the focus handler reads the latest value.
	const isTabMoveRef = useRef( false );

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
			vTable[ sectionName ].flatMap( ( row ) => row.cells.filter( ( cell ) => ! cell.isHidden ) )
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
				vTable[ sectionName ].flatMap( ( row ) =>
					row.cells.filter( ( cell ) => cell.rowIndex === rowIndex && ! cell.isHidden )
				)
			);
		}
	};

	const onSelectColumn = ( vColIndex: number ) => {
		if ( isColumnSelected && selectedLine.vColIndex === vColIndex ) {
			setSelectedLine( undefined );
			setSelectedCells( undefined );
		} else {
			const vRows = toVirtualRows( vTable );

			setSelectedCells(
				vRows.flatMap( ( row ) =>
					row.cells.filter( ( cell ) => cell.vColIndex === vColIndex && ! cell.isHidden )
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
			const tableElement: HTMLTableElement = tableRef.current;
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
			isTabMoveRef.current = true;
			// The block editor moves focus out of the canvas iframe on Tab before this
			// handler runs. Focus the canvas window first, because Firefox does not move
			// window focus when focusing an element in another document.
			ownerDocument.defaultView?.focus();
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

	const onFocusCell = ( cell: VCell ) => {
		if ( isSelectMode && ! isTabMoveRef.current ) {
			return;
		}
		isTabMoveRef.current = false;
		setSelectedLine( undefined );
		setSelectedCells( [ { ...cell, isFirstSelected: true } ] );
	};

	// Find the cell on the virtual table from its position.
	const getCell = ( { sectionName, rowIndex, vColIndex }: CellPosition ): VCell =>
		vTable[ sectionName ][ rowIndex ].cells[ vColIndex ];

	const handlers: CellHandlers = {
		onClickCell: ( event, position ) => onClickCell( event, getCell( position ) ),
		onFocusCell: ( position ) => onFocusCell( getCell( position ) ),
		onChangeCellContent: ( content, position ) =>
			onChangeCellContent( content, getCell( position ) ),
		onSelectSectionCells,
		onInsertRow,
		onDeleteRow,
		onSelectRow,
		onInsertColumn: ( position, offset ) => onInsertColumn( getCell( position ), offset ),
		onDeleteColumn,
		onSelectColumn,
	};

	const showSectionLabel = !! (
		isSelected &&
		! isContentOnlyMode &&
		options.show_label_on_section
	);
	const showControlButtons = !! (
		isSelected &&
		! isContentOnlyMode &&
		options.show_control_button
	);
	const controlTabIndex = options.focus_control_button ? 0 : -1;

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

								return (
									<TableCell
										key={ vColIndex }
										content={ content }
										tag={ tag }
										className={ className }
										id={ id }
										headers={ headers }
										scope={ scope }
										styles={ styles }
										rowSpan={ rowSpan }
										colSpan={ colSpan }
										sectionName={ sectionName }
										rowIndex={ rowIndex }
										vColIndex={ vColIndex }
										sectionIndex={ sectionIndex }
										// Whether or not the current cell is included in the selected cells.
										isCellSelected={ ( selectedCells || [] ).some(
											( targetCell ) =>
												targetCell.sectionName === sectionName &&
												targetCell.rowIndex === rowIndex &&
												targetCell.vColIndex === vColIndex
										) }
										// Whether or not the row the current cell belongs to is selected.
										isCurrentRowSelected={
											!! (
												isRowSelected &&
												selectedLine.sectionName === sectionName &&
												selectedLine.rowIndex === rowIndex
											)
										}
										// Whether or not the column the current cell belongs to is selected.
										isCurrentColumnSelected={
											!! ( isColumnSelected && selectedLine.vColIndex === vColIndex )
										}
										hasNextSection={
											sectionIndex < filteredSections.length - 1 &&
											rowIndex + rowSpan - 1 === filteredVTable[ sectionName ].length - 1
										}
										showSectionLabel={ showSectionLabel }
										showControlButtons={ showControlButtons }
										controlTabIndex={ controlTabIndex }
										handlers={ handlers }
									/>
								);
							} ) }
						</tr>
					) ) }
				</TSection>
			) ) }
		</table>
	);
}
