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
 * Internal components
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
import { convertToObject } from '../utils/style-converter';
import {
	pickPadding,
	pickBorderWidth,
	pickBorderRadius,
	pickBorderStyle,
	pickBorderColor,
} from '../utils/style-picker';
import {
	updatePadding,
	updateBorderWidthStyles,
	updateBorderRadius,
	updateBorderStyle,
	updateBorderColor,
} from '../utils/style-updater';

export default function TableCellSettings( props ) {
	const { tableStylesObj, selectedCell, attributes, setAttributes } = props;

	const cellWidthUnits = useCustomUnits( {
		availableUnits: CELL_WIDTH_UNITS,
	} );

	const fontSizeUnits = useCustomUnits( {
		availableUnits: FONT_SIZE_UNITS,
	} );

	const colors = useSelect( ( select ) => {
		const { getSettings } = select( blockEditorStore );
		return get( getSettings(), [ 'colors' ], [] );
	} );

	if ( ! selectedCell ) return null;

	const { sectionName, rowIndex, columnIndex } = selectedCell;

	const targetCell = attributes[ sectionName ][ rowIndex ].cells[ columnIndex ];

	if ( ! targetCell ) return null;

	const cellStylesObj = convertToObject( targetCell.styles );

	const onChangeFontSize = ( value ) => {
		// const newStylesObj = {
		// 	...tableStylesObj,
		// 	width: toUnitVal( value ),
		// };
		// setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeColor = ( value ) => {
		console.log( value );

		// const newStylesObj = {
		// 	...tableStylesObj,
		// 	width: toUnitVal( value ),
		// };
		// setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeBackgroundColor = ( value ) => {
		// const newStylesObj = {
		// 	...tableStylesObj,
		// 	width: toUnitVal( value ),
		// };
		// setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeWidth = ( value ) => {
		// const newStylesObj = {
		// 	...tableStylesObj,
		// 	width: toUnitVal( value ),
		// };
		// setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangePadding = ( values ) => {
		// const newStylesObj = updatePadding( tableStylesObj, values );
		// setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeBorderWidth = ( values ) => {
		// const newStylesObj = updateBorderWidthStyles( tableStylesObj, values );
		// setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeBorderRadius = ( values ) => {
		// const newStylesObj = updateBorderRadius( tableStylesObj, values );
		// setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeBorderStyle = ( values ) => {
		// const newStylesObj = updateBorderStyle( tableStylesObj, values );
		// setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeBorderColor = ( values ) => {
		// const newStylesObj = updateBorderColor( tableStylesObj, values );
		// setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeTextAlign = ( value ) => {
		// const newStylesObj = {
		// 	...tableStylesObj,
		// 	width: toUnitVal( value ),
		// };
		// setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeVerticalAlign = ( value ) => {
		// const newStylesObj = {
		// 	...tableStylesObj,
		// 	width: toUnitVal( value ),
		// };
		// setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeTag = ( value ) => {
		// const newStylesObj = updateBorderColor( tableStylesObj, values );
		// setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	return (
		<>
			<BaseControl
				id="flexible-table-block/cell-font-size"
				label={ __( 'Cell Font size', 'flexible-table-block' ) }
			>
				<UnitControl min="0" onChange={ onChangeFontSize } units={ fontSizeUnits } />
			</BaseControl>
			<BaseControl
				id="flexible-table-block/cell-width"
				label={ __( 'Cell Width', 'flexible-table-block' ) }
			>
				<UnitControl
					units={ cellWidthUnits }
					labelPosition="top"
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
				<ColorPalette colors={ colors } onChange={ onChangeColor } />
			</BaseControl>
			<BaseControl
				id="flexible-table-block/cell-background-color"
				label={ __( 'Cell Background Color', 'flexible-table-block' ) }
			>
				<ColorPalette colors={ colors } onChange={ onChangeBackgroundColor } />
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
