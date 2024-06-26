/**
 * External dependencies
 */
import clsx from 'clsx';
import type { FormEvent } from 'react';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useState, createInterpolateElement } from '@wordpress/element';
import { BlockIcon } from '@wordpress/block-editor';
import { Button, Placeholder, TextControl, ToggleControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import {
	DEFAULT_PREVIEW_ROWS,
	DEFAULT_PREVIEW_COLUMNS,
	MIN_PREVIEW_TABLE_HEIGHT,
	MAX_PREVIEW_TABLE_COL,
	MAX_PREVIEW_TABLE_ROW,
	THRESHOLD_PREVIEW_TABLE_COL,
	THRESHOLD_PREVIEW_TABLE_ROW,
} from '../constants';
import { createTable, toTableAttributes, type VTable } from '../utils/table-state';
import { blockIcon as icon } from '../icons';
import type { BlockAttributes } from '../BlockAttributes';

type Props = {
	setAttributes: ( attrs: Partial< BlockAttributes > ) => void;
};

export default function TablePlaceholder( { setAttributes }: Props ) {
	const [ rowCount, setRowCount ] = useState< number | undefined >( DEFAULT_PREVIEW_ROWS );
	const [ colCount, setColCount ] = useState< number | undefined >( DEFAULT_PREVIEW_COLUMNS );
	const [ headerSection, setHeaderSection ] = useState< boolean >( false );
	const [ footerSection, setFooterSection ] = useState< boolean >( false );

	const totalRowCount: number | undefined = rowCount
		? rowCount + Number( headerSection ) + Number( footerSection )
		: undefined;
	const cellHeight: number | undefined = totalRowCount
		? Number( MIN_PREVIEW_TABLE_HEIGHT / Math.min( THRESHOLD_PREVIEW_TABLE_ROW, totalRowCount ) )
		: undefined;

	const onCreateTable = ( event: FormEvent ) => {
		event.preventDefault();

		if ( ! rowCount || ! colCount ) {
			return;
		}

		const vTable: VTable = createTable( {
			rowCount: Math.min( rowCount, MAX_PREVIEW_TABLE_ROW ),
			colCount: Math.min( colCount, MAX_PREVIEW_TABLE_COL ),
			headerSection,
			footerSection,
		} );

		setAttributes( toTableAttributes( vTable ) );
	};

	const onChangeColumnCount = ( value: string ) => {
		const parsedValue = parseInt( value, 10 );
		if ( isNaN( parsedValue ) ) {
			setColCount( undefined );
		} else {
			setColCount( Math.max( 1, Math.min( MAX_PREVIEW_TABLE_COL, parsedValue ) ) );
		}
	};

	const onChangeRowCount = ( value: string ) => {
		const parsedValue = parseInt( value );
		if ( isNaN( parsedValue ) ) {
			setRowCount( undefined );
		} else {
			setRowCount( Math.max( 1, Math.min( MAX_PREVIEW_TABLE_ROW, parsedValue ) ) );
		}
	};

	const onToggleHeaderSection = ( section: boolean ) => setHeaderSection( section );

	const onToggleFooterSection = ( section: boolean ) => setFooterSection( section );

	const tableClasses: string = clsx( 'ftb-placeholder__table', {
		'is-overflow-row': totalRowCount && totalRowCount > THRESHOLD_PREVIEW_TABLE_ROW,
		'is-overflow-col': colCount && colCount > THRESHOLD_PREVIEW_TABLE_COL,
	} );

	return (
		<Placeholder
			label={ __( 'Flexible Table', 'flexible-table-block' ) }
			className="ftb-placeholder"
			icon={ <BlockIcon icon={ icon } showColors /> }
		>
			<legend className="components-placeholder__instructions">
				{ createInterpolateElement(
					__(
						'Hint: Hold <code>Ctrl</code> key to select multiple cells. Hold <code>Shift</code> key to select the range.',
						'flexible-table-block'
					),
					{ code: <code /> }
				) }
			</legend>
			<div
				className="ftb-placeholder__table-wrap"
				style={ { minHeight: MIN_PREVIEW_TABLE_HEIGHT } }
			>
				<div className="ftb-placeholder__tbl-ttl">{ __( 'Preview', 'flexible-table-block' ) }</div>
				{ rowCount && colCount && (
					<table className={ tableClasses }>
						{ headerSection && (
							<thead>
								<tr>
									{ Array.from( {
										length: Math.min( colCount, THRESHOLD_PREVIEW_TABLE_COL ),
									} ).map( ( _col, colIndex ) => (
										<th key={ colIndex } style={ { height: cellHeight } } />
									) ) }
								</tr>
							</thead>
						) }
						<tbody>
							{ Array.from( { length: Math.min( rowCount, THRESHOLD_PREVIEW_TABLE_ROW ) } ).map(
								( _row, rowIndex ) => (
									<tr key={ rowIndex }>
										{ Array.from( {
											length: Math.min( colCount, THRESHOLD_PREVIEW_TABLE_COL ),
										} ).map( ( _col, colIndex ) => (
											<td key={ colIndex } style={ { height: cellHeight } } />
										) ) }
									</tr>
								)
							) }
						</tbody>
						{ footerSection && (
							<tfoot>
								<tr>
									{ Array.from( {
										length: Math.min( colCount, THRESHOLD_PREVIEW_TABLE_COL ),
									} ).map( ( _col, colIndex ) => (
										<td key={ colIndex } style={ { height: cellHeight } } />
									) ) }
								</tr>
							</tfoot>
						) }
					</table>
				) }
			</div>
			<form className="ftb-placeholder__form" onSubmit={ onCreateTable }>
				<div className="ftb-placeholder__row">
					<ToggleControl
						label={ __( 'Header section', 'flexible-table-block' ) }
						checked={ !! headerSection }
						onChange={ onToggleHeaderSection }
					/>
					<ToggleControl
						label={ __( 'Footer section', 'flexible-table-block' ) }
						checked={ !! footerSection }
						onChange={ onToggleFooterSection }
					/>
				</div>
				<div className="ftb-placeholder__row">
					<TextControl
						className="ftb-is-next-40px-default-size"
						label={ __( 'Column count', 'flexible-table-block' ) }
						type="number"
						min="1"
						max={ MAX_PREVIEW_TABLE_COL }
						value={ colCount || '' }
						onChange={ onChangeColumnCount }
					/>
					<TextControl
						className="ftb-is-next-40px-default-size"
						label={ __( 'Row count', 'flexible-table-block' ) }
						type="number"
						min="1"
						max={ MAX_PREVIEW_TABLE_ROW }
						value={ rowCount || '' }
						onChange={ onChangeRowCount }
					/>
					<Button
						variant="primary"
						type="submit"
						disabled={ ! rowCount || ! colCount }
						// @ts-ignore: `__next40pxDefaultSize` prop is not exist at @types
						__next40pxDefaultSize
					>
						{ __( 'Create Table', 'flexible-table-block' ) }
					</Button>
				</div>
			</form>
		</Placeholder>
	);
}
