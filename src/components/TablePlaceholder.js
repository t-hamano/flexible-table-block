
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
import { createTable } from '../state';
import { PREVIEW_TABLE_HEIGHT_MIN } from '../constants';

export default function TablePlaceholder({
	setAttributes
}) {
	const [ rowCount, setRowCount ] = useState( 2 );
	const [ columnCount, setColumnCount ] = useState( 2 );
	const [ headerSection, setHeaderSection ] = useState( false );
	const [ footerSection, setFooterSection ] = useState( false );

	const cellheight = Math.max( 2, parseInt( PREVIEW_TABLE_HEIGHT_MIN / ( rowCount + Number( headerSection ) + Number( footerSection ) ) ) );

	/**
	 * Creates a table based on settings.
	 *
	 * @param {Object} event Form submit event.
	 */
	function onCreateTable( event ) {
		event.preventDefault();
		setAttributes( createTable({ rowCount, columnCount, headerSection, footerSection }) );
	}

	/**
	 * Updates column count used for table creation.
	 *
	 * @param {number} count column count.
	 */
	function onChangeColumnCount( count ) {
		setColumnCount( parseInt( count, 10 ) || 2 );
	}

	/**
	 * Updates row count used for table creation.
	 *
	 * @param {number} count row count.
	 */
	function onChangeRowCount( count ) {
		setRowCount( parseInt( count, 10 ) || 2 );
	}

	/**
	 * Updates header section setting used for table creation.
	 *
	 * @param {boolean} headerSection header section setting.
	 */
	function onToggleHeaderSection( headerSection ) {
		setHeaderSection( !! headerSection );
	}

	/**
	 * Updates footer section setting used for table creation.
	 *
	 * @param {boolean} footerSection footer section setting.
	 */
	function onToggleFooterSection( footerSection ) {
		setFooterSection( !! footerSection );
	}

	return (
		<Placeholder
			label={ __( 'Table', 'flexible-spacer-block' ) }
			icon={ <BlockIcon icon={ icon } showColors /> }
			instructions={ __( 'Create flexible configuration table.' ) }
		>
			<table className="wp-block-flexible-table-block-table__placeholder-table">
				{ headerSection && (
					<thead>
						<tr>
							{ times( columnCount, ( columnIndex ) => (
								<th key={ columnIndex } style={ { height: cellheight } } />
							) ) }
						</tr>
					</thead>
				) }
				<tbody>
					{ times( rowCount, ( rowIndex ) => (
						<tr key={ rowIndex }>
							{ times( columnCount, ( columnIndex ) => (
								<td key={ columnIndex } style={ { height: cellheight } } />
							) ) }
						</tr>
					) ) }
				</tbody>
				{ footerSection && (
					<tfoot>
						<tr>
							{ times( columnCount, ( columnIndex ) => (
								<td key={ columnIndex } style={ { height: cellheight } } />
							) ) }
						</tr>
					</tfoot>
				) }
			</table>
			<form className="wp-block-flexible-table-block-table__placeholder-form" onSubmit={ onCreateTable }>
				<div className="wp-block-flexible-table-block-table__placeholder-row">
					<ToggleControl
						label={ __( 'Header section', 'flexible-spacer-block' ) }
						checked={ !! headerSection }
						onChange={ onToggleHeaderSection }
					/>
					<ToggleControl
						label={ __( 'Footer section', 'flexible-spacer-block' ) }
						checked={ !! footerSection }
						onChange={ onToggleFooterSection }
					/>
				</div>
				<div className="wp-block-flexible-table-block-table__placeholder-row">
					<TextControl
						type="number"
						label={ __( 'Column count', 'flexible-spacer-block' ) }
						value={ columnCount }
						onChange={ onChangeColumnCount }
						min="1"
					/>
					<TextControl
						type="number"
						label={ __( 'Row count', 'flexible-spacer-block' ) }
						value={ rowCount }
						onChange={ onChangeRowCount }
						min="1"
					/>
					<Button
						variant="primary"
						type="submit"
					>
						{ __( 'Create Table', 'flexible-spacer-block' ) }
					</Button>
				</div>
			</form>
		</Placeholder>
	);
}
