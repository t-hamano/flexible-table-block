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
	ButtonGroup,
	BaseControl,
	RangeControl,
	ToggleControl,
	Modal,
	Spinner,
	Popover,
	Notice,
	ColorPalette,
	ColorIndicator,
	__experimentalUnitControl as UnitControl,
	__experimentalUseCustomUnits as useCustomUnits,
} from '@wordpress/components';
import { mobile, desktop } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import {
	STORE_NAME,
	REST_API_ROUTE,
	TABLE_WIDTH_UNITS,
	BORDER_COLLAPSE_CONTROLS,
	DEFAULT_RESPONSIVE_BREAKPOINT,
	MIN_RESPONSIVE_BREAKPOINT,
	MAX_RESPONSIVE_BREAKPOINT,
	RESPONSIVE_BREAKPOINTS,
	TEXT_ALIGNMENT_CONTROLS,
	VERTICAL_ALIGNMENT_CONTROLS,
} from '../constants';
import {
	BorderWidthControl,
	BorderStyleControl,
	BorderColorControl,
	PaddingControl,
} from '../controls';
import { toUnitVal } from '../utils/helper';

export default function GlobalSettings() {
	const storeOptions = useSelect( ( select ) => {
		return select( STORE_NAME ).getOptions();
	} );

	const isAdministrator = useSelect( ( select ) => {
		return select( coreStore ).canUser( 'create', 'users' );
	} );

	const tableWidthUnits = useCustomUnits( {
		availableUnits: TABLE_WIDTH_UNITS,
	} );

	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const [ notice, setNotice ] = useState();
	const [ isResetPopup, setIsResetPopup ] = useState( false );
	const [ isWaiting, setIsWaiting ] = useState( false );
	const [ options, setOptions ] = useState( storeOptions );

	const { setOptions: setStoreOptions } = useDispatch( STORE_NAME );

	const breakpointTooltip = ( value ) => `${ value }px`;

	// Fallback if the component is mounted before the store's API response is returned.
	useEffect( () => {
		if ( 0 !== Object.keys( options ).length ) return;
		apiFetch( {
			path: REST_API_ROUTE,
			method: 'GET',
		} ).then( ( response ) => {
			setOptions( response );
		} );
	}, [] );

	// Initialize notice message.
	useEffect( () => {
		setNotice();
	}, [ isModalOpen ] );

	// Update options.
	const handleUpdateOptions = () => {
		setIsWaiting( true );
		setNotice();
		setStoreOptions( options );

		apiFetch( {
			path: REST_API_ROUTE,
			method: 'POST',
			data: options,
		} )
			.then( ( response ) => {
				document.querySelector( '.ftb-global-setting-modal' ).focus();

				setIsWaiting( false );
				setNotice( {
					status: response.status,
					message: response.message,
				} );

				// Update inline CSS.
				const styleSheet = document.getElementById( 'flexible-table-block-inline-css' );
				if ( styleSheet ) {
					styleSheet.textContent = response.block_css;
				}
			} )
			.catch( ( response ) => {
				document.querySelector( '.ftb-global-setting-modal' ).focus();

				setIsWaiting( false );
				setNotice( {
					status: 'error',
					message: response.message,
				} );
			} );
	};

	// Reset state and store options.
	const handleResetOptions = () => {
		setIsWaiting( true );
		setNotice();

		apiFetch( {
			path: REST_API_ROUTE,
			method: 'DELETE',
		} ).then( ( response ) => {
			document.querySelector( '.ftb-global-setting-modal' ).focus();
			setIsWaiting( false );

			setNotice( {
				status: response.status,
				message: response.message,
			} );

			setOptions( response.options );
			setStoreOptions( response.options );

			// Update inline CSS.
			const styleSheet = document.getElementById( 'flexible-table-block-inline-css' );
			if ( styleSheet ) {
				styleSheet.textContent = response.block_css;
			}
		} );
	};

	return (
		<div className="ftb-global-setting">
			{ ( isAdministrator || options.show_global_setting ) && (
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
								label={ __( 'Show section labels in the editor', 'flexible-table-block' ) }
								checked={ !! options.show_label_on_section }
								onChange={ ( value ) => {
									setOptions( {
										...options,
										show_label_on_section: value,
									} );
								} }
							/>
							<ToggleControl
								label={ __(
									'Show insert row/column and select row/column buttons in the editor',
									'flexible-table-block'
								) }
								checked={ !! options.show_control_button }
								onChange={ ( value ) => {
									setOptions( {
										...options,
										show_control_button: value,
									} );
								} }
							/>
							<ToggleControl
								label={ __( 'Show dot on <th> tag in the editor', 'flexible-table-block' ) }
								checked={ !! options.show_dot_on_th }
								onChange={ ( value ) => {
									setOptions( {
										...options,
										show_dot_on_th: value,
									} );
								} }
							/>
							{ isAdministrator && (
								<ToggleControl
									label={ __(
										'Show global settings link to non-administrative users',
										'flexible-table-block'
									) }
									checked={ !! options.show_global_setting }
									onChange={ ( value ) => {
										setOptions( {
											...options,
											show_global_setting: value,
										} );
									} }
								/>
							) }
							<hr />
							<RangeControl
								label={ __( 'Responsive breakpoint (px)', 'flexible-table-block' ) }
								beforeIcon={ mobile }
								afterIcon={ desktop }
								allowReset
								trackColor="transparent"
								min={ MIN_RESPONSIVE_BREAKPOINT }
								max={ MAX_RESPONSIVE_BREAKPOINT }
								renderTooltipContent={ breakpointTooltip }
								marks={ RESPONSIVE_BREAKPOINTS }
								value={ parseInt( options.breakpoint ) }
								onChange={ ( value ) => {
									setOptions( {
										...options,
										breakpoint: value ? value : DEFAULT_RESPONSIVE_BREAKPOINT,
									} );
								} }
								help={ __(
									'Set the screen width (breakpoint) as the basis for switching between PC and mobile devices.',
									'flexible-table-block'
								) }
							/>
							<hr />
							<h2>{ __( 'Default Table Style', 'flexible-table-block' ) }</h2>
							<div className="ftb-global-setting-modal__styles">
								<BaseControl
									label={ __( 'Width', 'flexible-table-block' ) }
									id="flexible-table-block/global-table-width"
									className="ftb-global-setting-modal__styles-item"
								>
									<UnitControl
										labelPosition="top"
										min="0"
										units={ tableWidthUnits }
										value={ options.block_style?.table_width }
										onChange={ ( value ) => {
											setOptions( {
												...options,
												block_style: {
													...options.block_style,
													table_width: toUnitVal( value ),
												},
											} );
										} }
									/>
								</BaseControl>
								<BaseControl
									label={ __( 'Max Width', 'flexible-table-block' ) }
									id="flexible-table-block/global-table-max-width"
									className="ftb-global-setting-modal__styles-item"
								>
									<UnitControl
										labelPosition="top"
										min="0"
										units={ tableWidthUnits }
										value={ options.block_style?.table_max_width }
										onChange={ ( value ) => {
											setOptions( {
												...options,
												block_style: {
													...options.block_style,
													table_max_width: toUnitVal( value ),
												},
											} );
										} }
									/>
								</BaseControl>
								<BaseControl
									label={ __( 'Stripe Background Color ( odd rows )', 'flexible-table-block' ) }
									id="flexible-table-block/global-row-odd-color"
									className="ftb-global-setting-modal__styles-item"
								>
									<div className="ftb-global-setting-modal__styles-color">
										<ColorIndicator colorValue={ options.block_style?.row_odd_color } />
										<ColorPalette
											value={ options.block_style?.row_odd_color }
											onChange={ ( value ) => {
												setOptions( {
													...options,
													block_style: {
														...options.block_style,
														row_odd_color: value,
													},
												} );
											} }
										/>
									</div>
								</BaseControl>
								<BaseControl
									label={ __( 'Stripe Background Color ( even rows )', 'flexible-table-block' ) }
									id="flexible-table-block/global-row-even-color"
									className="ftb-global-setting-modal__styles-item"
								>
									<div className="ftb-global-setting-modal__styles-color">
										<ColorIndicator colorValue={ options.block_style?.row_even_color } />
										<ColorPalette
											value={ options.block_style?.row_even_color }
											onChange={ ( value ) => {
												setOptions( {
													...options,
													block_style: {
														...options.block_style,
														row_even_color: value,
													},
												} );
											} }
										/>
									</div>
								</BaseControl>
								<BaseControl
									label={ __( 'Cell borders', 'flexible-table-block' ) }
									id="flexible-table-block/table-border-collapse"
									className="ftb-global-setting-modal__styles-item"
								>
									<ButtonGroup className="ftb-button-group">
										{ BORDER_COLLAPSE_CONTROLS.map( ( { icon, label, value } ) => {
											return (
												<Button
													key={ value }
													variant={
														value === options.block_style?.table_border_collapse
															? 'primary'
															: 'secondary'
													}
													icon={ icon }
													onClick={ () => {
														const borderCollapse =
															options?.block_style?.table_border_collapse === value
																? undefined
																: value;
														setOptions( {
															...options,
															block_style: {
																...options.block_style,
																table_border_collapse: borderCollapse,
															},
														} );
													} }
												>
													{ label }
												</Button>
											);
										} ) }
									</ButtonGroup>
								</BaseControl>
							</div>
							<h2>{ __( 'Default Cell Style', 'flexible-table-block' ) }</h2>
							<div className="ftb-global-setting-modal__styles">
								<PaddingControl
									id="flexible-table-block/global-cell-border-color"
									label={ __( 'Padding', 'flexible-table-block' ) }
									className="ftb-global-setting-modal__styles-item"
									allowSides={ false }
									hasIndicator={ false }
									values={ { top: options.block_style?.cell_padding } }
									onChange={ ( value ) => {
										setOptions( {
											...options,
											block_style: {
												...options.block_style,
												cell_padding: value.top,
											},
										} );
									} }
								/>
								<BorderWidthControl
									id="flexible-table-block/global-cell-border-width"
									label={ __( 'Border Width', 'flexible-table-block' ) }
									className="ftb-global-setting-modal__styles-item"
									allowSides={ false }
									hasIndicator={ false }
									values={ { top: options.block_style?.cell_border_width } }
									onChange={ ( value ) => {
										setOptions( {
											...options,
											block_style: {
												...options.block_style,
												cell_border_width: value.top,
											},
										} );
									} }
								/>
								<BorderStyleControl
									id="flexible-table-block/global-cell-border-style"
									label={ __( 'Border Style', 'flexible-table-block' ) }
									className="ftb-global-setting-modal__styles-item"
									allowSides={ false }
									hasIndicator={ false }
									values={ { top: options.block_style?.cell_border_style } }
									onChange={ ( value ) => {
										const newValue =
											options?.block_style?.cell_border_style === value.top ? undefined : value.top;
										setOptions( {
											...options,
											block_style: {
												...options.block_style,
												cell_border_style: newValue,
											},
										} );
									} }
								/>
								<BorderColorControl
									id="flexible-table-block/global-cell-border-color"
									label={ __( 'Border Color', 'flexible-table-block' ) }
									className="ftb-global-setting-modal__styles-item"
									allowSides={ false }
									hasIndicator={ false }
									values={ { top: options.block_style?.cell_border_color } }
									onChange={ ( value ) => {
										setOptions( {
											...options,
											block_style: {
												...options.block_style,
												cell_border_color: value.top,
											},
										} );
									} }
								/>
								<BaseControl
									label={ __( 'Text alignment', 'flexible-table-block' ) }
									id="flexible-table-block/global-cell-text-align"
									className="ftb-global-setting-modal__styles-item"
								>
									<ButtonGroup className="ftb-button-group">
										{ TEXT_ALIGNMENT_CONTROLS.map( ( { icon, label, value } ) => {
											return (
												<Button
													key={ value }
													label={ label }
													variant={
														value === options.block_style?.cell_text_align ? 'primary' : 'secondary'
													}
													icon={ icon }
													onClick={ () => {
														const newValue =
															options?.block_style?.cell_text_align === value ? undefined : value;
														setOptions( {
															...options,
															block_style: {
																...options.block_style,
																cell_text_align: newValue,
															},
														} );
													} }
												/>
											);
										} ) }
									</ButtonGroup>
								</BaseControl>
								<BaseControl
									label={ __( 'Vertical alignment', 'flexible-table-block' ) }
									id="flexible-table-block/global-cell-vertical-align"
									className="ftb-global-setting-modal__styles-item"
								>
									<ButtonGroup className="ftb-button-group">
										{ VERTICAL_ALIGNMENT_CONTROLS.map( ( { icon, label, value } ) => {
											return (
												<Button
													key={ value }
													label={ label }
													variant={
														value === options.block_style?.cell_vertical_align
															? 'primary'
															: 'secondary'
													}
													icon={ icon }
													onClick={ () => {
														const newValue =
															options?.block_style?.cell_vertical_align === value
																? undefined
																: value;
														setOptions( {
															...options,
															block_style: {
																...options.block_style,
																cell_vertical_align: newValue,
															},
														} );
													} }
												/>
											);
										} ) }
									</ButtonGroup>
								</BaseControl>
							</div>
							{ notice?.status && notice?.message && (
								<Notice
									className="ftb-global-setting-modal__notice"
									status={ notice.status }
									onRemove={ () => {
										setNotice();
										document.querySelector( '.ftb-global-setting-modal' ).focus();
									} }
								>
									{ notice.message }
								</Notice>
							) }
							<div className="ftb-global-setting-modal__buttons">
								<Button variant="primary" disabled={ isWaiting } onClick={ handleUpdateOptions }>
									{ __( 'Save', 'flexible-table-block' ) }
								</Button>
								<Button
									variant="link"
									disabled={ isWaiting }
									onClick={ () => {
										setIsResetPopup( ! isResetPopup );
									} }
								>
									{ __( 'Reset Setting', 'flexible-table-block' ) }
									{ isResetPopup && (
										<Popover
											className="ftb-global-setting-modal__confirm-popover"
											focusOnMount="container"
											position="top right"
											onClose={ () => {
												setIsResetPopup( false );
											} }
										>
											<p>{ __( 'Are you sure?', 'flexible-table-block' ) }</p>
											<div className="ftb-global-setting-modal__confirm-popover-buttons">
												<Button isDestructive onClick={ handleResetOptions }>
													{ __( 'Reset', 'flexible-table-block' ) }
												</Button>
												<Button
													variant="secondary"
													onClick={ () => {
														setIsResetPopup( false );
													} }
												>
													{ __( 'Cancel', 'flexible-table-block' ) }
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
