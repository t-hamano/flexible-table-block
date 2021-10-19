/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	BaseControl,
	Button,
	ButtonGroup,
	TextControl,
	__experimentalUnitControl as UnitControl,
	__experimentalUseCustomUnits as useCustomUnits,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import {
	FONT_SIZE_UNITS,
	CELL_WIDTH_UNITS,
	CELL_TAG_CONTROLS,
	TEXT_ALIGNMENT_CONTROLS,
	VERTICAL_ALIGNMENT_CONTROLS,
} from '../constants';
import {
	BorderRadiusControl,
	BorderWidthControl,
	BorderStyleControl,
	BorderColorControl,
	PaddingControl,
	ColorControl,
} from '../controls';
import { toTableAttributes, updateCells } from '../utils/table-state';
import { convertToObject } from '../utils/style-converter';
import {
	pickPadding,
	pickBorderWidth,
	pickBorderRadius,
	pickBorderStyle,
	pickBorderColor,
} from '../utils/style-picker';
import { sanitizeUnitValue } from '../utils/helper';

export default function TableCellSettings( props ) {
	const { vTable, selectedCells, setAttributes } = props;

	const cellWidthUnits = useCustomUnits( { availableUnits: CELL_WIDTH_UNITS } );
	const fontSizeUnits = useCustomUnits( { availableUnits: FONT_SIZE_UNITS } );

	if ( ! ( selectedCells || [] ).length ) return null;

	const { sectionName, rowIndex, vColIndex } = selectedCells[ 0 ];

	const targetCell = vTable[ sectionName ][ rowIndex ].cells[ vColIndex ];

	if ( ! targetCell ) return null;

	const cellStylesObj = convertToObject( targetCell.styles );

	const updateCellsState = ( state ) => {
		const newVTable = updateCells( vTable, state, selectedCells );
		setAttributes( toTableAttributes( newVTable ) );
	};

	const onChangeFontSize = ( value ) => {
		updateCellsState( { styles: { fontSize: sanitizeUnitValue( value ) } } );
	};

	const onChangeColor = ( value ) => {
		updateCellsState( { styles: { color: value } } );
	};

	const onChangeBackgroundColor = ( value ) => {
		updateCellsState( { styles: { backgroundColor: value } } );
	};

	const onChangeWidth = ( value ) => {
		updateCellsState( { styles: { width: sanitizeUnitValue( value ) } } );
	};

	const onChangePadding = ( values ) => {
		updateCellsState( { styles: { padding: values } } );
	};

	const onChangeBorderWidth = ( values ) => {
		updateCellsState( { styles: { borderWidth: values } } );
	};

	const onChangeBorderRadius = ( values ) => {
		updateCellsState( { styles: { borderRadius: values } } );
	};

	const onChangeBorderStyle = ( values ) => {
		updateCellsState( { styles: { borderStyle: values } } );
	};

	const onChangeBorderColor = ( values ) => {
		updateCellsState( { styles: { borderColor: values } } );
	};

	const onChangeTextAlign = ( value ) => {
		updateCellsState( {
			styles: { textAlign: value === cellStylesObj.textAlign ? undefined : value },
		} );
	};

	const onChangeVerticalAlign = ( value ) => {
		updateCellsState( {
			styles: { verticalAlign: value === cellStylesObj.verticalAlign ? undefined : value },
		} );
	};

	const onChangeTag = ( value ) => {
		updateCellsState( { tag: value } );
	};

	const onChangeClass = ( value ) => {
		updateCellsState( { className: value !== '' ? value : undefined } );
	};

	const onResetCellSettings = () => {
		updateCellsState( {
			tag: sectionName === 'head' ? 'th' : 'td',
			styles: {
				fontSize: undefined,
				width: undefined,
				color: undefined,
				backgroundColor: undefined,
				padding: { top: undefined, right: undefined, bottom: undefined, left: undefined },
				borderRadius: {
					topLeft: undefined,
					topRight: undefined,
					bottomRight: undefined,
					bottomLeft: undefined,
				},
				borderWidth: { top: undefined, right: undefined, bottom: undefined, left: undefined },
				borderStyle: { top: undefined, right: undefined, bottom: undefined, left: undefined },
				borderColor: { top: undefined, right: undefined, bottom: undefined, left: undefined },
				textAlign: undefined,
				verticalAlign: undefined,
			},
		} );
	};

	return (
		<>
			<BaseControl
				id="flexible-table-block/clear-cell-settings"
				className="ftb-reset-settings-control"
			>
				<Button isLink variant="link" isDestructive onClick={ onResetCellSettings }>
					{ __( 'Clear Cell Settings', 'flexible-table-block' ) }
				</Button>
			</BaseControl>
			<BaseControl
				id="flexible-table-block/cell-font-size"
				label={ __( 'Cell Font Size', 'flexible-table-block' ) }
			>
				<UnitControl
					value={ cellStylesObj?.fontSize }
					units={ fontSizeUnits }
					min="0"
					onChange={ onChangeFontSize }
				/>
			</BaseControl>
			<BaseControl
				id="flexible-table-block/cell-width"
				label={ __( 'Cell Width', 'flexible-table-block' ) }
			>
				<UnitControl
					value={ cellStylesObj?.width }
					units={ cellWidthUnits }
					min="0"
					onChange={ onChangeWidth }
				/>
				<ButtonGroup
					aria-label={ __( 'Cell Percentage width', 'flexible-table-block' ) }
					className="ftb-percent-group"
				>
					{ [ 25, 50, 75, 100 ].map( ( perWidth ) => {
						const isPressed = cellStylesObj?.width === `${ perWidth }%`;
						return (
							<Button
								key={ perWidth }
								isPrimary={ isPressed }
								variant={ isPressed ? 'primary' : undefined }
								isSmall
								onClick={ () => onChangeWidth( isPressed ? undefined : `${ perWidth }%` ) }
							>
								{ `${ perWidth }%` }
							</Button>
						);
					} ) }
				</ButtonGroup>
			</BaseControl>
			<hr />
			<ColorControl
				id="flexible-table-block/cell-text-color"
				label={ __( 'Cell Text Color', 'flexible-table-block' ) }
				value={ cellStylesObj.color }
				onChange={ onChangeColor }
			/>
			<ColorControl
				id="flexible-table-block/cell-background-color"
				label={ __( 'Cell Background Color', 'flexible-table-block' ) }
				value={ cellStylesObj.backgroundColor }
				colors={ [
					{
						name: __( 'Transparent', 'flexible-table-block' ),
						slug: 'transparent',
						color: 'transparent',
					},
				] }
				onChange={ onChangeBackgroundColor }
			/>
			<hr />
			<PaddingControl
				id="flexible-table-block/cell-padding"
				label={ __( 'Cell Padding', 'flexible-table-block' ) }
				values={ pickPadding( cellStylesObj ) }
				onChange={ onChangePadding }
			/>
			<hr />
			<BorderRadiusControl
				id="flexible-table-block/cell-border-radius"
				label={ __( 'Cell Border Radius', 'flexible-table-block' ) }
				values={ pickBorderRadius( cellStylesObj ) }
				onChange={ onChangeBorderRadius }
			/>
			<BorderWidthControl
				id="flexible-table-block/cell-border-width"
				label={ __( 'Cell Border Width', 'flexible-table-block' ) }
				values={ pickBorderWidth( cellStylesObj ) }
				onChange={ onChangeBorderWidth }
			/>
			<BorderStyleControl
				id="flexible-table-block/cell-border-style"
				label={ __( 'Cell Border Style', 'flexible-table-block' ) }
				values={ pickBorderStyle( cellStylesObj ) }
				onChange={ onChangeBorderStyle }
			/>
			<BorderColorControl
				id="flexible-table-block/cell-border-color"
				label={ __( 'Cell Border Color', 'flexible-table-block' ) }
				values={ pickBorderColor( cellStylesObj ) }
				onChange={ onChangeBorderColor }
			/>
			<hr />
			<BaseControl
				id="flexible-table-block/cell-text-align"
				label={ __( 'Cell Alignment', 'flexible-table-block' ) }
			>
				<div className="ftb-base-control-row">
					<ButtonGroup
						className="ftb-button-group"
						aria-label={ __( 'Text alignment', 'flexible-table-block' ) }
					>
						{ TEXT_ALIGNMENT_CONTROLS.map( ( { icon, label, value } ) => {
							return (
								<Button
									key={ value }
									label={ label }
									icon={ icon }
									isPrimary={ value === cellStylesObj?.textAlign }
									isSecondary={ value !== cellStylesObj?.textAlign }
									variant={ value === cellStylesObj?.textAlign ? 'primary' : 'secondary' }
									onClick={ () => onChangeTextAlign( value ) }
								/>
							);
						} ) }
					</ButtonGroup>
					<ButtonGroup
						className="ftb-button-group"
						aria-label={ __( 'Vertical alignment', 'flexible-table-block' ) }
					>
						{ VERTICAL_ALIGNMENT_CONTROLS.map( ( { icon, label, value } ) => {
							return (
								<Button
									key={ value }
									label={ label }
									icon={ icon }
									isPrimary={ value === cellStylesObj?.verticalAlign }
									isSecondary={ value !== cellStylesObj?.verticalAlign }
									variant={ value === cellStylesObj?.verticalAlign ? 'primary' : 'secondary' }
									onClick={ () => onChangeVerticalAlign( value ) }
								/>
							);
						} ) }
					</ButtonGroup>
				</div>
			</BaseControl>
			<hr />
			<BaseControl
				id="flexible-table-block/cell-tag"
				label={ __( 'Cell Tag', 'flexible-table-block' ) }
			>
				<ButtonGroup className="ftb-button-group">
					{ CELL_TAG_CONTROLS.map( ( { label, value } ) => {
						return (
							<Button
								key={ value }
								isPrimary={ value === targetCell.tag }
								isSecondary={ value !== targetCell.tag }
								variant={ value === targetCell.tag ? 'primary' : 'secondary' }
								onClick={ () => onChangeTag( value ) }
							>
								{ label }
							</Button>
						);
					} ) }
				</ButtonGroup>
			</BaseControl>
			<BaseControl
				id="flexible-table-block/cell-css"
				label={ __( 'Cell CSS class(es)', 'flexible-table-block' ) }
			>
				<TextControl
					autoComplete="off"
					value={ targetCell.className || '' }
					onChange={ onChangeClass }
					help={ __( 'Separate multiple classes with spaces.' ) }
				/>
			</BaseControl>
		</>
	);
}
