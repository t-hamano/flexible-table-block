/**
 * External dependencies
 */
import type { Property, Properties } from 'csstype';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	BaseControl,
	Button,
	ButtonGroup,
	TextControl,
	// @ts-ignore: has no exported member
	__experimentalUnitControl as UnitControl,
	// @ts-ignore: has no exported member
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
import type { CaptionSideValue, TextAlignValue, BlockAttributes } from '../BlockAttributes';
import type { DirectionProps } from '../utils/style-picker';

type Props = {
	attributes: BlockAttributes;
	setAttributes: ( attrs: Partial< BlockAttributes > ) => void;
	captionStylesObj: Properties;
};

export default function TableCaptionSettings( {
	attributes,
	setAttributes,
	captionStylesObj,
}: Props ) {
	const { captionSide } = attributes;

	const fontSizeUnits = useCustomUnits( { availableUnits: FONT_SIZE_UNITS } );

	const onChangeFontSize = ( value: Property.FontSize ) => {
		const newStylesObj = {
			...captionStylesObj,
			fontSize: sanitizeUnitValue( value ),
		};
		setAttributes( { captionStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeLineHeight = ( value: Property.LineHeight ) => {
		const newStylesObj = {
			...captionStylesObj,
			lineHeight: value,
		};
		setAttributes( { captionStyles: convertToInline( newStylesObj ) } );
	};

	const onChangePadding = ( values: DirectionProps ) => {
		const newStylesObj = updatePadding( captionStylesObj, values );
		setAttributes( { captionStyles: convertToInline( newStylesObj ) } );
	};

	const onChangeSide = ( value: CaptionSideValue ) => {
		setAttributes( { captionSide: value } );
	};

	const onChangeAlign = ( value: TextAlignValue ) => {
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
				id="flexible-table-block-caption-clear-settings"
				className="ftb-reset-settings-control"
			>
				<Button isLink isDestructive onClick={ onResetSettings }>
					{ __( 'Clear Caption Settings', 'flexible-table-block' ) }
				</Button>
			</BaseControl>
			<BaseControl
				id="flexible-table-block-caption-font-size"
				label={ __( 'Caption Font Size', 'flexible-table-block' ) }
				className="ftb-font-size-control"
			>
				<UnitControl
					id="flexible-table-block-caption-font-size"
					value={ captionStylesObj?.fontSize }
					units={ fontSizeUnits }
					min="0"
					onChange={ onChangeFontSize }
				/>
			</BaseControl>
			<BaseControl
				id="flexible-table-block-caption-line-height"
				className="ftb-line-height-control"
			>
				<TextControl
					label={ __( 'Caption Line Height', 'flexible-table-block' ) }
					autoComplete="off"
					onChange={ onChangeLineHeight }
					step={ 0.1 }
					type="number"
					value={ captionStylesObj?.lineHeight || '' }
					min={ 0 }
				/>
			</BaseControl>
			<PaddingControl
				id="flexible-table-block-caption-padding"
				label={ __( 'Caption Padding', 'flexible-table-block' ) }
				values={ pickPadding( captionStylesObj ) }
				onChange={ onChangePadding }
			/>
			<BaseControl id="flexible-table-block-caption-side">
				<div aria-labelledby="flexible-table-block-caption-side-heading" role="region">
					<span id="flexible-table-block-caption-side-heading" className="ftb-base-control-label">
						{ __( 'Caption Position', 'flexible-table-block' ) }
					</span>
					<ButtonGroup className="ftb-button-group">
						{ CAPTION_SIDE_CONTROLS.map( ( { label, value } ) => (
							<Button
								key={ value }
								label={ label }
								isPrimary={ captionSide === value }
								onClick={ () => onChangeSide( value ) }
							>
								{ label }
							</Button>
						) ) }
					</ButtonGroup>
				</div>
			</BaseControl>
			<BaseControl id="flexible-table-block-caption-align">
				<div aria-labelledby="flexible-table-block-caption-align-heading" role="region">
					<span id="flexible-table-block-caption-align-heading" className="ftb-base-control-label">
						{ __( 'Caption Text alignment', 'flexible-table-block' ) }
					</span>
					<ButtonGroup className="ftb-button-group">
						{ TEXT_ALIGNMENT_CONTROLS.map( ( { icon, label, value } ) => {
							return (
								<Button
									key={ value }
									label={ label }
									isPrimary={ value === captionStylesObj?.textAlign }
									isSecondary={ value !== captionStylesObj?.textAlign }
									icon={ icon }
									onClick={ () => onChangeAlign( value ) }
								/>
							);
						} ) }
					</ButtonGroup>
				</div>
			</BaseControl>
		</>
	);
}
