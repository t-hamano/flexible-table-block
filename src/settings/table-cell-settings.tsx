/**
 * External dependencies
 */
import type { Property } from 'csstype';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { createInterpolateElement } from '@wordpress/element';
import {
	BaseControl,
	Button,
	ButtonGroup,
	TextControl,
	// @ts-ignore: has no exported member
	__experimentalUnitControl as UnitControl,
	// @ts-ignore: has no exported member
	__experimentalUseCustomUnits as useCustomUnits,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import {
	FONT_SIZE_UNITS,
	CELL_WIDTH_UNITS,
	CELL_TAG_CONTROLS,
	CELL_SCOPE_CONTROLS,
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
import {
	toTableAttributes,
	updateCells,
	type VTable,
	type VSelectedCells,
} from '../utils/table-state';
import { convertToObject } from '../utils/style-converter';
import {
	pickPadding,
	pickBorderWidth,
	pickBorderRadius,
	pickBorderStyle,
	pickBorderColor,
	type CornerProps,
	type DirectionProps,
} from '../utils/style-picker';
import { sanitizeUnitValue } from '../utils/helper';
import type {
	CellTagValue,
	CellScopeValue,
	TextAlignValue,
	VerticalAlignValue,
	SectionName,
	BlockAttributes,
} from '../BlockAttributes';

type Props = {
	setAttributes: ( attrs: Partial< BlockAttributes > ) => void;
	vTable: VTable;
	selectedCells: VSelectedCells;
};

export default function TableCellSettings( { setAttributes, vTable, selectedCells = [] }: Props ) {
	const cellWidthUnits = useCustomUnits( { availableUnits: CELL_WIDTH_UNITS } );
	const fontSizeUnits = useCustomUnits( { availableUnits: FONT_SIZE_UNITS } );

	if ( ! selectedCells.length ) {
		return null;
	}

	const { sectionName, rowIndex, vColIndex } = selectedCells[ 0 ];

	const targetCell = vTable[ sectionName as SectionName ][ rowIndex ].cells[ vColIndex ];

	if ( ! targetCell ) {
		return null;
	}

	const selectedCellTags: ( 'th' | 'td' )[] = selectedCells.reduce(
		( result: CellTagValue[], selectedCell ) => {
			const { tag } =
				vTable[ selectedCell.sectionName ][ selectedCell.rowIndex ].cells[ selectedCell.vColIndex ];
			if ( ! result.includes( tag ) ) {
				result.push( tag );
			}
			return result;
		},
		[]
	);

	const cellStylesObj = convertToObject( targetCell.styles );

	const updateCellsState = ( state: {
		styles?: any;
		tag?: CellTagValue;
		className?: string;
		id?: string;
		headers?: string;
		scope?: CellScopeValue;
	} ) => {
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
		updateCellsState( { tag: value, id: undefined, headers: undefined, scope: undefined } );
	};

	const onChangeClass = ( value: string ) => {
		updateCellsState( { className: value !== '' ? value : undefined } );
	};

	const onChangeId = ( value: string ) => {
		updateCellsState( { id: value !== '' ? value : undefined } );
	};

	const onChangeHeaders = ( value: string ) => {
		updateCellsState( { headers: value !== '' ? value : undefined } );
	};

	const onChangeScope = ( value: CellScopeValue ) => {
		updateCellsState( { scope: value === targetCell.scope ? undefined : value } );
	};

	const onResetCellSettings = () => {
		updateCellsState( {
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
			className: undefined,
			id: undefined,
			headers: undefined,
			scope: undefined,
		} );
	};

	return (
		<>
			<BaseControl
				id="flexible-table-block-cell-clear-settings"
				className="ftb-reset-settings-control"
			>
				<Button variant="link" isDestructive onClick={ onResetCellSettings }>
					{ __( 'Clear cell settings', 'flexible-table-block' ) }
				</Button>
			</BaseControl>
			<div className="ftb-base-control-row">
				<BaseControl
					id="flexible-table-block-cell-font-size"
					label={ __( 'Cell font size', 'flexible-table-block' ) }
					className="ftb-font-size-control"
				>
					<UnitControl
						id="flexible-table-block-cell-font-size"
						value={ cellStylesObj?.fontSize }
						units={ fontSizeUnits }
						min="0"
						onChange={ onChangeFontSize }
						size="__unstable-large"
					/>
				</BaseControl>
				<BaseControl id="flexible-table-block-cell-line-height" className="ftb-line-height-control">
					<TextControl
						className="ftb-is-next-40px-default-size"
						label={ __( 'Cell line height', 'flexible-table-block' ) }
						value={ cellStylesObj?.lineHeight || '' }
						autoComplete="off"
						type="number"
						step={ 0.1 }
						min={ 0 }
						onChange={ onChangeLineHeight }
					/>
				</BaseControl>
			</div>
			<BaseControl
				id="flexible-table-block-cell-width"
				label={ __( 'Cell width', 'flexible-table-block' ) }
				className="ftb-width-control"
			>
				<UnitControl
					id="flexible-table-block-cell-width"
					aria-label={ __( 'Cell width', 'flexible-table-block' ) }
					value={ cellStylesObj?.width }
					units={ cellWidthUnits }
					min="0"
					onChange={ onChangeWidth }
					size="__unstable-large"
				/>
				<ButtonGroup
					aria-label={ __( 'Cell percentage width', 'flexible-table-block' ) }
					className="ftb-percent-group"
				>
					{ [ 25, 50, 75, 100 ].map( ( perWidth ) => {
						const isPressed = cellStylesObj?.width === `${ perWidth }%`;
						return (
							<Button
								key={ perWidth }
								variant={ isPressed ? 'primary' : undefined }
								onClick={ () => onChangeWidth( isPressed ? '' : `${ perWidth }%` ) }
								// @ts-ignore: `size` prop is not exist at @types
								size="small"
							>
								{ `${ perWidth }%` }
							</Button>
						);
					} ) }
				</ButtonGroup>
			</BaseControl>
			<hr />
			<ColorControl
				id="flexible-table-block-cell-text-color"
				label={ __( 'Cell text color', 'flexible-table-block' ) }
				value={ cellStylesObj.color }
				onChange={ onChangeColor }
			/>
			<ColorControl
				id="flexible-table-block-cell-background-color"
				label={ __( 'Cell background color', 'flexible-table-block' ) }
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
				label={ __( 'Cell padding', 'flexible-table-block' ) }
				values={ pickPadding( cellStylesObj ) }
				onChange={ onChangePadding }
			/>
			<hr />
			<BorderRadiusControl
				id="flexible-table-block-cell-border-radius"
				label={ __( 'Cell border radius', 'flexible-table-block' ) }
				values={ pickBorderRadius( cellStylesObj ) }
				onChange={ onChangeBorderRadius }
			/>
			<BorderWidthControl
				id="flexible-table-block-cell-border-width"
				label={ __( 'Cell border width', 'flexible-table-block' ) }
				values={ pickBorderWidth( cellStylesObj ) }
				onChange={ onChangeBorderWidth }
			/>
			<BorderStyleControl
				id="flexible-table-block-cell-border-style"
				label={ __( 'Cell border style', 'flexible-table-block' ) }
				values={ pickBorderStyle( cellStylesObj ) }
				onChange={ onChangeBorderStyle }
			/>
			<BorderColorControl
				id="flexible-table-block-cell-border-color"
				label={ __( 'Cell border color', 'flexible-table-block' ) }
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
						{ __( 'Cell alignment', 'flexible-table-block' ) }
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
										variant={ value === cellStylesObj?.textAlign ? 'primary' : 'secondary' }
										onClick={ () => onChangeTextAlign( value ) }
										/// @ts-ignore: `size` prop is not exist at @types
										size="compact"
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
										variant={ value === cellStylesObj?.verticalAlign ? 'primary' : 'secondary' }
										onClick={ () => onChangeVerticalAlign( value ) }
										// @ts-ignore: `size` prop is not exist at @types
										size="compact"
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
						{ __( 'Cell tag', 'flexible-table-block' ) }
					</span>
					<ButtonGroup className="ftb-button-group">
						{ CELL_TAG_CONTROLS.map( ( { label, value } ) => {
							return (
								<Button
									key={ value }
									variant={ value === targetCell.tag ? 'primary' : 'secondary' }
									onClick={ () => onChangeTag( value ) }
									// @ts-ignore: `size` prop is not exist at @types
									size="compact"
								>
									{ label }
								</Button>
							);
						} ) }
					</ButtonGroup>
				</div>
			</BaseControl>
			<TextControl
				className="ftb-is-next-40px-default-size"
				label={ __( 'Cell CSS class(es)', 'flexible-table-block' ) }
				autoComplete="off"
				value={ targetCell.className || '' }
				onChange={ onChangeClass }
				help={ __( 'Separate multiple classes with spaces.', 'flexible-table-block' ) }
			/>
			{ selectedCellTags.length === 1 && (
				<>
					<hr />
					{ selectedCellTags.includes( 'th' ) && (
						<TextControl
							className="ftb-is-next-40px-default-size"
							label={ createInterpolateElement(
								__( '<code>id</code> attribute', 'flexible-table-block' ),
								{ code: <code /> }
							) }
							autoComplete="off"
							value={ targetCell.id || '' }
							onChange={ onChangeId }
						/>
					) }
					<TextControl
						className="ftb-is-next-40px-default-size"
						label={ createInterpolateElement(
							__( '<code>headers</code> attribute', 'flexible-table-block' ),
							{ code: <code /> }
						) }
						autoComplete="off"
						value={ targetCell.headers || '' }
						onChange={ onChangeHeaders }
					/>
					{ selectedCellTags.includes( 'th' ) && (
						<BaseControl id="flexible-table-block-cell-scope">
							<div aria-labelledby="flexible-table-block-cell-scope-heading" role="region">
								<span
									id="flexible-table-block-cell-scope-heading"
									className="ftb-base-control-label"
								>
									{ createInterpolateElement(
										__( '<code>scope</code> attribute', 'flexible-table-block' ),
										{ code: <code /> }
									) }
								</span>
								<ButtonGroup className="ftb-button-group">
									{ CELL_SCOPE_CONTROLS.map( ( { label, value } ) => {
										return (
											<Button
												key={ value }
												variant={ value === targetCell.scope ? 'primary' : 'secondary' }
												onClick={ () => onChangeScope( value ) }
												// @ts-ignore: `size` prop is not exist at @types
												size="compact"
											>
												{ label }
											</Button>
										);
									} ) }
								</ButtonGroup>
							</div>
						</BaseControl>
					) }
				</>
			) }
		</>
	);
}
