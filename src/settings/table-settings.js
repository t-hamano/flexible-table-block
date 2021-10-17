/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import {
	BaseControl,
	Button,
	ButtonGroup,
	SelectControl,
	ToggleControl,
	__experimentalUnitControl as UnitControl,
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
import { toggleSection } from '../utils/table-state';
import { toTableAttributes } from '../utils/helper';
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
import { toUnitVal } from '../utils/unit-helpers';

export default function TableSettings( props ) {
	const { vTable, tableStylesObj, attributes, setAttributes } = props;
	const {
		hasFixedLayout,
		isStackedOnMobile,
		isScrollOnPc,
		isScrollOnMobile,
		sticky,
		head,
		foot,
	} = attributes;

	const options = useSelect( ( select ) => select( STORE_NAME ).getOptions() );

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

	const onChangeSticky = ( value ) => {
		setAttributes( { sticky: 'none' === value ? undefined : value } );
	};

	const onToggleHeaderSection = () => {
		const newVTable = toggleSection( vTable, 'head' );
		setAttributes( toTableAttributes( newVTable ) );
	};

	const onToggleFooterSection = () => {
		const newVTable = toggleSection( vTable, 'foot' );
		setAttributes( toTableAttributes( newVTable ) );
	};

	const onChangeWidth = ( value ) => {
		const newStylesObj = {
			...tableStylesObj,
			width: value,
		};
		setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeMaxWidth = ( value ) => {
		const newStylesObj = {
			...tableStylesObj,
			maxWidth: value,
		};
		setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeMinWidth = ( value ) => {
		const newStylesObj = {
			...tableStylesObj,
			minWidth: value,
		};
		setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangePadding = ( values ) => {
		const newStylesObj = updatePadding( tableStylesObj, values );
		setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeBorderWidth = ( values ) => {
		const newStylesObj = updateBorderWidth( tableStylesObj, values );
		setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeBorderRadius = ( values ) => {
		const newStylesObj = updateBorderRadius( tableStylesObj, values );
		setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeBorderStyle = ( values ) => {
		const newStylesObj = updateBorderStyle( tableStylesObj, values );
		setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeBorderColor = ( values ) => {
		const newStylesObj = updateBorderColor( tableStylesObj, values );
		setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeBorderCollapse = ( value ) => {
		const borderCollapse = tableStylesObj?.borderCollapse === value ? undefined : value;
		const borderSpacing = 'separate' === borderCollapse ? tableStylesObj?.borderSpacing : undefined;
		const newStylesObj = {
			...tableStylesObj,
			borderCollapse,
			borderSpacing,
		};
		setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeBorderSpacing = ( values ) => {
		const newStylesObj = updateBorderSpacing( tableStylesObj, values );
		setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onResetTableSettings = () => {
		setAttributes( {
			hasFixedLayout: undefined,
			isScrollOnPc: undefined,
			isScrollOnMobile: undefined,
			isStackedOnMobile: undefined,
			sticky: undefined,
			tableStyles: undefined,
		} );
	};

	return (
		<>
			<BaseControl
				id="flexible-table-block/clear-table-settings"
				className="ftb-reset-settings-control"
			>
				<Button isLink variant="link" isDestructive onClick={ onResetTableSettings }>
					{ __( 'Clear Table Settings', 'flexible-table-block' ) }
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
				label={ __( 'Scroll on PC view', 'flexible-table-block' ) }
				className="ftb-toggle-control"
				checked={ !! isScrollOnPc }
				help={
					options.breakpoint &&
					sprintf(
						/* translators: %d is replaced with the number of breakpoint. */
						__( 'When the screen width is %dpx or more.', 'flexible-table-block' ),
						parseInt( options.breakpoint ) + 1
					)
				}
				onChange={ onChangeIsScrollOnPc }
			/>
			<ToggleControl
				label={ __( 'Scroll on Mobile view', 'flexible-table-block' ) }
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
						'Fixed control is only enable for PC view because "Stack on mobile" is enabled.',
						'flexible-table-block'
					)
				}
				onChange={ onChangeSticky }
			/>
			<hr />
			<BaseControl
				id="flexible-table-block/table-width"
				label={ __( 'Table Width', 'flexible-table-block' ) }
			>
				<UnitControl
					value={ tableStylesObj?.width }
					units={ tableWidthUnits }
					disabled={ tableStylesObj?.width === 'auto' }
					min="0"
					onChange={ onChangeWidth }
				/>
				<ButtonGroup
					aria-label={ __( 'Table Percentage Width', 'flexible-table-block' ) }
					className="ftb-percent-group"
				>
					{ [ 25, 50, 75, 100 ].map( ( perWidth ) => {
						const isPressed = tableStylesObj?.width === `${ perWidth }%`;
						return (
							<Button
								key={ perWidth }
								isPrimary={ isPressed }
								variant={ isPressed ? 'primary' : undefined }
								isSmall
								onClick={ () =>
									onChangeWidth( isPressed ? undefined : toUnitVal( `${ perWidth }%` ) )
								}
							>
								{ `${ perWidth }%` }
							</Button>
						);
					} ) }
					<Button
						isPrimary={ tableStylesObj?.width === 'auto' }
						variant={ tableStylesObj?.width === 'auto' ? 'primary' : undefined }
						isSmall
						onClick={ () => onChangeWidth( tableStylesObj?.width === 'auto' ? undefined : 'auto' ) }
					>
						{ __( 'auto', 'flexible-table-block' ) }
					</Button>
				</ButtonGroup>
			</BaseControl>
			<BaseControl
				id="flexible-table-block/table-max-width"
				label={ __( 'Table Max Width', 'flexible-table-block' ) }
			>
				<UnitControl
					value={ tableStylesObj?.maxWidth }
					units={ tableWidthUnits }
					disabled={ tableStylesObj?.maxWidth === 'none' }
					min="0"
					onChange={ onChangeMaxWidth }
				/>
				<ButtonGroup
					aria-label={ __( 'Table Percentage Max Width' ) }
					className="ftb-percent-group"
				>
					{ [ 25, 50, 75, 100 ].map( ( perWidth ) => {
						const isPressed = tableStylesObj?.maxWidth === `${ perWidth }%`;
						return (
							<Button
								key={ perWidth }
								isPrimary={ isPressed }
								variant={ isPressed ? 'primary' : undefined }
								isSmall
								onClick={ () =>
									onChangeMaxWidth( isPressed ? undefined : toUnitVal( `${ perWidth }%` ) )
								}
							>
								{ `${ perWidth }%` }
							</Button>
						);
					} ) }
					<Button
						isPrimary={ tableStylesObj?.maxWidth === 'none' }
						variant={ tableStylesObj?.maxWidth === 'none' ? 'primary' : undefined }
						isSmall
						onClick={ () =>
							onChangeMaxWidth( tableStylesObj?.maxWidth === 'none' ? undefined : 'none' )
						}
					>
						{ __( 'none', 'flexible-table-block' ) }
					</Button>
				</ButtonGroup>
			</BaseControl>
			<BaseControl
				id="flexible-table-block/table-min-width"
				label={ __( 'Table Min Width', 'flexible-table-block' ) }
			>
				<UnitControl
					value={ tableStylesObj?.minWidth }
					units={ tableWidthUnits }
					min="0"
					onChange={ onChangeMinWidth }
				/>
				<ButtonGroup
					aria-label={ __( 'Table Percentage Min Width' ) }
					className="ftb-percent-group"
				>
					{ [ 25, 50, 75, 100 ].map( ( perWidth ) => {
						const isPressed = tableStylesObj?.minWidth === `${ perWidth }%`;
						return (
							<Button
								key={ perWidth }
								isPrimary={ isPressed }
								variant={ isPressed ? 'primary' : undefined }
								isSmall
								onClick={ () => onChangeMinWidth( isPressed ? undefined : `${ perWidth }%` ) }
							>
								{ `${ perWidth }%` }
							</Button>
						);
					} ) }
				</ButtonGroup>
			</BaseControl>
			<hr />
			<PaddingControl
				id="flexible-table-block/table-padding"
				label={ __( 'Table Padding', 'flexible-table-block' ) }
				help='Table padding is only enable when "cell borders" is set to "separate".'
				values={ pickPadding( tableStylesObj ) }
				onChange={ onChangePadding }
			/>
			<hr />
			<BorderRadiusControl
				id="flexible-table-block/table-border-radius"
				label={ __( 'Table Border Radius', 'flexible-table-block' ) }
				values={ pickBorderRadius( tableStylesObj ) }
				onChange={ onChangeBorderRadius }
			/>
			<BorderWidthControl
				id="flexible-table-block/table-border-width"
				label={ __( 'Table Border Width', 'flexible-table-block' ) }
				help='Table border width is only enable when "cell borders" is set to "separate".'
				values={ pickBorderWidth( tableStylesObj ) }
				onChange={ onChangeBorderWidth }
			/>
			<BorderStyleControl
				id="flexible-table-block/table-border-style"
				label={ __( 'Table Border Style', 'flexible-table-block' ) }
				values={ pickBorderStyle( tableStylesObj ) }
				onChange={ onChangeBorderStyle }
			/>
			<BorderColorControl
				id="flexible-table-block/table-border-color"
				label={ __( 'Table Border Color', 'flexible-table-block' ) }
				values={ pickBorderColor( tableStylesObj ) }
				onChange={ onChangeBorderColor }
			/>
			<hr />
			<BaseControl
				id="flexible-table-block/table-border-collapse"
				label={ __( 'Cell Borders', 'flexible-table-block' ) }
			>
				<ButtonGroup className="ftb-button-group">
					{ BORDER_COLLAPSE_CONTROLS.map( ( { icon, label, value } ) => {
						return (
							<Button
								key={ value }
								isPrimary={ value === tableStylesObj?.borderCollapse }
								isSecondary={ value !== tableStylesObj?.borderCollapse }
								variant={ value === tableStylesObj?.borderCollapse ? 'primary' : 'secondary' }
								icon={ icon }
								onClick={ () => onChangeBorderCollapse( value ) }
							>
								{ label }
							</Button>
						);
					} ) }
				</ButtonGroup>
			</BaseControl>
			{ 'separate' === tableStylesObj?.borderCollapse && (
				<BorderSpacingControl
					id="flexible-table-block/table-border-color"
					label={ __( 'Border Spacing', 'flexible-table-block' ) }
					values={ pickBorderSpacing( tableStylesObj ) }
					onChange={ onChangeBorderSpacing }
				/>
			) }
		</>
	);
}
