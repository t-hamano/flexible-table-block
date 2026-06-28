/**
 * External dependencies
 */
import type { Property, Properties } from 'csstype';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	Button,
	TextControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
	__experimentalUnitControl as UnitControl,
	__experimentalUseCustomUnits as useCustomUnits,
} from '@wordpress/components';
import { Stack } from '@wordpress/ui';

/**
 * Internal dependencies
 */
import { FONT_SIZE_UNITS, TEXT_ALIGNMENT_CONTROLS, CAPTION_SIDE_CONTROLS } from '../constants';
import { PaddingControl } from '../controls';
import { convertToInline } from '../utils/style-converter';
import { pickPadding, type DirectionProps } from '../utils/style-picker';
import { updatePadding } from '../utils/style-updater';
import { sanitizeUnitValue } from '../utils/helper';
import type { CaptionSideValue, BlockAttributes } from '../BlockAttributes';

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

	const onChangeFontSize = ( value: Property.FontSize | undefined ) => {
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

	const onChangeSide = ( value: string | number | undefined ) => {
		const isAllowedValue = ( _value: any ): _value is CaptionSideValue => {
			return CAPTION_SIDE_CONTROLS.some( ( control ) => control.value === _value );
		};
		if ( isAllowedValue( value ) ) {
			setAttributes( { captionSide: value } );
		}
	};

	const onChangeAlign = ( value: string | number | undefined ) => {
		const isAllowedValue = ( _value: any ): _value is Properties[ 'textAlign' ] => {
			return ! value || TEXT_ALIGNMENT_CONTROLS.some( ( control ) => control.value === _value );
		};
		if ( isAllowedValue( value ) ) {
			const newStylesObj = {
				...captionStylesObj,
				textAlign: value === captionStylesObj.textAlign ? undefined : value,
			};
			setAttributes( {
				captionStyles: convertToInline( newStylesObj ),
			} );
		}
	};

	const onResetSettings = () => {
		setAttributes( {
			captionSide: 'bottom',
			captionStyles: undefined,
		} );
	};

	return (
		<>
			<Stack
				align="center"
				justify="flex-end"
				className="ftb-table-caption-settings-clear"
				style={ { marginBottom: '16px' } }
			>
				<Button variant="link" isDestructive onClick={ onResetSettings }>
					{ __( 'Clear caption settings', 'flexible-table-block' ) }
				</Button>
			</Stack>
			<Stack align="flex-end" justify="space-between" gap="sm" style={ { marginBottom: '16px' } }>
				<div className="ftb-table-caption-settings-font-size" style={ { flex: 1 } }>
					<UnitControl
						label={ __( 'Caption font size', 'flexible-table-block' ) }
						value={ captionStylesObj?.fontSize }
						units={ fontSizeUnits }
						min={ 0 }
						onChange={ onChangeFontSize }
						size="__unstable-large"
					/>
				</div>
				<div className="ftb-table-caption-settings-line-height" style={ { flex: 1 } }>
					<TextControl
						label={ __( 'Caption line height', 'flexible-table-block' ) }
						autoComplete="off"
						onChange={ onChangeLineHeight }
						step={ 0.1 }
						type="number"
						value={ captionStylesObj?.lineHeight || '' }
						min={ 0 }
						__next40pxDefaultSize
					/>
				</div>
			</Stack>
			<PaddingControl
				className="ftb-table-caption-settings-padding"
				label={ __( 'Caption padding', 'flexible-table-block' ) }
				values={ pickPadding( captionStylesObj ) }
				onChange={ onChangePadding }
			/>
			<ToggleGroupControl
				__next40pxDefaultSize
				className="ftb-table-caption-settings-position"
				label={ __( 'Caption position', 'flexible-table-block' ) }
				value={ captionSide }
				isBlock
				onChange={ onChangeSide }
			>
				{ CAPTION_SIDE_CONTROLS.map( ( { label, value } ) => (
					<ToggleGroupControlOption key={ value } value={ value } label={ label } />
				) ) }
			</ToggleGroupControl>
			<ToggleGroupControl
				__next40pxDefaultSize
				className="ftb-table-caption-settings-text-alignment"
				label={ __( 'Caption text alignment', 'flexible-table-block' ) }
				value={ captionStylesObj?.textAlign }
				isDeselectable
				onChange={ onChangeAlign }
			>
				{ TEXT_ALIGNMENT_CONTROLS.map( ( { icon, label, value } ) => (
					<ToggleGroupControlOptionIcon
						key={ value }
						value={ value }
						icon={ icon }
						label={ label }
					/>
				) ) }
			</ToggleGroupControl>
		</>
	);
}
