/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	BaseControl,
	Button,
	ButtonGroup,
	ColorPalette,
	__experimentalUnitControl as UnitControl,
	__experimentalUseCustomUnits as useCustomUnits,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';

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
} from '../controls';
import { toUnitVal } from '../utils/helper';
import { updateCellsState } from '../utils/table-state';
import { convertToObject } from '../utils/style-converter';
import {
	pickPadding,
	pickBorderWidth,
	pickBorderRadius,
	pickBorderStyle,
	pickBorderColor,
} from '../utils/style-picker';

export default function TableCellSettings( props ) {
	const { vTable, selectedCell, selectedCells, attributes, setAttributes } = props;

	const cellWidthUnits = useCustomUnits( { availableUnits: CELL_WIDTH_UNITS } );
	const fontSizeUnits = useCustomUnits( { availableUnits: FONT_SIZE_UNITS } );

	const colors = useSelect( ( select ) => {
		const { getSettings } = select( blockEditorStore );
		return get( getSettings(), [ 'colors' ], [] );
	} );

	if ( ! selectedCell ) return null;

	const { sectionName, rowIndex, colIndex } = selectedCell;

	const targetCell = attributes[ sectionName ][ rowIndex ].cells[ colIndex ];

	if ( ! targetCell ) return null;

	const cellStylesObj = convertToObject( targetCell.styles );

	const updateCellsStyle = ( styles ) => {
		setAttributes( updateCellsState( vTable, { styles }, { selectedCells } ) );
	};

	const onChangeFontSize = ( value ) => {
		updateCellsStyle( { fontSize: toUnitVal( value ) } );
	};

	const onChangeColor = ( value ) => {
		updateCellsStyle( { color: value } );
	};

	const onChangeBackgroundColor = ( value ) => {
		updateCellsStyle( { backgroundColor: value } );
	};

	const onChangeWidth = ( value ) => {
		updateCellsStyle( { width: toUnitVal( value ) } );
	};

	const onChangePadding = ( values ) => {
		updateCellsStyle( { padding: values } );
	};

	const onChangeBorderWidth = ( values ) => {
		updateCellsStyle( { borderWidth: values } );
	};

	const onChangeBorderRadius = ( values ) => {
		updateCellsStyle( { borderRadius: values } );
	};

	const onChangeBorderStyle = ( values ) => {
		updateCellsStyle( { borderStyle: values } );
	};

	const onChangeBorderColor = ( values ) => {
		updateCellsStyle( { borderColor: values } );
	};

	const onChangeTextAlign = ( value ) => {
		const newValue = value === cellStylesObj.textAlign ? undefined : value;
		updateCellsStyle( { textAlign: newValue } );
	};

	const onChangeVerticalAlign = ( value ) => {
		const newValue = value === cellStylesObj.verticalAlign ? undefined : value;
		updateCellsStyle( { verticalAlign: newValue } );
	};

	const onChangeTag = ( value ) => {
		setAttributes( updateCellsState( vTable, { tag: value }, { selectedCells } ) );
	};

	const onResetCellSettings = () => {
		updateCellsStyle( {
			fontSize: undefined,
			color: undefined,
			backgroundColor: undefined,
			width: undefined,
			padding: { top: undefined, right: undefined, bottom: undefined, left: undefined },
			borderWidth: { top: undefined, right: undefined, bottom: undefined, left: undefined },
			borderRadius: {
				topLeft: undefined,
				topRight: undefined,
				bottomRight: undefined,
				bottomLeft: undefined,
			},
			borderStyle: { top: undefined, right: undefined, bottom: undefined, left: undefined },
			borderColor: { top: undefined, right: undefined, bottom: undefined, left: undefined },
			textAlign: undefined,
			verticalAlign: undefined,
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
			<BaseControl
				id="flexible-table-block/cell-text-color"
				label={ __( 'Cell Text Color', 'flexible-table-block' ) }
			>
				<ColorPalette colors={ colors } value={ cellStylesObj.color } onChange={ onChangeColor } />
			</BaseControl>
			<BaseControl
				id="flexible-table-block/cell-background-color"
				label={ __( 'Cell Background Color', 'flexible-table-block' ) }
			>
				<ColorPalette
					colors={ [
						...colors,
						{
							name: __( 'Transparent', 'flexible-table-block' ),
							slug: 'transparent',
							color: 'transparent',
						},
					] }
					value={ cellStylesObj.backgroundColor }
					onChange={ onChangeBackgroundColor }
				/>
			</BaseControl>
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
				id="flexible-table-block/table-border-collapse"
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
		</>
	);
}
