/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	BaseControl,
	Button,
	ButtonGroup,
	__experimentalUnitControl as UnitControl,
	__experimentalUseCustomUnits as useCustomUnits,
} from '@wordpress/components';

/**
 * Internal components
 */
import { CELL_WIDTH_UNITS, CELL_TAG_CONTROLS } from '../constants';
import {
	BorderRadiusControl,
	BorderWidthControl,
	BorderStyleControl,
	BorderColorControl,
	PaddingControl,
} from '../controls';
import { toUnitVal } from '../utils/helper';
import { convertToInline } from '../utils/style-converter';
import {
	pickPadding,
	pickBorderWidth,
	pickBorderRadius,
	pickBorderStyle,
	pickBorderColor,
} from '../utils/style-picker';
import {
	updatePadding,
	updateBorderWidthStyles,
	updateBorderRadius,
	updateBorderStyle,
	updateBorderColor,
} from '../utils/style-updater';

export default function TableCellSettings( props ) {
	const { tableStylesObj, attributes, setAttributes } = props;

	const cellWidthUnits = useCustomUnits( {
		availableUnits: CELL_WIDTH_UNITS,
	} );

	const onChangeWidth = ( value ) => {
		// const newStylesObj = {
		// 	...tableStylesObj,
		// 	width: toUnitVal( value ),
		// };
		// setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangePadding = ( values ) => {
		// const newStylesObj = updatePadding( tableStylesObj, values );
		// setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeBorderWidth = ( values ) => {
		// const newStylesObj = updateBorderWidthStyles( tableStylesObj, values );
		// setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeBorderRadius = ( values ) => {
		// const newStylesObj = updateBorderRadius( tableStylesObj, values );
		// setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeBorderStyle = ( values ) => {
		// const newStylesObj = updateBorderStyle( tableStylesObj, values );
		// setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeBorderColor = ( values ) => {
		// const newStylesObj = updateBorderColor( tableStylesObj, values );
		// setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeTag = ( value ) => {
		// const newStylesObj = updateBorderColor( tableStylesObj, values );
		// setAttributes( { tableStyles: convertToInline( newStylesObj ) } );
	};

	return (
		<>
			<BaseControl
				label={ __( 'Width', 'flexible-table-block' ) }
				id="flexible-table-block/cell-width"
			>
				<UnitControl
					labelPosition="top"
					min="0"
					onChange={ onChangeWidth }
					units={ cellWidthUnits }
				/>
				<ButtonGroup
					aria-label={ __( 'Percentage width', 'flexible-table-block' ) }
					className="ftb-percent-group"
				>
					{ [ 25, 50, 75, 100 ].map( ( perWidth ) => {
						const isPressed = tableStylesObj?.width === `${ perWidth }%`;
						return (
							<Button
								key={ perWidth }
								isSmall
								variant={ isPressed ? 'primary' : undefined }
								onClick={ () => onChangeWidth( isPressed ? undefined : `${ perWidth }%` ) }
							>
								{ `${ perWidth }%` }
							</Button>
						);
					} ) }
				</ButtonGroup>
			</BaseControl>
			<hr />
			<PaddingControl
				id="flexible-table-block/cell-padding"
				onChange={ onChangePadding }
				// values={ pickPadding( tableStylesObj ) }
			/>
			<hr />
			<BorderRadiusControl
				id="flexible-table-block/cell-border-radius"
				onChange={ onChangeBorderRadius }
				// values={ pickBorderRadius( tableStylesObj ) }
			/>
			<BorderWidthControl
				id="flexible-table-block/cell-border-width"
				onChange={ onChangeBorderWidth }
				// values={ pickBorderWidth( tableStylesObj ) }
			/>
			<BorderStyleControl
				id="flexible-table-block/cell-border-style"
				onChange={ onChangeBorderStyle }
				// values={ pickBorderStyle( tableStylesObj ) }
			/>
			<BorderColorControl
				id="flexible-table-block/cell-border-color"
				onChange={ onChangeBorderColor }
				// values={ pickBorderColor( tableStylesObj ) }
			/>
			<hr />
			<BaseControl
				label={ __( 'Cell Tag', 'flexible-table-block' ) }
				id="flexible-table-block/table-border-collapse"
			>
				<ButtonGroup className="ftb-button-group">
					{ CELL_TAG_CONTROLS.map( ( { label, value } ) => {
						return (
							<Button
								key={ value }
								// variant={ value === tableStylesObj?.borderCollapse ? 'primary' : 'secondary' }
								onClick={ () => onChangeTag( value ) }
							>
								{ label }
							</Button>
						);
					} ) }
				</ButtonGroup>
			</BaseControl>
		</>
	);
}
