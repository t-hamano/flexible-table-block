/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	BaseControl,
	Button,
	ButtonGroup,
	PanelBody
} from '@wordpress/components';

export default function CaptionSettingsControls({
	attributes,
	setAttributes
}) {
	const { captionSide } = attributes;

	return (
		<PanelBody
			title={ __( 'Caption Settings', 'flexible-spacer-block' ) }
			initialOpen= { false }
		>
			<BaseControl
				label={ __( 'Position', 'flexible-spacer-block' ) }
				id="flexible-table-block/caption-side"
			>
				<ButtonGroup
					className="wp-block-flexible-table-block-table__components-button-group"
				>
					{ [ 'top', 'bottom' ].map( ( positionValue ) => {
						return (
							<Button
								key={ positionValue }
								variant={  positionValue === captionSide ? 'primary' : 'secondary' }
								onClick={ () =>
									setAttributes({ captionSide: positionValue })
								}
							>
								{ positionValue }
							</Button>
						);
					}) }
				</ButtonGroup>
			</BaseControl>
		</PanelBody>
	);
}
