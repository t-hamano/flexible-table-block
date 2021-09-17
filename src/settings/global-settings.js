/**
 * External dependencies
 */
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/css/css';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/closetag';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';
import { store as coreStore } from '@wordpress/core-data';
import {
	Button,
	RangeControl,
	ToggleControl,
	Modal,
	Spinner,
	BaseControl,
	Popover,
	Notice,
} from '@wordpress/components';
import { mobile, desktop } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import {
	CODEMIRROR_OPTIONS,
	MIN_RESPONSIVE_BREAKPOINT,
	MAX_RESPONSIVE_BREAKPOINT,
	DEFAULT_RESPONSIVE_BREAKPOINT,
	RESPONSIVE_BREAKPOINTS,
} from './constants';
import { STORE_NAME } from '../store';
import { store } from '@wordpress/block-editor';

/* eslint-disable no-undef */
export default function GlobalSettings() {
	const storeOptions = useSelect( ( select ) => {
		return select( STORE_NAME ).getOptions();
	} );

	const isAdministrator = useSelect( ( select ) => {
		return select( coreStore ).canUser( 'create', 'users' );
	} );

	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const [ notice, setNotice ] = useState( { isShow: false } );
	const [ isResetPopup, setIsResetPopup ] = useState( false );
	const [ isWaiting, setIsWaiting ] = useState( false );
	const [ optionsState, setOptionsState ] = useState( storeOptions );

	const { setOptions } = useDispatch( STORE_NAME );

	const tooltip = ( value ) => `${ value }px`;

	// Fallback if the component is mounted before the store's API response is returned.
	useEffect( () => {
		if ( 0 !== Object.keys( optionsState ).length ) return;

		apiFetch( {
			path: '/flexible-table-block/v1/get_options',
			method: 'GET',
		} ).then( ( response ) => {
			setOptionsState( response );
		} );
	}, [] );

	// Initialize notice message.
	useEffect( () => {
		setNotice( { isShow: false } );
	}, [ isModalOpen ] );

	// Update state and store options.
	const handleUpdateOptions = () => {
		setIsWaiting( true );
		setNotice( { isShow: false } );
		setOptions( optionsState );

		apiFetch( {
			path: '/flexible-table-block/v1/update_options',
			method: 'POST',
			data: optionsState,
		} )
			.then( ( response ) => {
				document.querySelectorAll( '.ftb-global-setting-modal' )[ 0 ].focus();

				setIsWaiting( false );
				setNotice( {
					isShow: true,
					status: response.status,
					message: response.message,
				} );
			} )
			.catch( ( response ) => {
				document.querySelectorAll( '.ftb-global-setting-modal' )[ 0 ].focus();

				setIsWaiting( false );
				setNotice( {
					isShow: true,
					status: 'error',
					message: response.message,
				} );
			} );
	};

	// Reset state and store options.
	const handleResetOptions = () => {
		setIsWaiting( true );
		setNotice( { isShow: false } );

		apiFetch( {
			path: '/flexible-table-block/v1/delete_options',
			method: 'POST',
		} ).then( ( response ) => {
			document.querySelectorAll( '.ftb-global-setting-modal' )[ 0 ].focus();
			setIsWaiting( false );

			setNotice( {
				isShow: true,
				status: response.status,
				message: response.message,
			} );

			setOptionsState( response.options );
			setOptions( response.options );
		} );
	};

	return (
		<div className="ftb-global-setting">
			{ ( isAdministrator || optionsState.show_global_setting ) && (
				<>
					<Button
						variant="link"
						onClick={ () => {
							setIsModalOpen( true );
						} }
					>
						{ __( 'Global Setting', 'flexible-table-block' ) }
					</Button>
					{ isModalOpen && (
						<Modal
							title={ __( 'Flexible Table Block Global Setting', 'flexible-table-block' ) }
							className="ftb-global-setting-modal"
							onRequestClose={ () => setIsModalOpen( false ) }
						>
							{ isWaiting && (
								<div className="ftb-global-setting-modal__loading">
									<Spinner />
								</div>
							) }
							<ToggleControl
								label={ __( 'Show section labels on table in the editor', 'flexible-table-block' ) }
								checked={ optionsState.show_section_label }
								onChange={ ( value ) => {
									setOptionsState( {
										...optionsState,
										show_section_label: value,
									} );
								} }
							/>
							{ isAdministrator && (
								<ToggleControl
									label={ __(
										'Show global settings link to non-administrative users',
										'flexible-table-block'
									) }
									checked={ optionsState.show_global_setting }
									onChange={ ( value ) => {
										setOptionsState( {
											...optionsState,
											show_global_setting: value,
										} );
									} }
								/>
							) }
							<hr />
							<RangeControl
								label={ __( 'Responsive breakpoint (px)', 'flexible-spacer-block' ) }
								beforeIcon={ mobile }
								afterIcon={ desktop }
								allowReset
								min={ MIN_RESPONSIVE_BREAKPOINT }
								max={ MAX_RESPONSIVE_BREAKPOINT }
								renderTooltipContent={ tooltip }
								marks={ RESPONSIVE_BREAKPOINTS }
								value={ parseInt( optionsState.breakpoint ) }
								onChange={ ( value ) => {
									setOptionsState( {
										...optionsState,
										breakpoint: value ? value : DEFAULT_RESPONSIVE_BREAKPOINT,
									} );
								} }
								help={ __(
									'Set the screen width (breakpoint) as the basis for switching between PC and mobile devices.',
									'flexible-spacer-block'
								) }
							/>
							<hr />
							<BaseControl
								label={ __( 'Global CSS', 'flexible-table-block' ) }
								id="flexible-table-block/global-setting-css"
								help={ __(
									'Defines the default style. This CSS will be applied to both the frontend and the block editor.',
									'flexible-spacer-block'
								) }
							>
								<div id="flexible-table-block/global-setting-css">
									<CodeMirror
										value={ optionsState.css }
										options={ CODEMIRROR_OPTIONS }
										onBeforeChange={ ( editor, data, value ) => {
											setOptionsState( {
												...optionsState,
												css: value,
											} );
										} }
										onKeyUp={ ( editor, event ) => {
											// Prefer code indent with tab key, close modal with Escape key.
											if ( event.key === 'Tab' ) {
												event.stopPropagation();
											} else if ( event.key === 'Escape' ) {
												setIsModalOpen( false );
											}
										} }
									/>
								</div>
							</BaseControl>
							{ notice.isShow && (
								<Notice
									className="ftb-global-setting-modal__notice"
									status={ notice.status }
									onRemove={ () => {
										setNotice( { isShow: false } );
										document.querySelectorAll( '.ftb-global-setting-modal' )[ 0 ].focus();
									} }
								>
									{ notice.message }
								</Notice>
							) }
							<div className="ftb-global-setting-modal__buttons">
								<Button variant="primary" disabled={ isWaiting } onClick={ handleUpdateOptions }>
									{ __( 'Save', 'flexible-spacer-block' ) }
								</Button>
								<Button
									variant="link"
									disabled={ isWaiting }
									onClick={ () => {
										setIsResetPopup( ! isResetPopup );
									} }
								>
									{ __( 'Reset Setting', 'flexible-spacer-block' ) }
									{ isResetPopup && (
										<Popover
											className="ftb-global-setting-modal__confirm-popover"
											focusOnMount="container"
											position="top right"
											onClose={ () => {
												setIsResetPopup( false );
											} }
										>
											<p>{ __( 'Are you sure?', 'flexible-spacer-block' ) }</p>
											<div className="ftb-global-setting-modal__confirm-popover-buttons">
												<Button variant="link" isDestructive onClick={ handleResetOptions }>
													{ __( 'Reset', 'flexible-spacer-block' ) }
												</Button>
												<Button
													variant="link"
													onClick={ () => {
														setIsResetPopup( false );
													} }
												>
													{ __( 'Cancel', 'flexible-spacer-block' ) }
												</Button>
											</div>
										</Popover>
									) }
								</Button>
							</div>
						</Modal>
					) }
				</>
			) }
		</div>
	);
}
