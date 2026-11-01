/**
 * External dependencies
 */
import type { Property } from 'csstype';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
	__experimentalUnitControl as UnitControl,
	__experimentalUseCustomUnits as useCustomUnits,
} from '@wordpress/components';
import { Button, Fieldset, InputControl, SelectControl, Stack } from '@wordpress/ui';

/**
 * Internal dependencies
 */
import {
	SIZE_UNITS,
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
	PercentageWidthControl,
} from '../controls';
import {
	toTableAttributes,
	updateCells,
	type VTable,
	type VSelectedCells,
	type CellState,
} from '../utils/table-state';
import { convertToObject } from '../utils/style-converter';
import {
	pickFourSides,
	BORDER_COLOR_STYLE,
	BORDER_RADIUS_STYLE,
	BORDER_STYLE_STYLE,
	BORDER_WIDTH_STYLE,
	PADDING_STYLE,
	type CornerProps,
	type DirectionProps,
} from '../utils/style-picker';
import { sanitizeUnitValue } from '../utils/helper';
import type {
	CellTagValue,
	CellScopeValue,
	SectionName,
	BlockAttributes,
} from '../BlockAttributes';

type Props = {
	setAttributes: ( attrs: Partial< BlockAttributes > ) => void;
	vTable: VTable;
	selectedCells: VSelectedCells;
};

export default function TableCellSettings( { setAttributes, vTable, selectedCells = [] }: Props ) {
	const sizeUnits = useCustomUnits( { availableUnits: SIZE_UNITS } );

	if ( ! selectedCells.length ) {
		return null;
	}

	const { sectionName, rowIndex, vColIndex } = selectedCells[ 0 ];

	const targetCell = vTable[ sectionName as SectionName ][ rowIndex ].cells[ vColIndex ];

	if ( ! targetCell ) {
		return null;
	}

	const selectedCellTags = selectedCells.reduce( ( result: CellTagValue[], selectedCell ) => {
		const { tag } =
			vTable[ selectedCell.sectionName ][ selectedCell.rowIndex ].cells[ selectedCell.vColIndex ];
		if ( ! result.includes( tag ) ) {
			result.push( tag );
		}
		return result;
	}, [] );

	const cellStylesObj = convertToObject( targetCell.styles );

	const updateCellsState = ( state: CellState ) => {
		const newVTable = updateCells( vTable, state, selectedCells );
		setAttributes( toTableAttributes( newVTable ) );
	};

	const onChangeFontSize = ( value: string | undefined ) => {
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

	const onChangeWidth = ( value: string | number | undefined ) => {
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

	const onChangeTextAlign = ( value: string | number | undefined ) => {
		updateCellsState( {
			styles: { textAlign: value },
		} );
	};

	const onChangeVerticalAlign = ( value: string | number | undefined ) => {
		updateCellsState( {
			styles: { verticalAlign: value },
		} );
	};

	const onChangeTag = ( value: string | number | undefined ) => {
		const isAllowedTag = ( _value: any ): _value is CellTagValue => {
			return CELL_TAG_CONTROLS.some( ( control ) => control.value === _value );
		};
		if ( isAllowedTag( value ) ) {
			updateCellsState( { tag: value, id: undefined, headers: undefined, scope: undefined } );
		}
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
		updateCellsState( { scope: 'none' === value ? undefined : value } );
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
			<Stack
				align="center"
				justify="flex-end"
				className="ftb-table-cell-settings-clear"
				style={ { marginBottom: '16px' } }
			>
				<Button variant="minimal" size="small" onClick={ onResetCellSettings }>
					{ __( 'Clear cell settings', 'flexible-table-block' ) }
				</Button>
			</Stack>
			<Stack align="center" justify="space-between" gap="sm" style={ { marginBottom: '16px' } }>
				<div className="ftb-table-cell-settings-font-size" style={ { flex: 1 } }>
					<UnitControl
						label={ __( 'Cell font size', 'flexible-table-block' ) }
						value={ cellStylesObj?.fontSize }
						units={ sizeUnits }
						min={ 0 }
						onChange={ onChangeFontSize }
					/>
				</div>
				<div className="ftb-table-cell-settings-line-height" style={ { flex: 1 } }>
					<InputControl
						label={ __( 'Cell line height', 'flexible-table-block' ) }
						value={ cellStylesObj?.lineHeight || '' }
						autoComplete="off"
						type="number"
						step={ 0.1 }
						min={ 0 }
						onValueChange={ onChangeLineHeight }
					/>
				</div>
			</Stack>
			<UnitControl
				className="ftb-table-cell-settings-width"
				label={ __( 'Cell width', 'flexible-table-block' ) }
				value={ cellStylesObj?.width }
				units={ sizeUnits }
				min={ 0 }
				onChange={ onChangeWidth }
				__unstableInputWidth="calc(50% - 4px)"
			/>
			<PercentageWidthControl
				className="ftb-table-cell-settings-percentage-width"
				label={ __( 'Cell percentage width', 'flexible-table-block' ) }
				value={ cellStylesObj?.width }
				onChange={ onChangeWidth }
			/>
			<hr />
			<ColorControl
				className="ftb-table-cell-settings-text-color"
				label={ __( 'Cell text color', 'flexible-table-block' ) }
				value={ cellStylesObj.color }
				onChange={ onChangeColor }
			/>
			<ColorControl
				className="ftb-table-cell-settings-background-color"
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
				className="ftb-table-cell-settings-padding"
				label={ __( 'Cell padding', 'flexible-table-block' ) }
				values={ pickFourSides( cellStylesObj, PADDING_STYLE ) }
				onChange={ onChangePadding }
			/>
			<hr />
			<BorderRadiusControl
				className="ftb-table-cell-settings-border-radius"
				label={ __( 'Cell border radius', 'flexible-table-block' ) }
				values={ pickFourSides( cellStylesObj, BORDER_RADIUS_STYLE ) }
				onChange={ onChangeBorderRadius }
			/>
			<BorderWidthControl
				className="ftb-table-cell-settings-border-width"
				label={ __( 'Cell border width', 'flexible-table-block' ) }
				values={ pickFourSides( cellStylesObj, BORDER_WIDTH_STYLE ) }
				onChange={ onChangeBorderWidth }
			/>
			<BorderStyleControl
				className="ftb-table-cell-settings-border-style"
				label={ __( 'Cell border style', 'flexible-table-block' ) }
				values={ pickFourSides( cellStylesObj, BORDER_STYLE_STYLE ) }
				onChange={ onChangeBorderStyle }
			/>
			<BorderColorControl
				className="ftb-table-cell-settings-border-color"
				label={ __( 'Cell border color', 'flexible-table-block' ) }
				values={ pickFourSides( cellStylesObj, BORDER_COLOR_STYLE ) }
				onChange={ onChangeBorderColor }
			/>
			<hr />
			<Fieldset.Root className="ftb-table-cell-settings-alignment">
				<Fieldset.Legend>{ __( 'Cell alignment', 'flexible-table-block' ) }</Fieldset.Legend>
				<Stack align="flex-start" gap="sm" style={ { marginBottom: '-16px' } }>
					<ToggleGroupControl
						hideLabelFromVision
						label={ __( 'Text alignment', 'flexible-table-block' ) }
						value={ cellStylesObj?.textAlign }
						isDeselectable
						onChange={ onChangeTextAlign }
					>
						{ TEXT_ALIGNMENT_CONTROLS.map( ( { icon, label, value } ) => (
							<ToggleGroupControlOptionIcon
								key={ value }
								value={ value }
								icon={ icon }
								label={ label }
							/>
						) ) }
					</ToggleGroupControl>
					<ToggleGroupControl
						hideLabelFromVision
						label={ __( 'Vertical alignment', 'flexible-table-block' ) }
						value={ cellStylesObj?.verticalAlign }
						isDeselectable
						onChange={ onChangeVerticalAlign }
					>
						{ VERTICAL_ALIGNMENT_CONTROLS.map( ( { icon, label, value } ) => (
							<ToggleGroupControlOptionIcon
								key={ value }
								value={ value }
								icon={ icon }
								label={ label }
							/>
						) ) }
					</ToggleGroupControl>
				</Stack>
			</Fieldset.Root>
			<hr />
			<ToggleGroupControl
				className="ftb-table-cell-settings-tag"
				label={ __( 'Cell tag', 'flexible-table-block' ) }
				value={ targetCell.tag }
				isBlock
				onChange={ onChangeTag }
			>
				{ CELL_TAG_CONTROLS.map( ( { label, value } ) => (
					<ToggleGroupControlOption key={ value } value={ value } label={ label } />
				) ) }
			</ToggleGroupControl>
			<InputControl
				className="ftb-table-cell-settings-custom-class"
				label={ __( 'Cell CSS class(es)', 'flexible-table-block' ) }
				autoComplete="off"
				value={ targetCell.className || '' }
				onValueChange={ onChangeClass }
				description={ __( 'Separate multiple classes with spaces.', 'flexible-table-block' ) }
			/>
			{ selectedCellTags.length === 1 && (
				<>
					<hr />
					<Stack direction="column" gap="lg">
						{ selectedCellTags.includes( 'th' ) && (
							<InputControl
								className="ftb-table-cell-settings-id"
								label={ __( 'id attribute', 'flexible-table-block' ) }
								autoComplete="off"
								value={ targetCell.id || '' }
								onValueChange={ onChangeId }
							/>
						) }
						<InputControl
							className="ftb-table-cell-settings-headers"
							label={ __( 'headers attribute', 'flexible-table-block' ) }
							autoComplete="off"
							value={ targetCell.headers || '' }
							onValueChange={ onChangeHeaders }
						/>
						{ selectedCellTags.includes( 'th' ) && (
							<SelectControl
								className="ftb-table-cell-settings-scope"
								label={ __( 'scope attribute', 'flexible-table-block' ) }
								items={ [ ...CELL_SCOPE_CONTROLS ] }
								value={
									CELL_SCOPE_CONTROLS.find(
										( control ) => control.value === ( targetCell.scope ?? 'none' )
									) ?? null
								}
								onValueChange={ ( item ) => onChangeScope( item?.value as CellScopeValue ) }
							/>
						) }
					</Stack>
				</>
			) }
		</>
	);
}
