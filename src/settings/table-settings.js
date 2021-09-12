/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	BaseControl,
	Button,
	ButtonGroup,
	SelectControl,
	ToggleControl,
	__experimentalBoxControl as BoxControl,
	__experimentalUnitControl as UnitControl,
	__experimentalUseCustomUnits as useCustomUnits,
} from '@wordpress/components';
import { __experimentalBorderRadiusControl as BorderRadiusControl } from '@wordpress/block-editor';

/**
 * Internal components
 */
import BorderStyleControl from '../controls/border-style-control';
import { BORDER_COLLAPSE_CONTROLS, STICKY_CONTROLS } from '../utils/constants';
import { toggleSection } from '../utils/state';
import { toUnitVal } from '../utils/helper';
import { convertToInline } from '../utils/style-converter';
import {
	updateBorderWidth,
	updateBorderRadius,
	updateBorderStyle,
	updateBorderColor,
	updateBorderSpacing,
} from '../utils/style-updater';

export default function TableSettings( props ) {
	const { tableStylesObj, attributes, setAttributes } = props;
	const { hasFixedLayout, sticky, head, foot } = attributes;

	const tableWidthUnits = useCustomUnits( {
		availableUnits: [ 'px', 'em', 'rem', '%' ],
	} );

	const borderWidthUnits = useCustomUnits( {
		availableUnits: [ 'px', 'em', 'rem' ],
	} );

	const borderSpacingUnits = useCustomUnits( {
		availableUnits: [ 'px', 'em', 'rem' ],
	} );

	const onChangeFixedLayout = () => {
		setAttributes( { hasFixedLayout: ! hasFixedLayout } );
	};

	const onChangeSticky = ( value ) => {
		setAttributes( { sticky: 'none' === value ? undefined : value } );
	};

	const onToggleHeaderSection = () => {
		setAttributes( toggleSection( attributes, 'head' ) );
	};

	const onToggleFooterSection = () => {
		setAttributes( toggleSection( attributes, 'foot' ) );
	};

	const onChangeWidth = ( value ) => {
		setAttributes( {
			tableStyles: convertToInline( {
				...tableStylesObj,
				width: toUnitVal( value ),
			} ),
		} );
	};

	const onChangeMaxWidth = ( value ) => {
		setAttributes( {
			tableStyles: convertToInline( {
				...tableStylesObj,
				maxWidth: toUnitVal( value ),
			} ),
		} );
	};

	const onChangeMinWidth = ( value ) => {
		setAttributes( {
			tableStyles: convertToInline( {
				...tableStylesObj,
				minWidth: toUnitVal( value ),
			} ),
		} );
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

	const onChangeBorderCollor = ( values ) => {
		const newStylesObj = updateBorderColor( tableStylesObj, values );
		setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeBorderCollapse = ( value ) => {
		const borderCollapse = tableStylesObj?.borderCollapse === value ? undefined : value;
		const borderSpacing = 'separate' === borderCollapse ? tableStylesObj?.borderSpacing : undefined;

		setAttributes( {
			tableStyles: convertToInline( {
				...tableStylesObj,
				borderCollapse,
				borderSpacing,
			} ),
		} );
	};

	const onChangeBorderSpacing = ( values ) => {
		const newStylesObj = updateBorderSpacing( tableStylesObj, values );
		setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	return (
		<>
			<BorderStyleControl
				id="flexible-table-block/border-style"
				label={ __( 'Border style', 'flexible-table-block' ) }
				onChange={ onChangeBorderStyle }
				values={ tableStylesObj?.borderStyle }
			/>
			<div className="ftb-components__box-control">
				<BoxControl
					values={ tableStylesObj?.borderWidth }
					onChange={ onChangeBorderWidth }
					label={ __( 'Border Width', 'flexible-table-block' ) }
					units={ borderWidthUnits }
				/>
			</div>
			<BorderRadiusControl
				onChange={ onChangeBorderRadius }
				values={ tableStylesObj?.borderRadius }
			/>
			<hr />
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
				options={ STICKY_CONTROLS.map( ( { label, value } ) => {
					return { label, value };
				} ) }
			/>
			<hr />
			<BaseControl label={ __( 'Width', 'flexible-table-block' ) } id="flexible-table-block/width">
				<UnitControl
					labelPosition="top"
					min="0"
					value={ tableStylesObj?.width }
					onChange={ onChangeWidth }
					units={ tableWidthUnits }
				/>
				<ButtonGroup
					aria-label={ __( 'Percentage width' ) }
					className="ftb-components__percent-group"
				>
					{ [ 25, 50, 75, 100 ].map( ( perWidth ) => {
						return (
							<Button
								key={ perWidth }
								isSmall
								isPressed={ tableStylesObj?.width === `${ perWidth }%` }
								onClick={ () => onChangeWidth( `${ perWidth }%` ) }
							>
								{ `${ perWidth }%` }
							</Button>
						);
					} ) }
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
					className="ftb-components__percent-group"
				>
					{ [ 25, 50, 75, 100 ].map( ( perWidth ) => {
						return (
							<Button
								key={ perWidth }
								isSmall
								isPressed={ tableStylesObj?.maxWidth === `${ perWidth }%` }
								onClick={ () => onChangeMaxWidth( `${ perWidth }%` ) }
							>
								{ `${ perWidth }%` }
							</Button>
						);
					} ) }
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
					className="ftb-components__percent-group"
				>
					{ [ 25, 50, 75, 100 ].map( ( perWidth ) => {
						return (
							<Button
								key={ perWidth }
								isSmall
								isPressed={ tableStylesObj?.minWidth === `${ perWidth }%` }
								onClick={ () => onChangeMinWidth( `${ perWidth }%` ) }
							>
								{ `${ perWidth }%` }
							</Button>
						);
					} ) }
				</ButtonGroup>
			</BaseControl>
			<hr />
			<BaseControl
				label={ __( 'Cell borders', 'flexible-table-block' ) }
				id="flexible-table-block/border-collapse"
			>
				<ButtonGroup className="ftb-components__button-group">
					{ BORDER_COLLAPSE_CONTROLS.map( ( { label, value } ) => {
						return (
							<Button
								key={ value }
								variant={ value === tableStylesObj?.borderCollapse ? 'primary' : 'secondary' }
								onClick={ () => onChangeBorderCollapse( value ) }
							>
								{ label }
							</Button>
						);
					} ) }
				</ButtonGroup>
			</BaseControl>
			{ 'separate' === tableStylesObj?.borderCollapse && (
				<BoxControl
					values={ tableStylesObj?.borderSpacing }
					onChange={ onChangeBorderSpacing }
					label={ __( 'Border spacing', 'flexible-table-block' ) }
					units={ borderSpacingUnits }
					splitOnAxis={ true }
				/>
			) }
		</>
	);
}
