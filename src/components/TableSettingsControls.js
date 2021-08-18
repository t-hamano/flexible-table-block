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
import { toggleSection } from '../state';
import { toUnitVal } from '../helper';
import {
	BORDER_SPACING_MAX,
	BORDER_COLLAPSE_CONTROLS,
	STICKY_CONTROLS
} from '../constants';

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

	const tabeWidthUnits = useCustomUnits({
		availableUnits: [ 'px', 'em', 'rem', '%' ]
	});

	const borderSpacingUnits = useCustomUnits({
		availableUnits: [ 'px', 'em', 'rem' ]
	});

	/**
	 * Toggles whether the table has a fixed layout or not.
	 */
	function onChangeFixedLayout() {
		setAttributes({ hasFixedLayout: ! hasFixedLayout });
	}

	/**
	 * Toggles whether the table has a fixed layout or not.
	 */
	function onChangeSticky( value ) {
		setAttributes({ sticky: 'none' === value ? undefined : value });
	}

	/**
	 * Add or remove a `head` table section.
	 */
	function onToggleHeaderSection() {
		setAttributes( toggleSection( attributes, 'head' ) );
	}

	/**
	 * Add or remove a `foot` table section.
	 */
	function onToggleFooterSection() {
		setAttributes( toggleSection( attributes, 'foot' ) );
	}

	return (
		<PanelBody
			title={ __( 'Table Settings', 'flexible-spacer-block' ) }
			initialOpen= { false }
		>
			<ToggleControl
				label={ __( 'Fixed width table cells', 'flexible-spacer-block' ) }
				checked={ !! hasFixedLayout }
				onChange={ onChangeFixedLayout }
			/>
			<ToggleControl
				label={ __( 'Header section', 'flexible-spacer-block' ) }
				checked={ !! ( head && head.length ) }
				onChange={ onToggleHeaderSection }
			/>
			<ToggleControl
				label={ __( 'Footer section', 'flexible-spacer-block' ) }
				checked={ !! ( foot && foot.length ) }
				onChange={ onToggleFooterSection }
			/>
			<BaseControl
				label={ __( 'Width', 'flexible-spacer-block' ) }
				id="flexible-table-block/width"
			>
				<UnitControl
					labelPosition="top"
					min="0"
					value={ width }
					onChange={ ( value ) => {
						setAttributes({ width: toUnitVal( value ) });
					} }
					units={ tabeWidthUnits }
				/>
			</BaseControl>
			<BaseControl
				label={ __( 'Min width', 'flexible-spacer-block' ) }
				id="flexible-table-block/width"
			>
				<UnitControl
					labelPosition="top"
					min="0"
					value={ minWidth }
					onChange={ ( value ) => {
						setAttributes({ minWidth: toUnitVal( value ) });
					} }
					units={ tabeWidthUnits }
				/>
			</BaseControl>
			<BaseControl
				label={ __( 'Max width', 'flexible-spacer-block' ) }
				id="flexible-table-block/width"
			>
				<UnitControl
					labelPosition="top"
					min="0"
					value={ maxWidth }
					onChange={ ( value ) => {
						setAttributes({ maxWidth: toUnitVal( value ) });
					} }
					units={ tabeWidthUnits }
				/>
			</BaseControl>
			<SelectControl
				label={ __( 'Fixed control', 'flexible-spacer-block' ) }
				value={ sticky }
				onChange={ onChangeSticky }
				options={ STICKY_CONTROLS.map( ({ label, value }) => {
					return { label, value };
				}) }
			/>
			<BaseControl
				label={ __( 'Cell borders', 'flexible-spacer-block' ) }
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
								onClick={ () =>{
									setAttributes({ borderCollapse: value });
									setAttributes({ borderSpacingHorizontal: undefined });
									setAttributes({ borderSpacingVertical: undefined });
								} }
							>
								{ label }
							</Button>
						);
					}) }
				</ButtonGroup>
			</BaseControl>
			{ 'separate' === borderCollapse && (
				<BaseControl
					label={ __( 'Distance between the borders', 'flexible-spacer-block' ) }
					id="flexible-table-block/padding"
				>
					<div className="wp-block-flexible-table-block-table__spacing-control">
						<UnitControl
							label={ __( 'Horizontal', 'flexible-spacer-block' ) }
							labelPosition="top"
							min="0"
							max={ BORDER_SPACING_MAX }
							value={ borderSpacingHorizontal }
							onChange={ ( value ) => {
								setAttributes({ borderSpacingHorizontal: toUnitVal( value ) });
							} }
							units={ borderSpacingUnits }
						/>
						<UnitControl
							label={ __( 'Vertical', 'flexible-spacer-block' ) }
							labelPosition="top"
							min="0"
							max={ BORDER_SPACING_MAX }
							value={ borderSpacingVertical }
							onChange={ ( value ) => {
								setAttributes({ borderSpacingVertical: toUnitVal( value ) });
							} }
							units={ borderSpacingUnits }
						/>
					</div>
				</BaseControl>
			)}
		</PanelBody>
	);
}
