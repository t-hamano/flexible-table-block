/**
 * External dependencies
 */
import clsx from 'clsx';
import type { MouseEvent } from 'react';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
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

// Position of a cell on the virtual table.
export type CellPosition = Pick< VCell, 'sectionName' | 'rowIndex' | 'vColIndex' >;

export type CellHandlers = {
	onClickCell: ( event: MouseEvent, position: CellPosition ) => void;
	onFocusCell: ( position: CellPosition ) => void;
	onChangeCellContent: ( content: string, position: CellPosition ) => void;
	onSelectSectionCells: ( sectionName: SectionName ) => void;
	onInsertRow: ( sectionName: SectionName, rowIndex: number ) => void;
	onDeleteRow: ( sectionName: SectionName, rowIndex: number ) => void;
	onSelectRow: ( sectionName: SectionName, rowIndex: number ) => void;
	onInsertColumn: ( position: CellPosition, offset: number ) => void;
	onDeleteColumn: ( vColIndex: number ) => void;
	onSelectColumn: ( vColIndex: number ) => void;
};

type TableCellProps = Pick<
	VCell,
	'content' | 'tag' | 'className' | 'id' | 'headers' | 'scope' | 'styles' | 'rowSpan' | 'colSpan'
> &
	CellPosition & {
		sectionIndex: number;
		isCellSelected: boolean;
		isCurrentRowSelected: boolean;
		isCurrentColumnSelected: boolean;
		hasNextSection: boolean;
		showSectionLabel: boolean;
		showControlButtons: boolean;
		controlTabIndex: number;
		handlers: CellHandlers;
	};

export default function TableCell( {
	content,
	tag,
	className,
	id,
	headers,
	scope,
	styles,
	rowSpan,
	colSpan,
	sectionName,
	rowIndex,
	vColIndex,
	sectionIndex,
	isCellSelected,
	isCurrentRowSelected,
	isCurrentColumnSelected,
	hasNextSection,
	showSectionLabel,
	showControlButtons,
	controlTabIndex,
	handlers,
}: TableCellProps ) {
	const position: CellPosition = { sectionName, rowIndex, vColIndex };

	return (
		<Cell
			name={ tag }
			className={ clsx( className, { 'is-selected': isCellSelected } ) }
			rowSpan={ rowSpan > 1 ? rowSpan : undefined }
			colSpan={ colSpan > 1 ? colSpan : undefined }
			style={ convertToObject( styles ) }
			id={ id }
			headers={ headers }
			scope={ scope }
			onClick={ ( event: MouseEvent ) => handlers.onClickCell( event, position ) }
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
								handlers.onInsertColumn( position, 0 );
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
				onChange={ ( value ) => handlers.onChangeCellContent( value, position ) }
				onFocus={ () => handlers.onFocusCell( position ) }
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
						handlers.onInsertColumn( position, 1 );
						event.stopPropagation();
					} }
				/>
			) }
		</Cell>
	);
}
