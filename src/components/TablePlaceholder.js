
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
import { blockTable as icon } from '@wordpress/icons';
import {
	Button,
	Placeholder,
	TextControl,
	ToggleControl
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import { createTable } from '../utils/state';
import { PREVIEW_TABLE_HEIGHT_MIN } from '../utils/constants';

export default function TablePlaceholder({
	setAttributes
}) {
	const [ rowCount, setRowCount ] = useState( 2 );
	const [ columnCount, setColumnCount ] = useState( 2 );
	const [ headerSection, setHeaderSection ] = useState( false );
	const [ footerSection, setFooterSection ] = useState( false );

	const cellStyle = {
		height: Math.max( 2, parseInt( PREVIEW_TABLE_HEIGHT_MIN / ( rowCount + Number( headerSection ) + Number( footerSection ) ) ) )
	};

	const onCreateTable = ( event ) => {
		event.preventDefault();
		setAttributes( createTable({ rowCount, columnCount, headerSection, footerSection }) );
	};

	const onChangeColumnCount = ( count ) => {
		setColumnCount( parseInt( count, 10 ) || 2 );
	};

	const onChangeRowCount = ( count ) => {
		setRowCount( parseInt( count, 10 ) || 2 );
	};

	const onToggleHeaderSection = ( headerSection ) => {
		setHeaderSection( !! headerSection );
	};

	const onToggleFooterSection = ( footerSection ) => {
		setFooterSection( !! footerSection );
	};

	return (
		<Placeholder
			label={ __( 'Table', 'flexible-table-block' ) }
			icon={ <BlockIcon icon={ icon } showColors /> }
			instructions={ __( 'Create flexible configuration table.' ) }
		>
			<table className="wp-block-flexible-table-block-table__placeholder-table">
				{ headerSection && (
					<thead>
						<tr>
							{ times( columnCount, ( columnIndex ) => (
								<th key={ columnIndex } style={ { ...cellStyle } } />
							) ) }
						</tr>
					</thead>
				) }
				<tbody>
					{ times( rowCount, ( rowIndex ) => (
						<tr key={ rowIndex }>
							{ times( columnCount, ( columnIndex ) => (
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
			<form className="wp-block-flexible-table-block-table__placeholder-form" onSubmit={ onCreateTable }>
				<div className="wp-block-flexible-table-block-table__placeholder-row">
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
				<div className="wp-block-flexible-table-block-table__placeholder-row">
					<TextControl
						type="number"
						label={ __( 'Column count', 'flexible-table-block' ) }
						value={ columnCount }
						onChange={ onChangeColumnCount }
						min="1"
					/>
					<TextControl
						type="number"
						label={ __( 'Row count', 'flexible-table-block' ) }
						value={ rowCount }
						onChange={ onChangeRowCount }
						min="1"
					/>
					<Button
						variant="primary"
						type="submit"
					>
						{ __( 'Create Table', 'flexible-table-block' ) }
					</Button>
				</div>
			</form>
		</Placeholder>
	);
}
