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
import { toUnitVal } from '../utils/helper';
import { ALIGNMENT_CONTROLS } from '../utils/constants';

export default function CaptionSettings( { attributes, setAttributes } ) {
	const { captionFontSize, captionSide, captionAlign } = attributes;

	const fontSizeUnits = useCustomUnits( {
		availableUnits: [ 'px', 'em', 'rem', '%' ],
	} );

	const onChangeCaptionFontSize = ( value ) => {
		setAttributes( { captionFontSize: toUnitVal( value ) } );
	};

	const onChangeCaptionSide = ( value ) => {
		setAttributes( { captionSide: value } );
	};

	const onChangeCaptionAlign = ( value ) => {
		setAttributes( {
			captionAlign: value === captionAlign ? undefined : value,
		} );
	};

	return (
		<>
			<BaseControl
				label={ __( 'Font size', 'flexible-table-block' ) }
				id="flexible-table-block/caption-font-size"
			>
				<UnitControl
					labelPosition="top"
					min="0"
					value={ captionFontSize }
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
				<ButtonGroup className="ftb-components__button-group">
					{ ALIGNMENT_CONTROLS.map( ( { icon, title, value } ) => {
						return (
							<Button
								key={ value }
								label={ title }
								variant={ value === captionAlign ? 'primary' : 'secondary' }
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
