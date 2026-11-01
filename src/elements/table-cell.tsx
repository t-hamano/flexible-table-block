/**
 * External dependencies
 */
import clsx from 'clsx';
import type { MouseEvent } from 'react';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { memo, useMemo } from '@wordpress/element';
import { RichText } from '@wordpress/block-editor';
import { Button, IconButton } from '@wordpress/ui';
import { plus, trash, chevronRight, chevronDown } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { CELL_ARIA_LABEL } from '../constants';
import { convertToObject } from '../utils/style-converter';
import type { VCell } from '../utils/table-state';
import type { SectionName, CellTagValue } from '../BlockAttributes';

function Cell( props: any ) {
	const { name, ...restProps } = props;
	const TagName: CellTagValue = name;
	return <TagName { ...restProps } />;
}

export type CellHandlers = {
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

export default memo( TableCell, areTableCellPropsEqual );
