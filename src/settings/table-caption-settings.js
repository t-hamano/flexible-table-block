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
import { FONT_SIZE_UNITS, TEXT_ALIGNMENT_CONTROLS } from '../constants';
import { PaddingControl } from '../controls';
import { toUnitVal } from '../utils/helper';
import { convertToInline } from '../utils/style-converter';
import { pickPadding } from '../utils/style-picker';
import { updatePadding } from '../utils/style-updater';

export default function TableCaptionSettings( props ) {
	const { captionStylesObj, attributes, setAttributes } = props;
	const { captionSide } = attributes;

	const fontSizeUnits = useCustomUnits( { availableUnits: FONT_SIZE_UNITS } );

	const onChangeCaptionFontSize = ( value ) => {
		const newStylesObj = {
			...captionStylesObj,
			fontSize: toUnitVal( value ),
		};
		setAttributes( { captionStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeCaptionPadding = ( values ) => {
		const newStylesObj = updatePadding( captionStylesObj, values );
		setAttributes( { captionStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeCaptionSide = ( value ) => {
		setAttributes( { captionSide: value } );
	};

	const onChangeCaptionAlign = ( value ) => {
		const newStylesObj = {
			...captionStylesObj,
			textAlign: value === captionStylesObj.textAlign ? undefined : value,
		};
		setAttributes( { captionStyles: convertToInline( newStylesObj ) } );
	};

	const onResetCaptionSettings = () => {
		setAttributes( {
			captionSide: 'bottom',
			captionStyles: undefined,
		} );
	};

	return (
		<>
			<BaseControl
				id="flexible-table-block/clear-caption-settings"
				className="ftb-reset-settings-control"
			>
				<Button variant="link" isDestructive onClick={ onResetCaptionSettings }>
					{ __( 'Clear Caption Settings', 'flexible-table-block' ) }
				</Button>
			</BaseControl>
			<BaseControl
				id="flexible-table-block/caption-font-size"
				label={ __( 'Font Size', 'flexible-table-block' ) }
			>
				<UnitControl
					value={ captionStylesObj?.fontSize }
					units={ fontSizeUnits }
					min="0"
					onChange={ onChangeCaptionFontSize }
				/>
			</BaseControl>
			<PaddingControl
				id="flexible-table-block/caption-padding"
				label={ __( 'Padding', 'flexible-table-block' ) }
				values={ pickPadding( captionStylesObj ) }
				onChange={ onChangeCaptionPadding }
			/>
			<BaseControl
				id="flexible-table-block/caption-side"
				label={ __( 'Position', 'flexible-table-block' ) }
			>
				<ToggleGroupControl
					value={ captionSide }
					onChange={ ( value ) => onChangeCaptionSide( value ) }
				>
					<ToggleGroupControlOption label={ __( 'Top', 'flexible-table-block' ) } value="top" />
					<ToggleGroupControlOption
						label={ __( 'Bottom', 'flexible-table-block' ) }
						value="bottom"
					/>
				</ToggleGroupControl>
			</BaseControl>
			<BaseControl
				id="flexible-table-block/caption-align"
				label={ __( 'Text alignment', 'flexible-table-block' ) }
			>
				<ButtonGroup className="ftb-button-group">
					{ TEXT_ALIGNMENT_CONTROLS.map( ( { icon, label, value } ) => {
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
