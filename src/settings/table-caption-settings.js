/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	BaseControl,
	Button,
	ButtonGroup,
	TextControl,
	__experimentalUnitControl as UnitControl,
	__experimentalUseCustomUnits as useCustomUnits,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import { FONT_SIZE_UNITS, TEXT_ALIGNMENT_CONTROLS, CAPTION_SIDE_CONTROLS } from '../constants';
import { PaddingControl } from '../controls';
import { convertToInline } from '../utils/style-converter';
import { pickPadding } from '../utils/style-picker';
import { updatePadding } from '../utils/style-updater';
import { sanitizeUnitValue } from '../utils/helper';

export default function TableCaptionSettings( props ) {
	const { captionStylesObj, attributes, setAttributes } = props;
	const { captionSide } = attributes;

	const fontSizeUnits = useCustomUnits( { availableUnits: FONT_SIZE_UNITS } );

	const onChangeFontSize = ( value ) => {
		const newStylesObj = {
			...captionStylesObj,
			fontSize: sanitizeUnitValue( value ),
		};
		setAttributes( { captionStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeLineHeight = ( value ) => {
		const newStylesObj = {
			...captionStylesObj,
			lineHeight: value,
		};
		setAttributes( { captionStyles: convertToInline( newStylesObj ) } );
	};

	const onChangePadding = ( values ) => {
		const newStylesObj = updatePadding( captionStylesObj, values );
		setAttributes( { captionStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeSide = ( value ) => {
		setAttributes( { captionSide: value } );
	};

	const onChangeAlign = ( value ) => {
		const newStylesObj = {
			...captionStylesObj,
			textAlign: value === captionStylesObj.textAlign ? undefined : value,
		};
		setAttributes( { captionStyles: convertToInline( newStylesObj ) } );
	};

	const onResetSettings = () => {
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
				<Button isLink variant="link" isDestructive onClick={ onResetSettings }>
					{ __( 'Clear Caption Settings', 'flexible-table-block' ) }
				</Button>
			</BaseControl>
			<BaseControl
				id="flexible-table-block/caption-font-size"
				label={ __( 'Caption Font Size', 'flexible-table-block' ) }
				className="ftb-font-size-control"
			>
				<UnitControl
					value={ captionStylesObj?.fontSize }
					units={ fontSizeUnits }
					min="0"
					onChange={ onChangeFontSize }
				/>
			</BaseControl>
			<BaseControl
				id="flexible-table-block/caption-line-height"
				label={ __( 'Caption Line Height', 'flexible-table-block' ) }
				className="ftb-line-height-control"
			>
				<TextControl
					autoComplete="off"
					onChange={ onChangeLineHeight }
					step={ 0.1 }
					type="number"
					value={ captionStylesObj?.lineHeight || '' }
					min={ 0 }
				/>
			</BaseControl>
			<PaddingControl
				id="flexible-table-block/caption-padding"
				label={ __( 'Caption Padding', 'flexible-table-block' ) }
				values={ pickPadding( captionStylesObj ) }
				onChange={ onChangePadding }
			/>
			<BaseControl
				id="flexible-table-block/caption-side"
				label={ __( 'Caption Position', 'flexible-table-block' ) }
			>
				<ButtonGroup className="ftb-button-group">
					{ CAPTION_SIDE_CONTROLS.map( ( { label, value } ) => (
						<Button
							key={ value }
							label={ label }
							isPrimary={ captionSide === value }
							variant={ captionSide === value ? 'primary' : undefined }
							onClick={ () => onChangeSide( value ) }
						>
							{ label }
						</Button>
					) ) }
				</ButtonGroup>
			</BaseControl>
			<BaseControl
				id="flexible-table-block/caption-align"
				label={ __( 'Caption Text alignment', 'flexible-table-block' ) }
			>
				<ButtonGroup className="ftb-button-group">
					{ TEXT_ALIGNMENT_CONTROLS.map( ( { icon, label, value } ) => {
						return (
							<Button
								key={ value }
								label={ label }
								isPrimary={ value === captionStylesObj?.textAlign }
								isSecondary={ value !== captionStylesObj?.textAlign }
								variant={ value === captionStylesObj?.textAlign ? 'primary' : 'secondary' }
								icon={ icon }
								onClick={ () => onChangeAlign( value ) }
							/>
						);
					} ) }
				</ButtonGroup>
			</BaseControl>
		</>
	);
}
