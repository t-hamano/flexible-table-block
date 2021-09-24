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
	__experimentalUnitControl as UnitControl,
	__experimentalUseCustomUnits as useCustomUnits,
} from '@wordpress/components';
import { cog, help, mobile, desktop } from '@wordpress/icons';

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

	const [ isSettingModalOpen, setIsSettingModalOpen ] = useState( false );
	const [ isHelpModalOpen, setIsHelpModalOpen ] = useState( false );
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
	}, [ isSettingModalOpen ] );

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
		<>
			<div className="ftb-global-setting">
				<Button
					variant="link"
					icon={ help }
					iconSize="20"
					onClick={ () => {
						setIsHelpModalOpen( true );
					} }
				>
					{ __( 'Help', 'flexible-table-block' ) }
				</Button>
				{ ( isAdministrator || options.show_global_setting ) && (
					<Button
						variant="link"
						icon={ cog }
						iconSize="20"
						onClick={ () => {
							setIsSettingModalOpen( true );
						} }
					>
						{ __( 'Global Setting', 'flexible-table-block' ) }
					</Button>
				) }
			</div>
			{ isHelpModalOpen && (
				<Modal
					title={ __( 'Help', 'flexible-table-block' ) }
					className="ftb-global-help-modal"
					onRequestClose={ () => setIsHelpModalOpen( false ) }
				>
					<h2>{ __( 'About Default Table Style', 'flexible-table-block' ) }</h2>
					<p>
						{ __(
							'The default style of the table can be changed at "Default Table Style" and "Default Cell Style" in global settings. Alternatively, you can add styles by specifying the block class ( .wp-flexible-table-block-table ) in Theme Customize Additional CSS.',
							'flexible-table-block'
						) }
					</p>
					<h2>{ __( 'Select Multiple Cells', 'flexible-table-block' ) }</h2>
					<p>
						{ __(
							'Hold Ctrl key to select multiple cells or hold Shift key to select range. This is useful when you want to change styles of multiple cells.',
							'flexible-table-block'
						) }
					</p>
					<h2>{ __( 'Merge Cells', 'flexible-table-block' ) }</h2>
					<p>
						{ __(
							'Press and hold Shift to select the needed cells, and select "Merge Cells" from toolbar.',
							'flexible-table-block'
						) }
					</p>
					<h2>{ __( 'Split Cells', 'flexible-table-block' ) }</h2>
					<p>
						{ __(
							'Select the merged cell and select "Split Cells" from toolbar.',
							'flexible-table-block'
						) }
					</p>
				</Modal>
			) }
			{ isSettingModalOpen && ( isAdministrator || options.show_global_setting ) && (
				<Modal
					title={ __( 'Flexible Table Block Global Setting', 'flexible-table-block' ) }
					className="ftb-global-setting-modal"
					onRequestClose={ () => setIsSettingModalOpen( false ) }
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
					{ ( options.show_label_on_section || options.show_control_button ) && (
						<ToggleControl
							label={ __(
								'Prevent insert/select buttons, select row/column buttons, section label from being focused when moving with the crosshairs',
								'flexible-table-block'
							) }
							checked={ !! options.prevent_focus_control_button }
							onChange={ ( value ) => {
								setOptions( {
									...options,
									prevent_focus_control_button: value,
								} );
							} }
						/>
					) }
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
						<BorderColorControl
							id="flexible-table-block/global-row-odd-color"
							label={ __( 'Stripe Background Color ( odd rows )', 'flexible-table-block' ) }
							className="ftb-global-setting-modal__styles-item"
							allowSides={ false }
							hasIndicator={ false }
							values={ { top: options.block_style?.row_odd_color } }
							onChange={ ( value ) => {
								setOptions( {
									...options,
									block_style: {
										...options.block_style,
										row_odd_color: value.top,
									},
								} );
							} }
						/>
						<BorderColorControl
							id="flexible-table-block/global-row-even-color"
							label={ __( 'Stripe Background Color ( even rows )', 'flexible-table-block' ) }
							className="ftb-global-setting-modal__styles-item"
							allowSides={ false }
							hasIndicator={ false }
							values={ { top: options.block_style?.row_even_color } }
							onChange={ ( value ) => {
								setOptions( {
									...options,
									block_style: {
										...options.block_style,
										row_even_color: value.top,
									},
								} );
							} }
						/>
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
													options?.block_style?.table_border_collapse === value ? undefined : value;
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
						<BorderColorControl
							id="flexible-table-block/global-cell-background-color-th"
							label={ __( 'Background Color ( th tag )', 'flexible-table-block' ) }
							className="ftb-global-setting-modal__styles-item"
							allowSides={ false }
							hasIndicator={ false }
							values={ { top: options.block_style?.cell_background_color_th } }
							onChange={ ( value ) => {
								setOptions( {
									...options,
									block_style: {
										...options.block_style,
										cell_background_color_th: value.top,
									},
								} );
							} }
						/>
						<BorderColorControl
							id="flexible-table-block/global-cell-background-color-td"
							label={ __( 'Background Color ( td tag )', 'flexible-table-block' ) }
							className="ftb-global-setting-modal__styles-item"
							allowSides={ false }
							hasIndicator={ false }
							values={ { top: options.block_style?.cell_background_color_td } }
							onChange={ ( value ) => {
								setOptions( {
									...options,
									block_style: {
										...options.block_style,
										cell_background_color_td: value.top,
									},
								} );
							} }
						/>
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
												value === options.block_style?.cell_vertical_align ? 'primary' : 'secondary'
											}
											icon={ icon }
											onClick={ () => {
												const newValue =
													options?.block_style?.cell_vertical_align === value ? undefined : value;
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
	);
}