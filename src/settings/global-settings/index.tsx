/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { Button, IconButton, Spinner, Stack } from '@wordpress/ui';
import { help } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import HelpModal from './help-modal';
import SettingModal from './setting-modal';
import { store as ftbStore } from '../../store';

export default function GlobalSettings() {
	const { options, canManageOptions, hasResolved } = useSelect( ( select ) => {
		return {
			options: select( ftbStore ).getOptions(),
			canManageOptions: !! select( coreStore ).canUser( 'update', {
				kind: 'root',
				name: 'site',
			} ),
			hasResolved:
				select( ftbStore ).hasFinishedResolution( 'getOptions' ) &&
				select( coreStore ).hasFinishedResolution( 'canUser', [
					'update',
					{ kind: 'root', name: 'site' },
				] ),
		};
	}, [] );

	const [ isSettingModalOpen, setIsSettingModalOpen ] = useState( false );
	const [ isHelpModalOpen, setIsHelpModalOpen ] = useState( false );

	const showGlobalSetting = canManageOptions || options?.show_global_setting;

	return (
		<>
			<Stack align="center" justify="space-between" gap="sm">
				{ ! hasResolved && <Spinner /> }
				{ hasResolved && showGlobalSetting && (
					<Button onClick={ () => setIsSettingModalOpen( true ) } size="compact">
						{ __( 'Edit global setting', 'flexible-table-block' ) }
					</Button>
				) }
				<IconButton
					icon={ help }
					variant="minimal"
					onClick={ () => setIsHelpModalOpen( true ) }
					label={ __( 'Help', 'flexible-table-block' ) }
					size="compact"
				/>
			</Stack>
			{ isHelpModalOpen && <HelpModal { ...{ setIsHelpModalOpen } } /> }
			{ isSettingModalOpen && (
				<SettingModal
					{ ...{
						options,
						canManageOptions,
						setIsSettingModalOpen,
					} }
				/>
			) }
		</>
	);
}
