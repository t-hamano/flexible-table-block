/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	BaseControl,
	Button,
	ButtonGroup,
	PanelBody,
	SelectControl,
	ToggleControl,
	__experimentalBoxControl as BoxControl,
	__experimentalUnitControl as UnitControl,
	__experimentalUseCustomUnits as useCustomUnits
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import { toggleSection } from '../utils/state';
import {
	parseInlineCss,
	parseCssValue,
	toUnitVal,
	cleanEmptyObject} from '../utils/helper';

const STICKY_CONTROLS = [
	{
		label: __( 'none', 'flexible-table-block' ),
		value: 'none'
	},
	{
		label: __( 'Fixed header', 'flexible-table-block' ),
		value: 'header'
	},
	{
		label: __( 'Fixed first column', 'flexible-table-block' ),
		value: 'first-column'
	}
];

const BORDER_COLLAPSE_CONTROLS = [
	{
		label: __( 'Share', 'flexible-table-block' ),
		value: 'collapse'
	},
	{
		label: __( 'Separate', 'flexible-table-block' ),
		value: 'separate'
	}
];

export default function TableSettingsControl( props ) {
	const { attributes, setAttributes } = props;
	const {
		tableStyles,
		hasFixedLayout,
		sticky,
		head,
		foot
	} = attributes;

	const tableStylesObj = parseInlineCss( tableStyles );

	const tableWidthUnits = useCustomUnits({
		availableUnits: [ 'px', 'em', 'rem', '%' ]
	});

	const borderSpacingUnits = useCustomUnits({
		availableUnits: [ 'px', 'em', 'rem' ]
	});

	const onChangeFixedLayout = () => {
		setAttributes({ hasFixedLayout: ! hasFixedLayout });
	};

	const onChangeSticky = ( value ) => {
		setAttributes({ sticky: 'none' === value ? undefined : value });
	};

	const onToggleHeaderSection = () => {
		setAttributes( toggleSection( attributes, 'head' ) );
	};

	const onToggleFooterSection = () => {
		setAttributes( toggleSection( attributes, 'foot' ) );
	};

	const onChangeWidth = ( value ) => {
		setAttributes({
			tableStyles: cleanEmptyObject({
				...tableStylesObj,
				width: tableStylesObj?.width === value ? undefined : toUnitVal( value )
			})
		});
	};

	const onChangeMaxWidth = ( value ) => {
		setAttributes({
			tableStyles: cleanEmptyObject({
				...tableStylesObj,
				maxWidth: tableStylesObj?.maxWidth === value ? undefined : toUnitVal( value )
			})
		});
	};

	const onChangeMinWidth = ( value ) => {
		setAttributes({
			tableStyles: cleanEmptyObject({
				...tableStylesObj,
				minWidth: tableStylesObj?.minWidth === value ? undefined : toUnitVal( value )
			})
		});
	};

	const onToggleBorderCollapse = ( value ) => {
		const borderCollapse = tableStylesObj?.borderCollapse === value ? undefined : value;
		const borderSpacing = 'separate' === borderCollapse ? tableStylesObj?.borderSpacing : undefined;

		setAttributes({
			tableStyles: cleanEmptyObject({
				...tableStylesObj,
				borderCollapse,
				borderSpacing
			})
		});
	};

	const onChangeBorderSpacing = ( values ) => {
		if ( null === values.top && null === values.left ) {

			// No value.
			setAttributes({
				tableStyles: cleanEmptyObject({
					...tableStylesObj,
					borderSpacing: undefined
				})
			});
		} else if ( values.top === values.left ) {

			// Shorthand value.
			setAttributes({
				tableStyles: cleanEmptyObject({
					...tableStylesObj,
					borderSpacing: values.top
				})
			});
		} else {

			// Longhand value.
			setAttributes({
				tableStyles: cleanEmptyObject({
					...tableStylesObj,
					borderSpacing: `${values.left} ${values.top}`
				})
			});
		}
	};

	return (
		<PanelBody
			title={ __( 'Table Settings', 'flexible-table-block' ) }
			initialOpen= { false }
		>
			<ToggleControl
				label={ __( 'Fixed width table cells', 'flexible-table-block' ) }
				checked={ !! hasFixedLayout }
				onChange={ onChangeFixedLayout }
			/>
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
			<SelectControl
				label={ __( 'Fixed control', 'flexible-table-block' ) }
				value={ sticky }
				onChange={ onChangeSticky }
				options={ STICKY_CONTROLS.map( ({ label, value }) => {
					return { label, value };
				}) }
			/>
			<hr/>
			<BaseControl
				label={ __( 'Width', 'flexible-table-block' ) }
				id="flexible-table-block/width"
			>
				<UnitControl
					labelPosition="top"
					min="0"
					value={ tableStylesObj?.width }
					onChange={ onChangeWidth }
					units={ tableWidthUnits }
				/>
				<ButtonGroup
					aria-label={ __( 'Percentage width' ) }
					className="wp-block-flexible-table-block-table__components-percent-group"
				>
					{ [ 25, 50, 75, 100 ].map( ( perWidth ) => {
						return (
							<Button
								key={ perWidth }
								isSmall
								isPressed={ tableStylesObj?.width === `${ perWidth }%` }
								onClick={ () =>
									onChangeWidth( `${ perWidth }%` )
								}
							>
								{ `${ perWidth }%` }
							</Button>
						);
					}) }
				</ButtonGroup>
			</BaseControl>
			<BaseControl
				label={ __( 'Max width', 'flexible-table-block' ) }
				id="flexible-table-block/max-width"
			>
				<UnitControl
					labelPosition="top"
					min="0"
					value={ tableStylesObj?.maxWidth }
					onChange={ onChangeMaxWidth }
					units={ tableWidthUnits }
				/>
				<ButtonGroup
					aria-label={ __( 'Percentage max width' ) }
					className="wp-block-flexible-table-block-table__components-percent-group"
				>
					{ [ 25, 50, 75, 100 ].map( ( perWidth ) => {
						return (
							<Button
								key={ perWidth }
								isSmall
								isPressed={ tableStylesObj?.maxWidth === `${ perWidth }%` }
								onClick={ () =>
									onChangeMaxWidth( `${ perWidth }%` )
								}
							>
								{ `${ perWidth }%` }
							</Button>
						);
					}) }
				</ButtonGroup>
			</BaseControl>
			<BaseControl
				label={ __( 'Min width', 'flexible-table-block' ) }
				id="flexible-table-block/min-width"
			>
				<UnitControl
					labelPosition="top"
					min="0"
					value={ tableStylesObj?.minWidth }
					onChange={ onChangeMinWidth }
					units={ tableWidthUnits }
				/>
				<ButtonGroup
					aria-label={ __( 'Percentage min width' ) }
					className="wp-block-flexible-table-block-table__components-percent-group"
				>
					{ [ 25, 50, 75, 100 ].map( ( perWidth ) => {
						return (
							<Button
								key={ perWidth }
								isSmall
								isPressed={ tableStylesObj?.minWidth === `${ perWidth }%` }
								onClick={ () =>
									onChangeMinWidth( `${ perWidth }%` )
								}
							>
								{ `${ perWidth }%` }
							</Button>
						);
					}) }
				</ButtonGroup>
			</BaseControl>
			<hr/>
			<BaseControl
				label={ __( 'Cell borders', 'flexible-table-block' ) }
				id="flexible-table-block/border-collapse"
			>
				<ButtonGroup
					className="wp-block-flexible-table-block-table__components-button-group"
				>
					{ BORDER_COLLAPSE_CONTROLS.map( ({ label, value }) => {
						return (
							<Button
								key={ value }
								isPressed={ value === tableStylesObj?.borderCollapse }
								onClick={ () =>
									onToggleBorderCollapse( value )
								}
							>
								{ label }
							</Button>
						);
					}) }
				</ButtonGroup>
			</BaseControl>
			{ 'separate' === tableStylesObj?.borderCollapse && (
				<BoxControl
					values={ parseCssValue( tableStylesObj?.borderSpacing, true ) }
					onChange={ onChangeBorderSpacing }
					label={ __( 'Border spacing', 'flexible-table-block' ) }
					units={ borderSpacingUnits }
					splitOnAxis={ true }
				/>
			)}
		</PanelBody>
	);
}
