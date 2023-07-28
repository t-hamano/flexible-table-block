/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
// @ts-ignore: has no exported member
import { store as coreStore } from '@wordpress/core-data';
import { Button, Spinner } from '@wordpress/components';
import { cog, help } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { STORE_NAME } from '../../constants';
import HelpModal from './help-modal';
import SettingModal from './setting-modal';
import type { StoreOptions } from '../../store';

export default function GlobalSettings() {
	const storeOptions: StoreOptions = useSelect(
		( select ) =>
			select( STORE_NAME )
				// @ts-ignore
				.getOptions(),
		[]
	);

	const isAdministrator: boolean = useSelect(
		( select ) => select( coreStore ).canUser( 'create', 'users' ),
		[]
	);

	const [ isSettingModalOpen, setIsSettingModalOpen ] = useState< boolean >( false );
	const [ isHelpModalOpen, setIsHelpModalOpen ] = useState< boolean >( false );
	const [ options, setOptions ] = useState< StoreOptions >();

	// Set options to state.
	useEffect( () => {
		setOptions( storeOptions );
	}, [ storeOptions ] );

	const isGlobalSettingLoaded = isAdministrator !== undefined && options !== undefined;
	const showGlobalSetting = isAdministrator || options?.show_global_setting;

	return (
		<>
			<div className="ftb-global-setting">
				<Button icon={ help } variant="link" onClick={ () => setIsHelpModalOpen( true ) }>
					{ __( 'Help', 'flexible-table-block' ) }
				</Button>
				{ ! isGlobalSettingLoaded && <Spinner /> }
				{ isGlobalSettingLoaded && showGlobalSetting && (
					<Button
						icon={ cog }
						iconSize="20"
						variant="primary"
						onClick={ () => setIsSettingModalOpen( true ) }
					>
						{ __( 'Global setting', 'flexible-table-block' ) }
					</Button>
				) }
			</div>
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
