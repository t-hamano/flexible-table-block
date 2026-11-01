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
import { memo, useState, useEffect, useLayoutEffect, useMemo, useRef } from '@wordpress/element';
import {
	RichText,
	// @ts-expect-error Not exported in the type definitions.
	__experimentalUseColorProps as useColorProps,
} from '@wordpress/block-editor';
import { Button, IconButton } from '@wordpress/ui';
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
	toCellKey,
	toCellKeySet,
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

type CellHandlers = {
	onClickCell: ( event: MouseEvent, cell: VCell ) => void;
	onFocusCell: ( cell: VCell ) => void;
	onChangeCellContent: ( content: string, cell: VCell ) => void;
	onSelectSectionCells: ( sectionName: SectionName ) => void;
	onInsertRow: ( sectionName: SectionName, rowIndex: number ) => void;
	onDeleteRow: ( sectionName: SectionName, rowIndex: number ) => void;
	onSelectRow: ( sectionName: SectionName, rowIndex: number ) => void;
	onInsertColumn: ( cell: VCell, offset: number ) => void;
	onDeleteColumn: ( vColIndex: number ) => void;
	onSelectColumn: ( vColIndex: number ) => void;
};

type TableCellProps = {
	cell: VCell;
	sectionName: SectionName;
	sectionIndex: number;
	rowIndex: number;
	isCellSelected: boolean;
	isCurrentRowSelected: boolean;
	isCurrentColumnSelected: boolean;
	hasNextSection: boolean;
	showSectionLabel: boolean;
	showControlButtons: boolean;
	controlTabIndex: number;
	handlers: CellHandlers;
};

// Cell properties that affect the rendered cell.
const CELL_RENDER_KEYS = [
	'content',
	'tag',
	'className',
	'id',
	'headers',
	'scope',
	'styles',
	'rowSpan',
	'colSpan',
	'vColIndex',
	'rowIndex',
	'sectionName',
] as const;

/**
 * Determines whether a cell can skip re-rendering.
 * The virtual table creates new cell objects on every change, so compare the cell by its values.
 *
 * @param prevProps Previous props.
 * @param nextProps Next props.
 * @return True if the cell does not need to be re-rendered.
 */
function areTableCellPropsEqual( prevProps: TableCellProps, nextProps: TableCellProps ): boolean {
	const { cell: prevCell, ...prevRest } = prevProps;
	const { cell: nextCell, ...nextRest } = nextProps;

	if ( CELL_RENDER_KEYS.some( ( key ) => prevCell[ key ] !== nextCell[ key ] ) ) {
		return false;
	}

	return ( Object.keys( prevRest ) as Array< keyof typeof prevRest > ).every(
		( key ) => prevRest[ key ] === nextRest[ key ]
	);
}

function TableCell( {
	cell,
	sectionName,
	sectionIndex,
	rowIndex,
	isCellSelected,
	isCurrentRowSelected,
	isCurrentColumnSelected,
	hasNextSection,
	showSectionLabel,
	showControlButtons,
	controlTabIndex,
	handlers,
}: TableCellProps ) {
	const { content, tag, className, id, headers, scope, styles, rowSpan, colSpan, vColIndex } = cell;

	const cellStylesObj = useMemo( () => convertToObject( styles ), [ styles ] );

	return (
		<Cell
			name={ tag }
			className={ clsx( className, { 'is-selected': isCellSelected } ) }
			rowSpan={ rowSpan > 1 ? rowSpan : undefined }
			colSpan={ colSpan > 1 ? colSpan : undefined }
			style={ cellStylesObj }
			id={ id }
			headers={ headers }
			scope={ scope }
			onClick={ ( event: MouseEvent ) => handlers.onClickCell( event, cell ) }
		>
			{ showSectionLabel && rowIndex === 0 && vColIndex === 0 && (
				<Button
					className="ftb-table-cell-label"
					tabIndex={ controlTabIndex }
					size="small"
					onClick={ ( event: MouseEvent ) => {
						handlers.onSelectSectionCells( sectionName );
						event.stopPropagation();
					} }
				>
					{ `t${ sectionName }` }
				</Button>
			) }
			{ showControlButtons && (
				<>
					{ rowIndex === 0 && vColIndex === 0 && (
						<IconButton
							variant="unstyled"
							className={ clsx( 'ftb-row-before-inserter', {
								'has-prev-section': sectionIndex > 0,
							} ) }
							label={ __( 'Insert row before', 'flexible-table-block' ) }
							tabIndex={ controlTabIndex }
							icon={ plus }
							onClick={ ( event: MouseEvent ) => {
								handlers.onInsertRow( sectionName, rowIndex );
								event.stopPropagation();
							} }
						/>
					) }
					{ vColIndex === 0 && (
						<>
							<IconButton
								variant="minimal"
								tone="neutral"
								size="small"
								className="ftb-row-selector"
								label={ __( 'Select row', 'flexible-table-block' ) }
								tabIndex={ controlTabIndex }
								icon={ chevronRight }
								aria-pressed={ isCurrentRowSelected }
								onClick={ ( event: MouseEvent ) => {
									handlers.onSelectRow( sectionName, rowIndex );
									event.stopPropagation();
								} }
							/>
							{ isCurrentRowSelected && (
								<IconButton
									variant="minimal"
									tone="neutral"
									className="ftb-row-remover"
									label={ __( 'Delete row', 'flexible-table-block' ) }
									tabIndex={ controlTabIndex }
									size="compact"
									icon={ trash }
									onClick={ ( event: MouseEvent ) => {
										handlers.onDeleteRow( sectionName, rowIndex );
										event.stopPropagation();
									} }
								/>
							) }
						</>
					) }
					{ sectionIndex === 0 && rowIndex === 0 && vColIndex === 0 && (
						<IconButton
							variant="unstyled"
							className="ftb-column-before-inserter"
							label={ __( 'Insert column before', 'flexible-table-block' ) }
							tabIndex={ controlTabIndex }
							icon={ plus }
							onClick={ ( event: MouseEvent ) => {
								handlers.onInsertColumn( cell, 0 );
								event.stopPropagation();
							} }
						/>
					) }
					{ sectionIndex === 0 && rowIndex === 0 && (
						<>
							<IconButton
								variant="minimal"
								tone="neutral"
								size="small"
								className="ftb-column-selector"
								label={ __( 'Select column', 'flexible-table-block' ) }
								tabIndex={ controlTabIndex }
								icon={ chevronDown }
								aria-pressed={ isCurrentColumnSelected }
								onClick={ ( event: MouseEvent ) => {
									handlers.onSelectColumn( vColIndex );
									event.stopPropagation();
								} }
							/>
							{ isCurrentColumnSelected && (
								<IconButton
									variant="minimal"
									tone="neutral"
									className="ftb-column-remover"
									label={ __( 'Delete column', 'flexible-table-block' ) }
									tabIndex={ controlTabIndex }
									size="compact"
									icon={ trash }
									onClick={ ( event: MouseEvent ) => {
										handlers.onDeleteColumn( vColIndex );
										event.stopPropagation();
									} }
								/>
							) }
						</>
					) }
					{ vColIndex === 0 && (
						<IconButton
							variant="unstyled"
							className={ clsx( 'ftb-row-after-inserter', {
								'has-next-section': hasNextSection,
							} ) }
							label={ __( 'Insert row after', 'flexible-table-block' ) }
							tabIndex={ controlTabIndex }
							icon={ plus }
							onClick={ ( event: MouseEvent ) => {
								handlers.onInsertRow( sectionName, rowIndex + rowSpan );
								event.stopPropagation();
							} }
						/>
					) }
				</>
			) }
			<RichText
				key={ vColIndex }
				value={ content }
				onChange={ ( value ) => handlers.onChangeCellContent( value, cell ) }
				onFocus={ () => handlers.onFocusCell( cell ) }
				aria-label={ CELL_ARIA_LABEL[ sectionName as SectionName ] }
			/>
			{ showControlButtons && sectionIndex === 0 && rowIndex === 0 && (
				<IconButton
					variant="unstyled"
					className="ftb-column-after-inserter"
					label={ __( 'Insert column after', 'flexible-table-block' ) }
					tabIndex={ controlTabIndex }
					icon={ plus }
					onClick={ ( event: MouseEvent ) => {
						handlers.onInsertColumn( cell, 1 );
						event.stopPropagation();
					} }
				/>
			) }
		</Cell>
	);
}

const MemoizedTableCell = memo( TableCell, areTableCellPropsEqual );

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

	// Keys of the selected cells, to check whether each cell is selected in constant time.
	const selectedCellKeys = useMemo( () => toCellKeySet( selectedCells ), [ selectedCells ] );

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

	// Keep the latest handlers in a ref and pass stable functions to the cells,
	// so that memoized cells are not re-rendered just because the handlers were recreated.
	const handlersRef = useRef< CellHandlers | null >( null );
	useLayoutEffect( () => {
		handlersRef.current = {
			onClickCell,
			onFocusCell,
			onChangeCellContent,
			onSelectSectionCells,
			onInsertRow,
			onDeleteRow,
			onSelectRow,
			onInsertColumn,
			onDeleteColumn,
			onSelectColumn,
		};
	} );
	const handlers = useMemo( (): CellHandlers => {
		const call =
			< K extends keyof CellHandlers >( name: K ) =>
			( ...args: Parameters< CellHandlers[ K ] > ) => {
				// The ref is set in a layout effect, so a cell (e.g. RichText) may call a handler
				// before it is ready. Ignore such calls, as `onChangeCellContent` already does.
				const handler = handlersRef.current?.[ name ] as
					( ( ...a: Parameters< CellHandlers[ K ] > ) => void ) | undefined;
				handler?.( ...args );
			};
		return {
			onClickCell: call( 'onClickCell' ),
			onFocusCell: call( 'onFocusCell' ),
			onChangeCellContent: call( 'onChangeCellContent' ),
			onSelectSectionCells: call( 'onSelectSectionCells' ),
			onInsertRow: call( 'onInsertRow' ),
			onDeleteRow: call( 'onDeleteRow' ),
			onSelectRow: call( 'onSelectRow' ),
			onInsertColumn: call( 'onInsertColumn' ),
			onDeleteColumn: call( 'onDeleteColumn' ),
			onSelectColumn: call( 'onSelectColumn' ),
		};
	}, [] );

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
								const { vColIndex, rowSpan } = cell;
								return (
									<MemoizedTableCell
										key={ vColIndex }
										cell={ cell }
										sectionName={ sectionName }
										sectionIndex={ sectionIndex }
										rowIndex={ rowIndex }
										isCellSelected={ selectedCellKeys.has(
											toCellKey( sectionName, rowIndex, vColIndex )
										) }
										isCurrentRowSelected={
											!! (
												isRowSelected &&
												selectedLine.sectionName === sectionName &&
												selectedLine.rowIndex === rowIndex
											)
										}
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
