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
	BaseControl,
	Button,
	ButtonGroup,
	SelectControl,
	ToggleControl,
	// @ts-ignore: has no exported member
	__experimentalUnitControl as UnitControl,
	// @ts-ignore: has no exported member
	__experimentalUseCustomUnits as useCustomUnits,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import {
	STORE_NAME,
	TABLE_WIDTH_UNITS,
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
import { toggleSection, toTableAttributes } from '../utils/table-state';
import { convertToInline } from '../utils/style-converter';
import {
	pickPadding,
	pickBorderWidth,
	pickBorderRadius,
	pickBorderStyle,
	pickBorderColor,
	pickBorderSpacing,
} from '../utils/style-picker';
import {
	updatePadding,
	updateBorderWidth,
	updateBorderRadius,
	updateBorderStyle,
	updateBorderColor,
	updateBorderSpacing,
} from '../utils/style-updater';
import { sanitizeUnitValue } from '../utils/helper';
import type { VTable, VSelectedCells, VSelectedLine } from '../utils/table-state';
import type { CornerProps, DirectionProps, CrossProps } from '../utils/style-picker';
import type { StickyValue, BorderCollapseValue, BlockAttributes } from '../BlockAttributes';
import type { StoreOptions } from '../store';

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

	const options: StoreOptions = useSelect(
		( select ) =>
			select( STORE_NAME )
				// @ts-ignore
				.getOptions(),
		[]
	);

	const tableWidthUnits = useCustomUnits( { availableUnits: TABLE_WIDTH_UNITS } );

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

	const onChangeSticky = ( value: StickyValue ) => {
		setAttributes( { sticky: 'none' === value ? undefined : value } );
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

	const onChangeWidth = ( value: Property.Width ) => {
		const newStylesObj = {
			...tableStylesObj,
			width: value,
		};
		setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeMaxWidth = ( value: Property.MaxWidth ) => {
		const newStylesObj = {
			...tableStylesObj,
			maxWidth: value,
		};
		setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeMinWidth = ( value: Property.MinWidth ) => {
		const newStylesObj = {
			...tableStylesObj,
			minWidth: value,
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

	const onChangeBorderCollapse = ( value: BorderCollapseValue ) => {
		const borderCollapse = tableStylesObj?.borderCollapse === value ? undefined : value;
		const borderSpacing = 'separate' === borderCollapse ? tableStylesObj?.borderSpacing : undefined;
		const newStylesObj = {
			...tableStylesObj,
			borderCollapse,
			borderSpacing,
		};
		setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeBorderSpacing = ( values: Partial< CrossProps > ) => {
		const newStylesObj = updateBorderSpacing( tableStylesObj, values );
		setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onResetTableSettings = () => {
		setAttributes( {
			hasFixedLayout: false,
			isScrollOnPc: false,
			isScrollOnMobile: false,
			isStackedOnMobile: false,
			sticky: undefined,
			tableStyles: undefined,
		} );
	};

	return (
		<>
			<BaseControl
				id="flexible-table-block-table-clear-settings"
				className="ftb-reset-settings-control"
			>
				<Button variant="link" isDestructive onClick={ onResetTableSettings }>
					{ __( 'Clear table settings', 'flexible-table-block' ) }
				</Button>
			</BaseControl>
			<ToggleControl
				label={ __( 'Header section', 'flexible-table-block' ) }
				checked={ !! ( head && head.length ) }
				onChange={ onToggleHeaderSection }
			/>
			<ToggleControl
				label={ __( 'Footer section', 'flexible-table-block' ) }
				checked={ !! ( foot && foot.length ) }
				onChange={ onToggleFooterSection }
			/>
			<hr />
			<ToggleControl
				label={ __( 'Fixed width table cells', 'flexible-table-block' ) }
				checked={ !! hasFixedLayout }
				onChange={ onChangeHasFixedLayout }
			/>
			<ToggleControl
				label={ __( 'Scroll on desktop view', 'flexible-table-block' ) }
				className="ftb-toggle-control"
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
			/>
			<ToggleControl
				label={ __( 'Scroll on mobile view', 'flexible-table-block' ) }
				className="ftb-toggle-control"
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
			/>
			<ToggleControl
				label={ __( 'Stack on mobile', 'flexible-table-block' ) }
				className="ftb-toggle-control"
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
			/>
			<SelectControl
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
			/>
			<hr />
			<BaseControl
				id="flexible-table-block-table-width"
				label={ __( 'Table width', 'flexible-table-block' ) }
				className="ftb-width-control"
			>
				<UnitControl
					id="flexible-table-block-table-width"
					value={ tableStylesObj?.width }
					units={ tableWidthUnits }
					disabled={ tableStylesObj?.width === 'auto' }
					min="0"
					onChange={ onChangeWidth }
				/>
				<ButtonGroup
					aria-label={ __( 'Table percentage width', 'flexible-table-block' ) }
					className="ftb-percent-group"
				>
					{ [ 25, 50, 75, 100 ].map( ( perWidth ) => {
						const isPressed = tableStylesObj?.width === `${ perWidth }%`;
						return (
							<Button
								key={ perWidth }
								variant={ isPressed ? 'primary' : undefined }
								isSmall
								onClick={ () =>
									onChangeWidth( isPressed ? '' : sanitizeUnitValue( `${ perWidth }%` ) )
								}
							>
								{ `${ perWidth }%` }
							</Button>
						);
					} ) }
					<Button
						variant={ tableStylesObj?.width === 'auto' ? 'primary' : undefined }
						isSmall
						onClick={ () => onChangeWidth( tableStylesObj?.width === 'auto' ? '' : 'auto' ) }
					>
						{ __( 'auto', 'flexible-table-block' ) }
					</Button>
				</ButtonGroup>
			</BaseControl>
			<BaseControl
				id="flexible-table-block-table-max-width"
				label={ __( 'Table max width', 'flexible-table-block' ) }
				className="ftb-width-control"
			>
				<UnitControl
					id="flexible-table-block-table-max-width"
					value={ tableStylesObj?.maxWidth }
					units={ tableWidthUnits }
					disabled={ tableStylesObj?.maxWidth === 'none' }
					min="0"
					onChange={ onChangeMaxWidth }
				/>
				<ButtonGroup
					aria-label={ __( 'Table percentage max width' ) }
					className="ftb-percent-group"
				>
					{ [ 25, 50, 75, 100 ].map( ( perWidth ) => {
						const isPressed = tableStylesObj?.maxWidth === `${ perWidth }%`;
						return (
							<Button
								key={ perWidth }
								variant={ isPressed ? 'primary' : undefined }
								isSmall
								onClick={ () =>
									onChangeMaxWidth( isPressed ? '' : sanitizeUnitValue( `${ perWidth }%` ) )
								}
							>
								{ `${ perWidth }%` }
							</Button>
						);
					} ) }
					<Button
						variant={ tableStylesObj?.maxWidth === 'none' ? 'primary' : undefined }
						isSmall
						onClick={ () => onChangeMaxWidth( tableStylesObj?.maxWidth === 'none' ? '' : 'none' ) }
					>
						{ _x( 'none', 'width', 'flexible-table-block' ) }
					</Button>
				</ButtonGroup>
			</BaseControl>
			<BaseControl
				id="flexible-table-block-table-min-width"
				label={ __( 'Table min width', 'flexible-table-block' ) }
				className="ftb-width-control"
			>
				<UnitControl
					id="flexible-table-block-table-min-width"
					value={ tableStylesObj?.minWidth }
					units={ tableWidthUnits }
					min="0"
					onChange={ onChangeMinWidth }
				/>
				<ButtonGroup
					aria-label={ __( 'Table percentage min width' ) }
					className="ftb-percent-group"
				>
					{ [ 25, 50, 75, 100 ].map( ( perWidth ) => {
						const isPressed = tableStylesObj?.minWidth === `${ perWidth }%`;
						return (
							<Button
								key={ perWidth }
								variant={ isPressed ? 'primary' : undefined }
								isSmall
								onClick={ () => onChangeMinWidth( isPressed ? '' : `${ perWidth }%` ) }
							>
								{ `${ perWidth }%` }
							</Button>
						);
					} ) }
				</ButtonGroup>
			</BaseControl>
			<hr />
			<PaddingControl
				id="flexible-table-block-table-padding"
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
				id="flexible-table-block-table-border-radius"
				label={ __( 'Table border radius', 'flexible-table-block' ) }
				values={ pickBorderRadius( tableStylesObj ) }
				onChange={ onChangeBorderRadius }
			/>
			<BorderWidthControl
				id="flexible-table-block-table-border-width"
				label={ __( 'Table border width', 'flexible-table-block' ) }
				help={ __(
					'Table border width is only enabled when "Cell Borders" is set to "Separate".',
					'flexible-table-block'
				) }
				values={ pickBorderWidth( tableStylesObj ) }
				onChange={ onChangeBorderWidth }
			/>
			<BorderStyleControl
				id="flexible-table-block-table-border-style"
				label={ __( 'Table border style', 'flexible-table-block' ) }
				values={ pickBorderStyle( tableStylesObj ) }
				onChange={ onChangeBorderStyle }
			/>
			<BorderColorControl
				id="flexible-table-block-table-border-color"
				label={ __( 'Table border color', 'flexible-table-block' ) }
				values={ pickBorderColor( tableStylesObj ) }
				onChange={ onChangeBorderColor }
			/>
			<hr />
			<BaseControl id="flexible-table-block-table-border-collapse">
				<div aria-labelledby="flexible-table-block-table-border-collapse-heading" role="region">
					<span
						id="flexible-table-block-table-border-collapse-heading"
						className="ftb-base-control-label"
					>
						{ __( 'Cell borders', 'flexible-table-block' ) }
					</span>
					<ButtonGroup className="ftb-button-group">
						{ BORDER_COLLAPSE_CONTROLS.map( ( { icon, label, value } ) => {
							return (
								<Button
									key={ value }
									variant={ value === tableStylesObj?.borderCollapse ? 'primary' : 'secondary' }
									icon={ icon }
									onClick={ () => onChangeBorderCollapse( value ) }
								>
									{ label }
								</Button>
							);
						} ) }
					</ButtonGroup>
				</div>
			</BaseControl>
			{ 'separate' === tableStylesObj?.borderCollapse && (
				<BorderSpacingControl
					id="flexible-table-block-table-border-spacing"
					label={ __( 'Border spacing', 'flexible-table-block' ) }
					values={ pickBorderSpacing( tableStylesObj ) }
					onChange={ onChangeBorderSpacing }
				/>
			) }
		</>
	);
}
