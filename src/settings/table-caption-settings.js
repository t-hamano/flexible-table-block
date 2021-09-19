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
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import { FONT_SIZE_UNITS, ALIGNMENT_CONTROLS } from '../constants';
import { toUnitVal } from '../utils/helper';
import { convertToInline } from '../utils/style-converter';

export default function TableCaptionSettings( props ) {
	const { captionStylesObj, attributes, setAttributes } = props;
	const { captionSide } = attributes;

	const fontSizeUnits = useCustomUnits( {
		availableUnits: FONT_SIZE_UNITS,
	} );

	const onChangeCaptionFontSize = ( value ) => {
		const newStylesObj = {
			...captionStylesObj,
			fontSize: toUnitVal( value ),
		};
		setAttributes( { captionStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeCaptionSide = ( value ) => {
		setAttributes( { captionSide: value } );
	};

	const onChangeCaptionAlign = ( value ) => {
		const newStylesObj = {
			...captionStylesObj,
			textAlign: value === captionStylesObj ? undefined : value,
		};
		setAttributes( { captionStyles: convertToInline( newStylesObj ) } );
	};

	return (
		<>
			<BaseControl
				label={ __( 'Font size', 'flexible-table-block' ) }
				id="flexible-table-block/caption-font-size"
			>
				<UnitControl
					min="0"
					value={ captionStylesObj?.fontSize }
					onChange={ onChangeCaptionFontSize }
					units={ fontSizeUnits }
				/>
			</BaseControl>
			<BaseControl
				label={ __( 'Position', 'flexible-table-block' ) }
				id="flexible-table-block/caption-side"
			>
				<ToggleGroupControl
					value={ captionSide }
					onChange={ ( value ) => onChangeCaptionSide( value ) }
				>
					<ToggleGroupControlOption value="top" label={ __( 'Top', 'flexible-table-block' ) } />
					<ToggleGroupControlOption
						value="bottom"
						label={ __( 'Bottom', 'flexible-table-block' ) }
					/>
				</ToggleGroupControl>
			</BaseControl>
			<BaseControl
				label={ __( 'Text alignment', 'flexible-table-block' ) }
				id="flexible-table-block/caption-align"
			>
				<ButtonGroup className="ftb-button-group">
					{ ALIGNMENT_CONTROLS.map( ( { icon, label, value } ) => {
						return (
							<Button
								key={ value }
								label={ label }
								variant={ value === captionStylesObj?.textAlign ? 'primary' : 'secondary' }
								icon={ icon }
								onClick={ () => onChangeCaptionAlign( value ) }
							/>
						);
					} ) }
				</ButtonGroup>
			</BaseControl>
		</>
	);
}
