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
	__experimentalUnitControl as UnitControl,
	__experimentalUseCustomUnits as useCustomUnits
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import { toggleSection } from '../utils/state';
import { toUnitVal } from '../utils/helper';
import {
	BORDER_SPACING_MAX,
	BORDER_COLLAPSE_CONTROLS,
	STICKY_CONTROLS
} from '../utils/constants';

export default function TableSettingsControl({
	attributes,
	setAttributes
}) {
	const {
		hasFixedLayout,
		sticky,
		width,
		minWidth,
		maxWidth,
		borderCollapse,
		borderSpacingHorizontal,
		borderSpacingVertical,
		head,
		foot
	} = attributes;

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
		setAttributes({ width: toUnitVal( value ) });
	};

	const onChangeMinWidth = ( value ) => {
		setAttributes({ minWidth: toUnitVal( value ) });
	};

	const onChangeMaxWidth = ( value ) => {
		setAttributes({ maxWidth: toUnitVal( value ) });
	};

	const onChangeBorderCollapse = ( value ) => {
		setAttributes({ borderCollapse: value });
		if ( 'collapse' == value ) {
			setAttributes({ borderSpacingHorizontal: undefined });
			setAttributes({ borderSpacingVertical: undefined });
		}
	};

	const onChangeBorderSpacingHorizontal = ( value ) => {
		setAttributes({ borderSpacingHorizontal: value });
	};

	const onChangeBorderSpacingVertical = ( value ) => {
		setAttributes({ borderSpacingVertical: value });
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
			<BaseControl
				label={ __( 'Width', 'flexible-table-block' ) }
				id="flexible-table-block/width"
			>
				<UnitControl
					labelPosition="top"
					min="0"
					value={ width }
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
				label={ __( 'Min width', 'flexible-table-block' ) }
				id="flexible-table-block/width"
			>
				<UnitControl
					labelPosition="top"
					min="0"
					value={ minWidth }
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
			<BaseControl
				label={ __( 'Max width', 'flexible-table-block' ) }
				id="flexible-table-block/width"
			>
				<UnitControl
					labelPosition="top"
					min="0"
					value={ maxWidth }
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
			<SelectControl
				label={ __( 'Fixed control', 'flexible-table-block' ) }
				value={ sticky }
				onChange={ onChangeSticky }
				options={ STICKY_CONTROLS.map( ({ label, value }) => {
					return { label, value };
				}) }
			/>
			<BaseControl
				label={ __( 'Cell borders', 'flexible-table-block' ) }
				id="flexible-table-block/cell-borders"
			>
				<ButtonGroup
					className="wp-block-flexible-table-block-table__components-button-group"
				>
					{ BORDER_COLLAPSE_CONTROLS.map( ({ label, value }) => {
						return (
							<Button
								key={ value }
								variant={ value === borderCollapse ? 'primary' : 'secondary' }
								onClick={ () =>
									onChangeBorderCollapse( value )
								}
							>
								{ label }
							</Button>
						);
					}) }
				</ButtonGroup>
			</BaseControl>
			{ 'separate' === borderCollapse && (
				<BaseControl
					label={ __( 'Distance between the borders', 'flexible-table-block' ) }
					id="flexible-table-block/padding"
				>
					<div className="wp-block-flexible-table-block-table__spacing-control">
						<UnitControl
							label={ __( 'Horizontal', 'flexible-table-block' ) }
							labelPosition="top"
							min="0"
							max={ BORDER_SPACING_MAX }
							value={ borderSpacingHorizontal }
							onChange={ onChangeBorderSpacingHorizontal }
							units={ borderSpacingUnits }
						/>
						<UnitControl
							label={ __( 'Vertical', 'flexible-table-block' ) }
							labelPosition="top"
							min="0"
							max={ BORDER_SPACING_MAX }
							value={ borderSpacingVertical }
							onChange={ onChangeBorderSpacingVertical }
							units={ borderSpacingUnits }
						/>
					</div>
				</BaseControl>
			)}
		</PanelBody>
	);
}
