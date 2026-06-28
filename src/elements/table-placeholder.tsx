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
import { Stack, Text } from '@wordpress/ui';
import { isAppleOS } from '@wordpress/keycodes';

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
	const [ headerSection, setHeaderSection ] = useState( false );
	const [ footerSection, setFooterSection ] = useState( false );

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
		if ( Number.isNaN( parsedValue ) ) {
			setColCount( undefined );
		} else {
			setColCount( Math.max( 1, Math.min( MAX_PREVIEW_TABLE_COL, parsedValue ) ) );
		}
	};

	const onChangeRowCount = ( value: string ) => {
		const parsedValue = parseInt( value, 10 );
		if ( Number.isNaN( parsedValue ) ) {
			setRowCount( undefined );
		} else {
			setRowCount( Math.max( 1, Math.min( MAX_PREVIEW_TABLE_ROW, parsedValue ) ) );
		}
	};

	const onToggleHeaderSection = ( section: boolean ) => setHeaderSection( section );

	const onToggleFooterSection = ( section: boolean ) => setFooterSection( section );

	const tableClasses = clsx( 'ftb-placeholder__table', {
		'is-overflow-row': totalRowCount && totalRowCount > THRESHOLD_PREVIEW_TABLE_ROW,
		'is-overflow-col': colCount && colCount > THRESHOLD_PREVIEW_TABLE_COL,
	} );

	return (
		<Placeholder
			label={ __( 'Flexible Table', 'flexible-table-block' ) }
			className="ftb-placeholder"
			icon={ <BlockIcon icon={ icon } showColors /> }
		>
			<div className="components-placeholder__instructions">
				{ createInterpolateElement(
					isAppleOS()
						? __(
								'Hint: Hold <code>Command</code> key to select multiple cells. Hold <code>Shift</code> key to select the range.',
								'flexible-table-block'
						  )
						: __(
								'Hint: Hold <code>Ctrl</code> key to select multiple cells. Hold <code>Shift</code> key to select the range.',
								'flexible-table-block'
						  ),
					{ code: <code /> }
				) }
			</div>
			<Stack
				direction="column"
				className="ftb-placeholder__table-wrap"
				align="center"
				justify="center"
				gap="sm"
				style={ {
					minHeight: MIN_PREVIEW_TABLE_HEIGHT,
					//  `@wordpress/ui` styles aren't loaded into the editor iframe on WP 6.9
					//  and below, so each Stack sets `display: flex` inline as a fallback.
					//  TODO: Remove once the minimum supported WordPress version is 7.1+.
					display: 'flex',
				} }
			>
				<Text style={ { display: 'block', textAlign: 'center', fontWeight: 500 } }>
					{ __( 'Preview', 'flexible-table-block' ) }
				</Text>
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
			</Stack>
			<Stack
				direction="column"
				render={ <form /> }
				gap="sm"
				onSubmit={ onCreateTable }
				//  `@wordpress/ui` styles aren't loaded into the editor iframe on WP 6.9
				//  and below, so each Stack sets `display: flex` inline as a fallback.
				//  TODO: Remove once the minimum supported WordPress version is 7.1+.
				style={ { display: 'flex' } }
			>
				{ /*
				 * `@wordpress/ui` styles aren't loaded into the editor iframe on WP 6.9
				 * and below, so each Stack sets `display: flex` inline as a fallback.
				 * TODO: Remove once the minimum supported WordPress version is 7.1+.
				 */ }
				<Stack wrap="wrap" align="center" gap="sm" style={ { display: 'flex' } }>
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
				</Stack>

				<Stack
					wrap="wrap"
					align="flex-end"
					gap="sm"
					//  `@wordpress/ui` styles aren't loaded into the editor iframe on WP 6.9
					//  and below, so each Stack sets `display: flex` inline as a fallback.
					//  TODO: Remove once the minimum supported WordPress version is 7.1+.
					style={ { display: 'flex' } }
				>
					<TextControl
						label={ __( 'Column count', 'flexible-table-block' ) }
						className="ftb-placeholder__input"
						type="number"
						min="1"
						max={ MAX_PREVIEW_TABLE_COL }
						value={ colCount || '' }
						onChange={ onChangeColumnCount }
						__next40pxDefaultSize
					/>
					<TextControl
						label={ __( 'Row count', 'flexible-table-block' ) }
						className="ftb-placeholder__input"
						type="number"
						min="1"
						max={ MAX_PREVIEW_TABLE_ROW }
						value={ rowCount || '' }
						onChange={ onChangeRowCount }
						__next40pxDefaultSize
					/>
					<Button
						variant="primary"
						type="submit"
						disabled={ ! rowCount || ! colCount }
						__next40pxDefaultSize
					>
						{ __( 'Create Table', 'flexible-table-block' ) }
					</Button>
				</Stack>
			</Stack>
		</Placeholder>
	);
}
