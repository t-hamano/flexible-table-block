/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { PanelBody } from '@wordpress/components';

export default function CellsSettingsControls() {
	return (
		<PanelBody
			title={ __( 'Cells Settings', 'flexible-spacer-block' ) }
			initialOpen= { false }
		></PanelBody>
	);
}
