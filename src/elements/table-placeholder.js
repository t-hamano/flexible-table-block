/**
 * External dependencies
 */
import { times } from 'lodash';

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
import { createTable } from '../utils/table-state';
import {
	PREVIEW_TABLE_HEIGHT_MIN,
	PREVIEW_TABLE_ROW_MAX,
	PREVIEW_TABLE_COL_MAX,
} from '../utils/constants';
import { fsbIcon as icon } from '../icons';

export default function TablePlaceholder( { setAttributes } ) {
	const [ rowCount, setRowCount ] = useState( 2 );
	const [ columnCount, setColumnCount ] = useState( 2 );
	const [ headerSection, setHeaderSection ] = useState( false );
	const [ footerSection, setFooterSection ] = useState( false );

	const cellStyle = {
		height: Math.max(
			2,
			parseInt(
				PREVIEW_TABLE_HEIGHT_MIN / ( rowCount + Number( headerSection ) + Number( footerSection ) )
			)
		),
	};

	const onCreateTable = ( event ) => {
		event.preventDefault();
		setAttributes(
			createTable( {
				rowCount: Math.min( rowCount, PREVIEW_TABLE_ROW_MAX ),
				columnCount: Math.min( columnCount, PREVIEW_TABLE_COL_MAX ),
				headerSection,
				footerSection,
			} )
		);
	};

	const onChangeColumnCount = ( count ) => {
		setColumnCount( parseInt( count, 10 ) );
	};

	const onChangeRowCount = ( count ) => {
		setRowCount( parseInt( count, 10 ) );
	};

	const onToggleHeaderSection = ( section ) => {
		setHeaderSection( !! section );
	};

	const onToggleFooterSection = ( section ) => {
		setFooterSection( !! section );
	};

	return (
		<Placeholder
			label={ __( 'Table', 'flexible-table-block' ) }
			icon={ <BlockIcon icon={ icon } showColors /> }
			instructions={ __( 'Create flexible configuration table.' ) }
		>
			<div className="ftb-placeholder__table-wrap">
				<table className="ftb-placeholder__table">
					{ headerSection && (
						<thead>
							<tr>
								{ times( Math.min( columnCount, PREVIEW_TABLE_COL_MAX ), ( columnIndex ) => (
									<th key={ columnIndex } style={ { ...cellStyle } } />
								) ) }
							</tr>
						</thead>
					) }
					<tbody>
						{ times( Math.min( rowCount, PREVIEW_TABLE_ROW_MAX ), ( rowIndex ) => (
							<tr key={ rowIndex }>
								{ times( Math.min( columnCount, PREVIEW_TABLE_COL_MAX ), ( columnIndex ) => (
									<td key={ columnIndex } style={ { ...cellStyle } } />
								) ) }
							</tr>
						) ) }
					</tbody>
					{ footerSection && (
						<tfoot>
							<tr>
								{ times( columnCount, ( columnIndex ) => (
									<td key={ columnIndex } style={ { ...cellStyle } } />
								) ) }
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
						type="number"
						label={ __( 'Column count', 'flexible-table-block' ) }
						value={ columnCount }
						onChange={ onChangeColumnCount }
						min="1"
						max={ PREVIEW_TABLE_COL_MAX }
					/>
					<TextControl
						type="number"
						label={ __( 'Row count', 'flexible-table-block' ) }
						value={ rowCount }
						onChange={ onChangeRowCount }
						min="1"
						max={ PREVIEW_TABLE_ROW_MAX }
					/>
					<Button variant="primary" type="submit">
						{ __( 'Create Table', 'flexible-table-block' ) }
					</Button>
				</div>
			</form>
		</Placeholder>
	);
}
