/**
 * External dependencies
 */
import type { Property } from 'csstype';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	BaseControl,
	Button,
	ButtonGroup,
	TextControl,
	// @ts-ignore
	__experimentalUnitControl as UnitControl,
	// @ts-ignore
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
import type {
	CellTagValue,
	TextAlignValue,
	VerticalAlignValue,
	SectionName,
	BlockAttributes,
} from '../BlockAttributes';
import type { VTable, VCell } from '../utils/table-state';
import type { CornerProps, DirectionProps } from '../utils/style-picker';

export default function TableCellSettings( {
	vTable,
	selectedCells = [],
	setAttributes,
}: {
	vTable: VTable;
	selectedCells: VCell[] | undefined;
	setAttributes: ( attrs: Partial< BlockAttributes > ) => void;
} ) {
	const cellWidthUnits = useCustomUnits( { availableUnits: CELL_WIDTH_UNITS } );
	const fontSizeUnits = useCustomUnits( { availableUnits: FONT_SIZE_UNITS } );

	if ( ! selectedCells.length ) return null;

	const { sectionName, rowIndex, vColIndex } = selectedCells[ 0 ];

	const targetCell = vTable[ sectionName as SectionName ][ rowIndex ].cells[ vColIndex ];

	if ( ! targetCell ) return null;

	const cellStylesObj = convertToObject( targetCell.styles );

	const updateCellsState = ( state: { styles?: any; tag?: CellTagValue; className?: string } ) => {
		const newVTable = updateCells( vTable, state, selectedCells );
		setAttributes( toTableAttributes( newVTable ) );
	};

	const onChangeFontSize = ( value: string ) => {
		updateCellsState( { styles: { fontSize: sanitizeUnitValue( value ) } } );
	};

	const onChangeLineHeight = ( value: Property.LineHeight ) => {
		updateCellsState( { styles: { lineHeight: value } } );
	};

	const onChangeColor = ( value: Property.Color ) => {
		updateCellsState( { styles: { color: value } } );
	};

	const onChangeBackgroundColor = ( value: Property.BackgroundColor ) => {
		updateCellsState( { styles: { backgroundColor: value } } );
	};

	const onChangeWidth = ( value: Property.Width ) => {
		updateCellsState( { styles: { width: sanitizeUnitValue( value ) } } );
	};

	const onChangePadding = ( values: Partial< DirectionProps > ) => {
		updateCellsState( { styles: { padding: values } } );
	};

	const onChangeBorderWidth = ( values: Partial< DirectionProps > ) => {
		updateCellsState( { styles: { borderWidth: values } } );
	};

	const onChangeBorderRadius = ( values: Partial< CornerProps > ) => {
		updateCellsState( { styles: { borderRadius: values } } );
	};

	const onChangeBorderStyle = ( values: Partial< DirectionProps > ) => {
		updateCellsState( { styles: { borderStyle: values } } );
	};

	const onChangeBorderColor = ( values: Partial< DirectionProps > ) => {
		updateCellsState( { styles: { borderColor: values } } );
	};

	const onChangeTextAlign = ( value: TextAlignValue ) => {
		updateCellsState( {
			styles: { textAlign: value === cellStylesObj.textAlign ? undefined : value },
		} );
	};

	const onChangeVerticalAlign = ( value: VerticalAlignValue ) => {
		updateCellsState( {
			styles: { verticalAlign: value === cellStylesObj.verticalAlign ? undefined : value },
		} );
	};

	const onChangeTag = ( value: CellTagValue ) => {
		updateCellsState( { tag: value } );
	};

	const onChangeClass = ( value: string ) => {
		updateCellsState( { className: value !== '' ? value : undefined } );
	};

	const onResetCellSettings = () => {
		updateCellsState( {
			tag: sectionName === 'head' ? 'th' : 'td',
			styles: {
				fontSize: undefined,
				lineHeight: undefined,
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
				id="flexible-table-block-cell-clear-settings"
				className="ftb-reset-settings-control"
			>
				<Button isLink isDestructive onClick={ onResetCellSettings }>
					{ __( 'Clear Cell Settings', 'flexible-table-block' ) }
				</Button>
			</BaseControl>
			<div className="ftb-base-control-row">
				<BaseControl
					id="flexible-table-block-cell-font-size"
					label={ __( 'Cell Font Size', 'flexible-table-block' ) }
					className="ftb-font-size-control"
				>
					<UnitControl
						id="flexible-table-block-cell-font-size"
						value={ cellStylesObj?.fontSize }
						units={ fontSizeUnits }
						min="0"
						onChange={ onChangeFontSize }
					/>
				</BaseControl>
				<BaseControl id="flexible-table-block-cell-line-height" className="ftb-line-height-control">
					<TextControl
						label={ __( 'Cell Line Height', 'flexible-table-block' ) }
						value={ cellStylesObj?.lineHeight || '' }
						autoComplete="off"
						type="number"
						step={ 0.1 }
						min={ 0 }
						onChange={ onChangeLineHeight }
					/>
				</BaseControl>
			</div>
			<BaseControl id="flexible-table-block-cell-width" className="ftb-width-control">
				<div aria-labelledby="flexible-table-block-cell-width-heading" role="region">
					<span id="flexible-table-block-cell-width-heading" className="ftb-base-control-label">
						{ __( 'Cell Width', 'flexible-table-block' ) }
					</span>
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
									isSmall
									onClick={ () => onChangeWidth( isPressed ? '' : `${ perWidth }%` ) }
								>
									{ `${ perWidth }%` }
								</Button>
							);
						} ) }
					</ButtonGroup>
				</div>
			</BaseControl>
			<hr />
			<ColorControl
				id="flexible-table-block-cell-text-color"
				label={ __( 'Cell Text Color', 'flexible-table-block' ) }
				value={ cellStylesObj.color }
				onChange={ onChangeColor }
			/>
			<ColorControl
				id="flexible-table-block-cell-background-color"
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
				id="flexible-table-block-cell-padding"
				label={ __( 'Cell Padding', 'flexible-table-block' ) }
				values={ pickPadding( cellStylesObj ) }
				onChange={ onChangePadding }
			/>
			<hr />
			<BorderRadiusControl
				id="flexible-table-block-cell-border-radius"
				label={ __( 'Cell Border Radius', 'flexible-table-block' ) }
				values={ pickBorderRadius( cellStylesObj ) }
				onChange={ onChangeBorderRadius }
			/>
			<BorderWidthControl
				id="flexible-table-block-cell-border-width"
				label={ __( 'Cell Border Width', 'flexible-table-block' ) }
				values={ pickBorderWidth( cellStylesObj ) }
				onChange={ onChangeBorderWidth }
			/>
			<BorderStyleControl
				id="flexible-table-block-cell-border-style"
				label={ __( 'Cell Border Style', 'flexible-table-block' ) }
				values={ pickBorderStyle( cellStylesObj ) }
				onChange={ onChangeBorderStyle }
			/>
			<BorderColorControl
				id="flexible-table-block-cell-border-color"
				label={ __( 'Cell Border Color', 'flexible-table-block' ) }
				values={ pickBorderColor( cellStylesObj ) }
				onChange={ onChangeBorderColor }
			/>
			<hr />
			<BaseControl id="flexible-table-block-cell-text-align">
				<div aria-labelledby="flexible-table-block-cell-text-align-heading" role="region">
					<span
						id="flexible-table-block-cell-text-align-heading"
						className="ftb-base-control-label"
					>
						{ __( 'Cell Alignment', 'flexible-table-block' ) }
					</span>
					<div className="ftb-base-control-field-row">
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
										onClick={ () => onChangeVerticalAlign( value ) }
									/>
								);
							} ) }
						</ButtonGroup>
					</div>
				</div>
			</BaseControl>
			<hr />
			<BaseControl id="flexible-table-block-cell-tag">
				<div aria-labelledby="flexible-table-block-cell-tag-heading" role="region">
					<span id="flexible-table-block-cell-tag-heading" className="ftb-base-control-label">
						{ __( 'Cell Tag', 'flexible-table-block' ) }
					</span>
					<ButtonGroup className="ftb-button-group">
						{ CELL_TAG_CONTROLS.map( ( { label, value } ) => {
							return (
								<Button
									key={ value }
									isPrimary={ value === targetCell.tag }
									isSecondary={ value !== targetCell.tag }
									onClick={ () => onChangeTag( value ) }
								>
									{ label }
								</Button>
							);
						} ) }
					</ButtonGroup>
				</div>
			</BaseControl>
			<TextControl
				label={ __( 'Cell CSS class(es)', 'flexible-table-block' ) }
				autoComplete="off"
				value={ targetCell.className || '' }
				onChange={ onChangeClass }
				help={ __( 'Separate multiple classes with spaces.' ) }
			/>
		</>
	);
}
