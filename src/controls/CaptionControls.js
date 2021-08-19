/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	BaseControl,
	Button,
	ButtonGroup,
	PanelBody,
	__experimentalUnitControl as UnitControl,
	__experimentalUseCustomUnits as useCustomUnits
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import { toUnitVal } from '../utils/helper';
import { ALIGNMENT_CONTROLS } from '../utils/constants';

export default function CaptionControls({
	attributes,
	setAttributes
}) {
	const { captionFontSize, captionSide, captionAlign } = attributes;

	const fontSizeUnits = useCustomUnits({
		availableUnits: [ 'px', 'em', 'rem', '%' ]
	});

	const onChangeCaptionFontSize = ( value ) => {
		setAttributes({ captionFontSize: toUnitVal( value ) });
	};

	const onChangeCaptionSide = ( value ) => {
		setAttributes({ captionSide: value });
	};

	const onChangeCaptionAlign = ( value ) => {
		setAttributes({ captionAlign: value === captionAlign ? undefined : value  });
	};

	return (
		<PanelBody
			title={ __( 'Caption Settings', 'flexible-table-block' ) }
			initialOpen= { false }
		>
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
				<ButtonGroup
					className="wp-block-flexible-table-block-table__components-button-group"
				>
					{ [ 'top', 'bottom' ].map( ( value ) => {
						return (
							<Button
								key={ value }
								variant={  value === captionSide ? 'primary' : 'secondary' }
								onClick={ () =>
									onChangeCaptionSide( value )
								}
							>
								{ value }
							</Button>
						);
					}) }
				</ButtonGroup>
			</BaseControl>
			<BaseControl
				label={ __( 'Text alignment', 'flexible-table-block' ) }
				id="flexible-table-block/caption-align"
			>
				<ButtonGroup
					className="wp-block-flexible-table-block-table__components-button-group"
				>
					{ ALIGNMENT_CONTROLS.map( ({ icon, title, align }) => {
						return (
							<Button
								key={ align }
								label= { title }
								variant={  align === captionAlign ? 'primary' : 'secondary' }
								icon={ icon }
								onClick={ () =>
									onChangeCaptionAlign( align )
								}
							/>
						);
					}) }
				</ButtonGroup>
			</BaseControl>
		</PanelBody>
	);
}
