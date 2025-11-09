/**
 * External dependencies
 */
import type { Property, Properties } from 'csstype';
import type { Dispatch, SetStateAction } from 'react';

/**
 * WordPress dependencies
 */
import { __, _x, sprintf } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import {
	Button,
	Flex,
	SelectControl,
	ToggleControl,
	__experimentalSpacer as Spacer,
	__experimentalUnitControl as UnitControl,
	__experimentalUseCustomUnits as useCustomUnits,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
	__experimentalParseQuantityAndUnitFromRawValue as parseQuantityAndUnitFromRawValue,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import {
	STORE_NAME,
	TABLE_WIDTH_UNITS,
	TABLE_HEIGHT_UNITS,
	BORDER_COLLAPSE_CONTROLS,
	STICKY_CONTROLS,
} from '../constants';
import {
	BorderRadiusControl,
	BorderWidthControl,
	BorderStyleControl,
	BorderColorControl,
	BorderSpacingControl,
	PaddingControl,
} from '../controls';
import {
	toggleSection,
	toTableAttributes,
	type VTable,
	type VSelectedCells,
	type VSelectedLine,
} from '../utils/table-state';
import { convertToInline } from '../utils/style-converter';
import {
	pickPadding,
	pickBorderWidth,
	pickBorderRadius,
	pickBorderStyle,
	pickBorderColor,
	pickBorderSpacing,
	type CornerProps,
	type DirectionProps,
	type CrossProps,
} from '../utils/style-picker';
import {
	updatePadding,
	updateBorderWidth,
	updateBorderRadius,
	updateBorderStyle,
	updateBorderColor,
	updateBorderSpacing,
} from '../utils/style-updater';
import type { StickyValue, BlockAttributes } from '../BlockAttributes';
import type { StoreOptions } from '../store';

const PERCENTAGE_WIDTHS = [ 25, 50, 75, 100 ];

type Props = {
	attributes: BlockAttributes;
	setAttributes: ( attrs: Partial< BlockAttributes > ) => void;
	vTable: VTable;
	setSelectedCells: Dispatch< SetStateAction< VSelectedCells > >;
	setSelectedLine: Dispatch< SetStateAction< VSelectedLine > >;
	tableStylesObj: Properties;
};

export default function TableSettings( {
	attributes,
	setAttributes,
	vTable,
	setSelectedCells,
	setSelectedLine,
	tableStylesObj,
}: Props ) {
	const { hasFixedLayout, isStackedOnMobile, isScrollOnPc, isScrollOnMobile, sticky, head, foot } =
		attributes;

	const options = useSelect( ( select ) => {
		const { getOptions }: { getOptions: () => StoreOptions } = select( STORE_NAME );
		return getOptions();
	}, [] );

	const tableWidthUnits = useCustomUnits( { availableUnits: TABLE_WIDTH_UNITS } );
	const tableHeightUnits = useCustomUnits( { availableUnits: TABLE_HEIGHT_UNITS } );

	const [ parsedWidthQuantity, parsedWidthUnit ] = parseQuantityAndUnitFromRawValue(
		tableStylesObj?.width
	);
	const [ parsedMaxWidthQuantity, parsedMaxWidthUnit ] = parseQuantityAndUnitFromRawValue(
		tableStylesObj?.maxWidth
	);
	const [ parsedMinWidthQuantity, parsedMinWidthUnit ] = parseQuantityAndUnitFromRawValue(
		tableStylesObj?.minWidth
	);

	const onChangeHasFixedLayout = () => {
		setAttributes( { hasFixedLayout: ! hasFixedLayout } );
	};

	const onChangeIsStackedOnMobile = () => {
		setAttributes( { isStackedOnMobile: ! isStackedOnMobile } );
	};

	const onChangeIsScrollOnPc = () => {
		setAttributes( { isScrollOnPc: ! isScrollOnPc } );
	};

	const onChangeIsScrollOnMobile = () => {
		setAttributes( { isScrollOnMobile: ! isScrollOnMobile } );
	};

	const onChangeSticky = ( value: string ) => {
		const isAllowedValue = ( _value: any ): _value is StickyValue => {
			return ! value || STICKY_CONTROLS.some( ( control ) => control.value === _value );
		};
		if ( isAllowedValue( value ) ) {
			setAttributes( { sticky: 'none' === value ? undefined : value } );
		}
	};

	const onToggleHeaderSection = () => {
		const newVTable = toggleSection( vTable, 'head' );
		setAttributes( toTableAttributes( newVTable ) );
		setSelectedCells( undefined );
		setSelectedLine( undefined );
	};

	const onToggleFooterSection = () => {
		const newVTable = toggleSection( vTable, 'foot' );
		setAttributes( toTableAttributes( newVTable ) );
		setSelectedCells( undefined );
		setSelectedLine( undefined );
	};

	const onChangeWidth = ( value: Property.Width | undefined ) => {
		const newStylesObj = {
			...tableStylesObj,
			width: value,
		};
		setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeMaxWidth = ( value: Property.MaxWidth | undefined ) => {
		const newStylesObj = {
			...tableStylesObj,
			maxWidth: value,
		};
		setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeMinWidth = ( value: Property.MinWidth | undefined ) => {
		const newStylesObj = {
			...tableStylesObj,
			minWidth: value,
		};
		setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeMinHeight = ( value: Property.MinHeight | undefined ) => {
		const newStylesObj = {
			...tableStylesObj,
			minHeight: value,
		};
		setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangePadding = ( values: Partial< DirectionProps > ) => {
		const newStylesObj = updatePadding( tableStylesObj, values );
		setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeBorderWidth = ( values: Partial< DirectionProps > ) => {
		const newStylesObj = updateBorderWidth( tableStylesObj, values );
		setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeBorderRadius = ( values: Partial< CornerProps > ) => {
		const newStylesObj = updateBorderRadius( tableStylesObj, values );
		setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeBorderStyle = ( values: Partial< DirectionProps > ) => {
		const newStylesObj = updateBorderStyle( tableStylesObj, values );
		setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeBorderColor = ( values: Partial< DirectionProps > ) => {
		const newStylesObj = updateBorderColor( tableStylesObj, values );
		setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeBorderCollapse = ( value: string | number | undefined ) => {
		const isAllowedValue = ( _value: any ): _value is Properties[ 'borderCollapse' ] => {
			return ! value || BORDER_COLLAPSE_CONTROLS.some( ( control ) => control.value === _value );
		};
		if ( isAllowedValue( value ) ) {
			const borderCollapse = tableStylesObj?.borderCollapse === value ? undefined : value;
			const borderSpacing =
				'separate' === borderCollapse ? tableStylesObj?.borderSpacing : undefined;
			const newStylesObj = {
				...tableStylesObj,
				borderCollapse,
				borderSpacing,
			};
			setAttributes( {
				tableStyles: convertToInline( newStylesObj ),
			} );
		}
	};

	const onChangeBorderSpacing = ( values: Partial< CrossProps > ) => {
		const newStylesObj = updateBorderSpacing( tableStylesObj, values );
		setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onResetTableSettings = () => {
		setAttributes( {
			hasFixedLayout: true,
			isScrollOnPc: false,
			isScrollOnMobile: false,
			isStackedOnMobile: false,
			sticky: undefined,
			tableStyles: undefined,
		} );
	};

	return (
		<>
			<Spacer marginBottom="4" as={ Flex } justify="end" className="ftb-table-settings-clear">
				<Button variant="link" isDestructive onClick={ onResetTableSettings }>
					{ __( 'Clear table settings', 'flexible-table-block' ) }
				</Button>
			</Spacer>
			<ToggleControl
				className="ftb-table-settings-header"
				label={ __( 'Header section', 'flexible-table-block' ) }
				checked={ !! ( head && head.length ) }
				onChange={ onToggleHeaderSection }
				__nextHasNoMarginBottom
			/>
			<ToggleControl
				className="ftb-table-settings-footer"
				label={ __( 'Footer section', 'flexible-table-block' ) }
				checked={ !! ( foot && foot.length ) }
				onChange={ onToggleFooterSection }
				__nextHasNoMarginBottom
			/>
			<hr />
			<ToggleControl
				className="ftb-table-settings-fixed-width"
				label={ __( 'Fixed width table cells', 'flexible-table-block' ) }
				checked={ !! hasFixedLayout }
				onChange={ onChangeHasFixedLayout }
				__nextHasNoMarginBottom
			/>
			<ToggleControl
				className="ftb-table-settings-scroll-on-desktop"
				label={ __( 'Scroll on desktop view', 'flexible-table-block' ) }
				checked={ !! isScrollOnPc }
				help={
					options.breakpoint &&
					sprintf(
						/* translators: %d is replaced with the number of breakpoint. */
						__( 'When the screen width is %dpx or more.', 'flexible-table-block' ),
						Math.abs( options.breakpoint ) + 1
					)
				}
				onChange={ onChangeIsScrollOnPc }
				__nextHasNoMarginBottom
			/>
			<ToggleControl
				className="ftb-table-settings-scroll-on-mobile"
				label={ __( 'Scroll on mobile view', 'flexible-table-block' ) }
				checked={ !! isScrollOnMobile }
				help={
					options.breakpoint &&
					sprintf(
						/* translators: %d is replaced with the number of breakpoint. */
						__( 'When the screen width is %dpx or less.', 'flexible-table-block' ),
						options.breakpoint
					)
				}
				onChange={ onChangeIsScrollOnMobile }
				__nextHasNoMarginBottom
			/>
			<ToggleControl
				className="ftb-table-settings-stack-on-mobile"
				label={ __( 'Stack on mobile', 'flexible-table-block' ) }
				checked={ !! isStackedOnMobile }
				help={
					options.breakpoint &&
					sprintf(
						/* translators: %d is replaced with the number of breakpoint. */
						__( 'When the screen width is %dpx or less.', 'flexible-table-block' ),
						options.breakpoint
					)
				}
				onChange={ onChangeIsStackedOnMobile }
				__nextHasNoMarginBottom
			/>
			<SelectControl
				className="ftb-table-settings-fixed-control"
				label={ __( 'Fixed control', 'flexible-table-block' ) }
				value={ sticky }
				options={ STICKY_CONTROLS.map( ( { label, value } ) => {
					return { label, value };
				} ) }
				help={
					isStackedOnMobile &&
					sticky &&
					__(
						'Fixed control is only enabled for desktop view because "Stack on mobile" is enabled.',
						'flexible-table-block'
					)
				}
				onChange={ onChangeSticky }
				size="__unstable-large"
				__nextHasNoMarginBottom
			/>
			<hr />
			<UnitControl
				className="ftb-table-settings-width"
				label={ __( 'Table width', 'flexible-table-block' ) }
				value={ tableStylesObj?.width }
				units={ tableWidthUnits }
				disabled={ tableStylesObj?.width === 'auto' }
				min={ 0 }
				onChange={ onChangeWidth }
				size="__unstable-large"
				__unstableInputWidth="50%"
			/>
			<ToggleGroupControl
				__nextHasNoMarginBottom
				__next40pxDefaultSize
				hideLabelFromVision
				className="ftb-table-settings-percentage-width"
				label={ __( 'Table percentage width', 'flexible-table-block' ) }
				isBlock
				value={
					tableStylesObj?.width === 'auto' ||
					( parsedWidthQuantity &&
						PERCENTAGE_WIDTHS.includes( parsedWidthQuantity ) &&
						parsedWidthUnit === '%' )
						? tableStylesObj?.width
						: undefined
				}
				onChange={ ( value ) => onChangeWidth( value as Property.Width ) }
			>
				{ PERCENTAGE_WIDTHS.map( ( perWidth ) => {
					return (
						<ToggleGroupControlOption
							key={ perWidth }
							label={ `${ perWidth }%` }
							value={ `${ perWidth }%` }
						/>
					);
				} ) }
				<ToggleGroupControlOption
					label={ _x( 'auto', 'width', 'flexible-table-block' ) }
					value="auto"
				/>
			</ToggleGroupControl>
			<UnitControl
				className="ftb-table-settings-max-width"
				label={ __( 'Table max width', 'flexible-table-block' ) }
				value={ tableStylesObj?.maxWidth }
				units={ tableWidthUnits }
				disabled={ tableStylesObj?.maxWidth === 'none' }
				min={ 0 }
				onChange={ onChangeMaxWidth }
				size="__unstable-large"
				__unstableInputWidth="50%"
			/>
			<ToggleGroupControl
				__nextHasNoMarginBottom
				__next40pxDefaultSize
				hideLabelFromVision
				className="ftb-table-settings-percentage-max-width"
				label={ __( 'Table percentage max width', 'flexible-table-block' ) }
				isBlock
				value={
					tableStylesObj?.maxWidth === 'none' ||
					( parsedMaxWidthQuantity &&
						PERCENTAGE_WIDTHS.includes( parsedMaxWidthQuantity ) &&
						parsedMaxWidthUnit === '%' )
						? tableStylesObj?.maxWidth
						: undefined
				}
				onChange={ ( value ) => onChangeMaxWidth( value as Property.MaxWidth ) }
			>
				{ PERCENTAGE_WIDTHS.map( ( perWidth ) => {
					return (
						<ToggleGroupControlOption
							key={ perWidth }
							label={ `${ perWidth }%` }
							value={ `${ perWidth }%` }
						/>
					);
				} ) }
				<ToggleGroupControlOption
					label={ _x( 'none', 'width', 'flexible-table-block' ) }
					value="none"
				/>
			</ToggleGroupControl>
			<UnitControl
				className="ftb-table-settings-min-width"
				label={ __( 'Table min width', 'flexible-table-block' ) }
				value={ tableStylesObj?.minWidth }
				units={ tableWidthUnits }
				min={ 0 }
				onChange={ onChangeMinWidth }
				size="__unstable-large"
				__unstableInputWidth="50%"
			/>
			<ToggleGroupControl
				__nextHasNoMarginBottom
				__next40pxDefaultSize
				hideLabelFromVision
				className="ftb-table-settings-percentage-min-width"
				label={ __( 'Table percentage min width', 'flexible-table-block' ) }
				isBlock
				value={
					parsedMinWidthQuantity &&
					PERCENTAGE_WIDTHS.includes( parsedMinWidthQuantity ) &&
					parsedMinWidthUnit === '%'
						? tableStylesObj?.minWidth
						: undefined
				}
				onChange={ ( value ) => onChangeMinWidth( value as Property.MinWidth ) }
			>
				{ PERCENTAGE_WIDTHS.map( ( perWidth ) => {
					return (
						<ToggleGroupControlOption
							key={ perWidth }
							label={ `${ perWidth }%` }
							value={ `${ perWidth }%` }
						/>
					);
				} ) }
			</ToggleGroupControl>
			<UnitControl
				className="ftb-table-settings-min-height"
				label={ __( 'Table min height', 'flexible-table-block' ) }
				value={ tableStylesObj?.minHeight }
				units={ tableHeightUnits }
				min={ 0 }
				onChange={ onChangeMinHeight }
				size="__unstable-large"
				__unstableInputWidth="50%"
			/>
			<hr />
			<PaddingControl
				className="ftb-table-settings-padding"
				label={ __( 'Table padding', 'flexible-table-block' ) }
				help={ __(
					'Table padding is only enabled when "Cell Borders" is set to "Separate".',
					'flexible-table-block'
				) }
				values={ pickPadding( tableStylesObj ) }
				onChange={ onChangePadding }
			/>
			<hr />
			<BorderRadiusControl
				className="ftb-table-settings-border-radius"
				label={ __( 'Table border radius', 'flexible-table-block' ) }
				values={ pickBorderRadius( tableStylesObj ) }
				onChange={ onChangeBorderRadius }
			/>
			<BorderWidthControl
				className="ftb-table-settings-border-width"
				label={ __( 'Table border width', 'flexible-table-block' ) }
				help={ __(
					'Table border width is only enabled when "Cell Borders" is set to "Separate".',
					'flexible-table-block'
				) }
				values={ pickBorderWidth( tableStylesObj ) }
				onChange={ onChangeBorderWidth }
			/>
			<BorderStyleControl
				className="ftb-table-settings-border-style"
				label={ __( 'Table border style', 'flexible-table-block' ) }
				values={ pickBorderStyle( tableStylesObj ) }
				onChange={ onChangeBorderStyle }
			/>
			<BorderColorControl
				className="ftb-table-settings-border-color"
				label={ __( 'Table border color', 'flexible-table-block' ) }
				values={ pickBorderColor( tableStylesObj ) }
				onChange={ onChangeBorderColor }
			/>
			<hr />
			<ToggleGroupControl
				__nextHasNoMarginBottom
				__next40pxDefaultSize
				className="ftb-table-settings-cell-borders"
				label={ __( 'Cell borders', 'flexible-table-block' ) }
				value={ tableStylesObj?.borderCollapse }
				isDeselectable
				onChange={ onChangeBorderCollapse }
			>
				{ BORDER_COLLAPSE_CONTROLS.map( ( { icon, label, value } ) => (
					<ToggleGroupControlOptionIcon
						key={ value }
						label={ label }
						value={ value }
						icon={ icon }
					/>
				) ) }
			</ToggleGroupControl>
			{ 'separate' === tableStylesObj?.borderCollapse && (
				<BorderSpacingControl
					label={ __( 'Border spacing', 'flexible-table-block' ) }
					values={ pickBorderSpacing( tableStylesObj ) }
					onChange={ onChangeBorderSpacing }
				/>
			) }
		</>
	);
}
