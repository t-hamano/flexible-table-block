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
import { createTable } from '../utils/table-state';
import {
	MIN_PREVIEW_TABLE_HEIGHT,
	MAX_PREVIEW_TABLE_COL,
	MAX_PREVIEW_TABLE_ROW,
	THRESHOLD_PREVIEW_TABLE_COL,
	THRESHOLD_PREVIEW_TABLE_ROW,
} from './constants';
import { blockIcon as icon } from '../icons';

export default function TablePlaceholder( { setAttributes } ) {
	const [ rowCount, setRowCount ] = useState( 2 );
	const [ columnCount, setColumnCount ] = useState( 2 );
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
				columnCount: Math.min( columnCount, MAX_PREVIEW_TABLE_COL ),
				headerSection,
				footerSection,
			} )
		);
	};

	const onChangeColumnCount = ( inputValue ) => {
		const parsedValue = parseInt( inputValue, 10 );
		if ( isNaN( parsedValue ) ) {
			setColumnCount( undefined );
		} else {
			setColumnCount( Math.max( 1, Math.min( MAX_PREVIEW_TABLE_COL, parsedValue ) ) );
		}
	};

	const onChangeRowCount = ( inputValue ) => {
		const parsedValue = parseInt( inputValue, 10 );
		if ( isNaN( parsedValue ) ) {
			setRowCount( undefined );
		} else {
			setRowCount( Math.max( 1, Math.min( MAX_PREVIEW_TABLE_ROW, parsedValue ) ) );
		}
	};

	const onToggleHeaderSection = ( section ) => {
		setHeaderSection( !! section );
	};

	const onToggleFooterSection = ( section ) => {
		setFooterSection( !! section );
	};

	const tableClass = classnames( 'ftb-placeholder__table', {
		'is-overflow-row': totalRowCount > THRESHOLD_PREVIEW_TABLE_ROW,
		'is-overflow-col': columnCount > THRESHOLD_PREVIEW_TABLE_COL,
	} );

	return (
		<Placeholder
			label={ __( 'Table', 'flexible-table-block' ) }
			icon={ <BlockIcon icon={ icon } showColors /> }
			instructions={ __( 'Create flexible configuration table.' ) }
		>
			<div
				className="ftb-placeholder__table-wrap"
				style={ { minHeight: MIN_PREVIEW_TABLE_HEIGHT } }
			>
				<table className={ tableClass }>
					{ headerSection && rowCount && columnCount && (
						<thead>
							<tr>
								{ times( columnCount, ( columnIndex ) => {
									if ( columnIndex > THRESHOLD_PREVIEW_TABLE_COL ) return;
									return <th key={ columnIndex } style={ { height: cellHeight } } />;
								} ) }
							</tr>
						</thead>
					) }
					<tbody>
						{ times( rowCount, ( rowIndex ) => {
							if ( rowIndex > THRESHOLD_PREVIEW_TABLE_ROW ) return;
							return (
								<tr key={ rowIndex }>
									{ times( Math.min( columnCount, MAX_PREVIEW_TABLE_COL ), ( columnIndex ) => {
										if ( columnIndex > THRESHOLD_PREVIEW_TABLE_COL ) return;
										return <td key={ columnIndex } style={ { height: cellHeight } } />;
									} ) }
								</tr>
							);
						} ) }
					</tbody>
					{ footerSection && rowCount && columnCount && (
						<tfoot>
							<tr>
								{ times( columnCount, ( columnIndex ) => {
									if ( columnIndex > THRESHOLD_PREVIEW_TABLE_COL ) return;
									return <td key={ columnIndex } style={ { height: cellHeight } } />;
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
						type="number"
						label={ __( 'Column count', 'flexible-table-block' ) }
						value={ columnCount }
						onChange={ onChangeColumnCount }
						min="1"
						max={ MAX_PREVIEW_TABLE_COL }
					/>
					<TextControl
						type="number"
						label={ __( 'Row count', 'flexible-table-block' ) }
						value={ rowCount }
						onChange={ onChangeRowCount }
						min="1"
						max={ MAX_PREVIEW_TABLE_ROW }
					/>
					<Button variant="primary" type="submit">
						{ __( 'Create Table', 'flexible-table-block' ) }
					</Button>
				</div>
			</form>
		</Placeholder>
	);
}
