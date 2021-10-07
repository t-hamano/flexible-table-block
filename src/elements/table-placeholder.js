/**
 * External dependencies
 */
import { times } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { BlockIcon } from '@wordpress/block-editor';
import { Button, Placeholder, TextControl, ToggleControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import {
	MIN_PREVIEW_TABLE_HEIGHT,
	MAX_PREVIEW_TABLE_COL,
	MAX_PREVIEW_TABLE_ROW,
	THRESHOLD_PREVIEW_TABLE_COL,
	THRESHOLD_PREVIEW_TABLE_ROW,
} from '../constants';
import { createTable } from '../utils/table-state';
import { blockIcon as icon } from '../icons';

export default function TablePlaceholder( { setAttributes } ) {
	const [ rowCount, setRowCount ] = useState( 2 );
	const [ colCount, setColCount ] = useState( 2 );
	const [ headerSection, setHeaderSection ] = useState( false );
	const [ footerSection, setFooterSection ] = useState( false );

	const totalRowCount = rowCount + Number( headerSection ) + Number( footerSection );
	const cellHeight = parseInt(
		MIN_PREVIEW_TABLE_HEIGHT / Math.min( THRESHOLD_PREVIEW_TABLE_ROW, totalRowCount )
	);

	const onCreateTable = ( event ) => {
		event.preventDefault();

		setAttributes(
			createTable( {
				rowCount: Math.min( rowCount, MAX_PREVIEW_TABLE_ROW ),
				colCount: Math.min( colCount, MAX_PREVIEW_TABLE_COL ),
				headerSection,
				footerSection,
			} )
		);
	};

	const onChangeColumnCount = ( value ) => {
		const parsedValue = parseInt( value, 10 );
		if ( isNaN( parsedValue ) ) {
			setColCount( '' );
		} else {
			setColCount( Math.max( 1, Math.min( MAX_PREVIEW_TABLE_COL, parsedValue ) ) );
		}
	};

	const onChangeRowCount = ( value ) => {
		const parsedValue = parseInt( value, 10 );
		if ( isNaN( parsedValue ) ) {
			setRowCount( '' );
		} else {
			setRowCount( Math.max( 1, Math.min( MAX_PREVIEW_TABLE_ROW, parsedValue ) ) );
		}
	};

	const onToggleHeaderSection = ( section ) => setHeaderSection( !! section );

	const onToggleFooterSection = ( section ) => setFooterSection( !! section );

	const tableClass = classnames( 'ftb-placeholder__table', {
		'is-overflow-row': totalRowCount > THRESHOLD_PREVIEW_TABLE_ROW,
		'is-overflow-col': colCount > THRESHOLD_PREVIEW_TABLE_COL,
	} );

	return (
		<Placeholder
			label={ __( 'Table', 'flexible-table-block' ) }
			className="ftb-placeholder"
			icon={ <BlockIcon icon={ icon } showColors /> }
			instructions={ __(
				'Hold Ctrl key to select multiple cells. Hold Shift key to select range.',
				'flexible-table-block'
			) }
		>
			<div
				className="ftb-placeholder__table-wrap"
				style={ { minHeight: MIN_PREVIEW_TABLE_HEIGHT } }
			>
				<table className={ tableClass }>
					{ headerSection && rowCount && colCount && (
						<thead>
							<tr>
								{ times( colCount, ( colIndex ) => {
									if ( colIndex > THRESHOLD_PREVIEW_TABLE_COL ) return;
									return <th key={ colIndex } style={ { height: cellHeight } } />;
								} ) }
							</tr>
						</thead>
					) }
					<tbody>
						{ times( rowCount, ( rowIndex ) => {
							if ( rowIndex > THRESHOLD_PREVIEW_TABLE_ROW ) return;
							return (
								<tr key={ rowIndex }>
									{ times( Math.min( colCount, MAX_PREVIEW_TABLE_COL ), ( colIndex ) => {
										if ( colIndex > THRESHOLD_PREVIEW_TABLE_COL ) return;
										return <td key={ colIndex } style={ { height: cellHeight } } />;
									} ) }
								</tr>
							);
						} ) }
					</tbody>
					{ footerSection && rowCount && colCount && (
						<tfoot>
							<tr>
								{ times( colCount, ( colIndex ) => {
									if ( colIndex > THRESHOLD_PREVIEW_TABLE_COL ) return;
									return <td key={ colIndex } style={ { height: cellHeight } } />;
								} ) }
							</tr>
						</tfoot>
					) }
				</table>
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
						label={ __( 'Column count', 'flexible-table-block' ) }
						type="number"
						min="1"
						max={ MAX_PREVIEW_TABLE_COL }
						value={ colCount }
						onChange={ onChangeColumnCount }
					/>
					<TextControl
						label={ __( 'Row count', 'flexible-table-block' ) }
						type="number"
						min="1"
						max={ MAX_PREVIEW_TABLE_ROW }
						value={ rowCount }
						onChange={ onChangeRowCount }
					/>
					<Button variant="primary" type="submit" disabled={ ! rowCount || ! colCount }>
						{ __( 'Create Table', 'flexible-table-block' ) }
					</Button>
				</div>
			</form>
		</Placeholder>
	);
}
