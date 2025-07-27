/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
// @ts-ignore: has no exported member
import { store as coreStore } from '@wordpress/core-data';
import { Button, PanelBody, Spinner, __experimentalHStack as HStack } from '@wordpress/components';
import { help } from '@wordpress/icons';

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
			<PanelBody
				title={ __( 'Global setting', 'flexible-table-block' ) }
				initialOpen={ false }
				className="flexible-table-block-global-setting-panel"
			>
				<HStack>
					{ ! isGlobalSettingLoaded && <Spinner /> }
					{ isGlobalSettingLoaded && showGlobalSetting && (
						<Button
							variant="primary"
							onClick={ () => setIsSettingModalOpen( true ) }
							size="compact"
						>
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
			</PanelBody>
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
