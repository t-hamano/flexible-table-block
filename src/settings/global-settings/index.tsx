/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
// @ts-ignore: has no exported member
import { store as coreStore } from '@wordpress/core-data';
import { Button, Spinner, __experimentalHStack as HStack } from '@wordpress/components';
import { help } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { STORE_NAME } from '../../constants';
import HelpModal from './help-modal';
import SettingModal from './setting-modal';
import type { StoreOptions } from '../../store';

export default function GlobalSettings() {
	const { options, isAdministrator, hasResolved } = useSelect( ( select ) => {
		return {
			// @ts-ignore
			options: select( STORE_NAME ).getOptions() as StoreOptions,
			isAdministrator: !! select( coreStore ).canUser( 'create', 'users' ),
			hasResolved:
				// @ts-ignore
				select( STORE_NAME ).hasFinishedResolution( 'getOptions' ) &&
				select( coreStore ).hasFinishedResolution( 'canUser', [ 'create', 'users' ] ),
		};
	}, [] );

	const [ isSettingModalOpen, setIsSettingModalOpen ] = useState( false );
	const [ isHelpModalOpen, setIsHelpModalOpen ] = useState( false );

	const showGlobalSetting = isAdministrator || options?.show_global_setting;

	return (
		<>
			<HStack>
				{ ! hasResolved && <Spinner /> }
				{ hasResolved && showGlobalSetting && (
					<Button variant="primary" onClick={ () => setIsSettingModalOpen( true ) } size="compact">
						{ __( 'Edit global setting', 'flexible-table-block' ) }
					</Button>
				) }
				<Button
					icon={ help }
					variant="link"
					onClick={ () => setIsHelpModalOpen( true ) }
					label={ __( 'Help', 'flexible-table-block' ) }
					size="compact"
				/>
			</HStack>
			{ isHelpModalOpen && <HelpModal { ...{ setIsHelpModalOpen } } /> }
			{ options && isSettingModalOpen && ( isAdministrator || options?.show_global_setting ) && (
				<SettingModal
					{ ...{
						options,
						isAdministrator,
						setIsSettingModalOpen,
					} }
				/>
			) }
		</>
	);
}
