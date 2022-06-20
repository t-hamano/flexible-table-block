/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useState, useEffect, createInterpolateElement } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';
// @ts-ignore: has no exported member
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
	ExternalLink,
	// @ts-ignore: has no exported member
	__experimentalUnitControl as UnitControl,
	// @ts-ignore: has no exported member
	__experimentalUseCustomUnits as useCustomUnits,
} from '@wordpress/components';
import { cog, help } from '@wordpress/icons';
import type { Notice as NoticeType } from '@wordpress/components';

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
	TEXT_ALIGNMENT_CONTROLS,
	VERTICAL_ALIGNMENT_CONTROLS,
} from '../constants';
import { BorderWidthControl, BorderStyleControl, ColorControl, PaddingControl } from '../controls';
import { sanitizeUnitValue, cleanEmptyObject } from '../utils/helper';
import type { ApiResponse, StoreOptions } from '../store';

interface NoticeInfo {
	status?: NoticeType.Props[ 'status' ];
	message?: string;
}

export default function GlobalSettings() {
	const storeOptions: StoreOptions = useSelect( ( select ) => select( STORE_NAME ).getOptions() );

	const isAdministrator: boolean = useSelect( ( select ) =>
		// @ts-ignore
		select( coreStore ).canUser( 'create', 'users' )
	);

	const tableWidthUnits = useCustomUnits( { availableUnits: TABLE_WIDTH_UNITS } );

	const [ isSettingModalOpen, setIsSettingModalOpen ] = useState< boolean >( false );
	const [ isHelpModalOpen, setIsHelpModalOpen ] = useState< boolean >( false );
	const [ noticeInfo, setNoticeInfo ] = useState< NoticeInfo | undefined >( undefined );
	const [ isResetPopup, setIsResetPopup ] = useState< boolean >( false );
	const [ isWaiting, setIsWaiting ] = useState< boolean >( false );
	const [ options, setOptions ] = useState< StoreOptions >();

	const { setOptions: setStoreOptions } = useDispatch( STORE_NAME );

	// Set options to state.
	useEffect( () => {
		setOptions( storeOptions );
	}, [ storeOptions ] );

	// Initialize notice message.
	useEffect( () => {
		setNoticeInfo( undefined );
	}, [ isSettingModalOpen ] );

	// Force focus on the modal as it loses focus when saving or restoring settings.
	function focusModal() {
		const modal = document.querySelector( '.ftb-global-setting-modal' ) as HTMLInputElement;
		if ( modal ) {
			modal.focus();
		}
	}

	// Update the inline CSS.
	function updateInlineCss( css: string ) {
		// Update the inline CSS of the global document.
		const styleSheet = document.getElementById( 'flexible-table-block-editor-inline-css' );

		if ( styleSheet ) {
			styleSheet.textContent = css;
		}

		// Update the inline CSS of the iframe editor instance document.
		const iframeEditor = document.querySelectorAll( 'iframe' );

		for ( let i = 0; i < iframeEditor.length; i++ ) {
			const iframeWindow = iframeEditor[ i ].contentWindow;

			if ( ! iframeWindow ) continue;

			const iframeStyleSheet = iframeWindow.document.getElementById(
				'flexible-table-block-editor-inline-css'
			);

			if ( iframeStyleSheet ) {
				iframeStyleSheet.textContent = css;
			}
		}
	}

	// Update options.
	const handleUpdateOptions = () => {
		setIsWaiting( true );
		setNoticeInfo( undefined );
		setStoreOptions( options );

		apiFetch< ApiResponse >( {
			path: REST_API_ROUTE,
			method: 'POST',
			data: options,
		} )
			.then( ( response ) => {
				focusModal();
				setIsWaiting( false );

				// Show notice message.
				if ( response.status && response.message ) {
					setNoticeInfo( {
						status: response?.status,
						message: response?.message,
					} );
				}

				if ( ! response.block_css ) return;

				// Update inline CSS.
				updateInlineCss( response.block_css );
			} )
			.catch( ( response ) => {
				focusModal();
				setIsWaiting( false );
				setNoticeInfo( {
					status: 'error',
					message: response.message,
				} );
			} );
	};

	// Reset state and store options.
	const handleResetOptions = () => {
		setIsWaiting( true );
		setNoticeInfo( undefined );

		apiFetch< ApiResponse >( {
			path: REST_API_ROUTE,
			method: 'DELETE',
		} ).then( ( response ) => {
			focusModal();
			setIsWaiting( false );

			// Show notice message.
			if ( response.status && response.message ) {
				setNoticeInfo( {
					status: response.status,
					message: response.message,
				} );
			}

			// Update options.
			if ( response.options ) {
				setOptions( response.options );
				setStoreOptions( response.options );
			}

			if ( ! response.block_css ) return;

			// Update inline CSS.
			updateInlineCss( response.block_css );
		} );
	};

	return (
		<>
			<div className="ftb-global-setting">
				<Button icon={ help } isLink onClick={ () => setIsHelpModalOpen( true ) }>
					{ __( 'Help', 'flexible-table-block' ) }
				</Button>
				{ ( isAdministrator || options?.show_global_setting ) && (
					<Button icon={ cog } isPrimary onClick={ () => setIsSettingModalOpen( true ) }>
						{ __( 'Global Setting', 'flexible-table-block' ) }
					</Button>
				) }
			</div>
			{ isHelpModalOpen && (
				<Modal
					title={ __( 'Flexible Table Block Help', 'flexible-table-block' ) }
					className="ftb-global-help-modal"
					onRequestClose={ () => setIsHelpModalOpen( false ) }
				>
					<h2>{ __( 'About Default Table Style', 'flexible-table-block' ) }</h2>
					<p>
						{ __(
							'Flexible Table Block is a block that allows you to create tables in various styles.',
							'flexible-table-block'
						) }
						<br />
						{ __(
							'First of all, it is recommended to set the default style of the table from "Global Setting".',
							'flexible-table-block'
						) }
					</p>
					<h2>{ __( 'Select Multiple Cells', 'flexible-table-block' ) }</h2>
					<p>
						{ __(
							'Hold Ctrl key to select multiple cells or hold Shift key to select range.',
							'flexible-table-block'
						) }
						<br />
						{ __(
							'Select multiple cells is used to merge cells or to change styles of multiple cells.',
							'flexible-table-block'
						) }
					</p>
					<h2>{ __( 'About Scroll Table', 'flexible-table-block' ) }</h2>
					<p>
						{ __(
							'If table scrolling is enabled, set "Table Width" or "Table Min Width" larger than the content width.',
							'flexible-table-block'
						) }
					</p>
					<h2>{ __( 'About Accessibility', 'flexible-table-block' ) }</h2>
					<p>
						{ createInterpolateElement(
							__(
								'You can tell screenreaders exactly by properly defining <code>id</code>, <code>headers</code>, and <code>scope</code> attributes for each cell.',
								'flexible-table-block'
							),
							{ code: <code /> }
						) }
					</p>
					<p>
						{ createInterpolateElement(
							__(
								'Refer to <Link>this page</Link> for the specifications of each attribute.',
								'flexible-table-block'
							),
							{
								Link: (
									<ExternalLink
										href={ __(
											'https://developer.mozilla.org/en-US/docs/Learn/HTML/Tables/Advanced',
											'flexible-table-block'
										) }
									/>
								),
							}
						) }
					</p>
					<hr />
					<ExternalLink
						href={ __(
							'https://github.com/t-hamano/flexible-table-block/wiki/English-Manual',
							'flexible-table-block'
						) }
					>
						{ __( 'Read more in the manual', 'flexible-table-block' ) }
					</ExternalLink>
				</Modal>
			) }
			{ options && isSettingModalOpen && ( isAdministrator || options?.show_global_setting ) && (
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
					<p>
						<strong>
							{ __(
								'Note: These settings will be applied to all Flexible Table Blocks.',
								'flexible-table-block'
							) }
						</strong>
					</p>
					<hr />
					<h2>{ __( 'Default Table Style', 'flexible-table-block' ) }</h2>
					<div className="ftb-global-setting-modal__styles">
						<BaseControl
							id="flexible-table-block-global-table-width"
							label={ __( 'Table Width', 'flexible-table-block' ) }
							className="ftb-global-setting-modal__styles-item ftb-width-control"
						>
							<UnitControl
								id="flexible-table-block-global-table-width"
								units={ tableWidthUnits }
								value={ options.block_style?.table_width }
								min="0"
								onChange={ ( value: string ) => {
									setOptions( {
										...options,
										block_style: {
											...options.block_style,
											table_width: sanitizeUnitValue( value ),
										},
									} );
								} }
							/>
						</BaseControl>
						<BaseControl
							id="flexible-table-block-global-table-max-width"
							label={ __( 'Table Max Width', 'flexible-table-block' ) }
							className="ftb-global-setting-modal__styles-item ftb-width-control"
						>
							<UnitControl
								id="flexible-table-block-global-table-max-width"
								units={ tableWidthUnits }
								value={ options.block_style?.table_max_width }
								min="0"
								onChange={ ( value: string ) => {
									setOptions( {
										...options,
										block_style: {
											...options.block_style,
											table_max_width: sanitizeUnitValue( value ),
										},
									} );
								} }
							/>
						</BaseControl>
						<ColorControl
							id="flexible-table-block-global-row-odd-color"
							label={ __( 'Stripe Style Background Color ( odd rows )', 'flexible-table-block' ) }
							className="ftb-global-setting-modal__styles-item"
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
						<ColorControl
							id="flexible-table-block-global-row-even-color"
							label={ __( 'Stripe Style Background Color ( even rows )', 'flexible-table-block' ) }
							className="ftb-global-setting-modal__styles-item"
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
						<BaseControl
							id="flexible-table-block-global-table-border-collapse"
							className="ftb-global-setting-modal__styles-item"
						>
							<div
								aria-labelledby="flexible-table-block-global-table-border-collapse-heading"
								role="region"
							>
								<span
									id="flexible-table-block-global-table-border-collapse-heading"
									className="ftb-base-control-label"
								>
									{ __( 'Cell Borders', 'flexible-table-block' ) }
								</span>
								<ButtonGroup className="ftb-button-group">
									{ BORDER_COLLAPSE_CONTROLS.map( ( { icon, label, value } ) => {
										return (
											<Button
												key={ value }
												isPrimary={ value === options.block_style?.table_border_collapse }
												isSecondary={ value !== options.block_style?.table_border_collapse }
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
							</div>
						</BaseControl>
					</div>
					<hr />
					<h2>{ __( 'Default Cell Style', 'flexible-table-block' ) }</h2>
					<div className="ftb-global-setting-modal__styles">
						<ColorControl
							id="flexible-table-block-global-cell-text-color-th"
							label={ __( 'Cell Text Color ( th tag )', 'flexible-table-block' ) }
							className="ftb-global-setting-modal__styles-item"
							value={ options.block_style?.cell_text_color_th }
							onChange={ ( value ) => {
								setOptions( {
									...options,
									block_style: {
										...options.block_style,
										cell_text_color_th: value,
									},
								} );
							} }
						/>
						<ColorControl
							id="flexible-table-block-global-cell-text-color-td"
							label={ __( 'Cell Text Color ( td tag )', 'flexible-table-block' ) }
							className="ftb-global-setting-modal__styles-item"
							value={ options.block_style?.cell_text_color_td }
							onChange={ ( value ) => {
								setOptions( {
									...options,
									block_style: {
										...options.block_style,
										cell_text_color_td: value,
									},
								} );
							} }
						/>
						<ColorControl
							id="flexible-table-block-global-cell-background-color-th"
							label={ __( 'Cell Background Color ( th tag )', 'flexible-table-block' ) }
							className="ftb-global-setting-modal__styles-item"
							value={ options.block_style?.cell_background_color_th }
							onChange={ ( value ) => {
								setOptions( {
									...options,
									block_style: {
										...options.block_style,
										cell_background_color_th: value,
									},
								} );
							} }
						/>
						<ColorControl
							id="flexible-table-block-global-cell-background-color-td"
							label={ __( 'Cell Background Color ( td tag )', 'flexible-table-block' ) }
							className="ftb-global-setting-modal__styles-item"
							value={ options.block_style?.cell_background_color_td }
							onChange={ ( value ) => {
								setOptions( {
									...options,
									block_style: {
										...options.block_style,
										cell_background_color_td: value,
									},
								} );
							} }
						/>
						<PaddingControl
							id="flexible-table-block-global-cell-padding"
							label={ __( 'Cell Padding', 'flexible-table-block' ) }
							className="ftb-global-setting-modal__styles-item"
							values={ options?.block_style.cell_padding || {} }
							onChange={ ( values ) => {
								setOptions( {
									...options,
									block_style: {
										...options.block_style,
										cell_padding: cleanEmptyObject( values ),
									},
								} );
							} }
						/>
						<BorderWidthControl
							id="flexible-table-block-global-cell-border-width"
							label={ __( 'Cell Border Width', 'flexible-table-block' ) }
							className="ftb-global-setting-modal__styles-item"
							values={ { top: options.block_style?.cell_border_width } }
							allowSides={ false }
							hasIndicator={ false }
							onChange={ ( value ) => {
								setOptions( {
									...options,
									block_style: {
										...options.block_style,
										cell_border_width: sanitizeUnitValue( value.top ),
									},
								} );
							} }
						/>
						<BorderStyleControl
							id="flexible-table-block-global-cell-border-style"
							label={ __( 'Cell Border Style', 'flexible-table-block' ) }
							className="ftb-global-setting-modal__styles-item"
							values={ { top: options.block_style?.cell_border_style } }
							allowSides={ false }
							hasIndicator={ false }
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
						<ColorControl
							id="flexible-table-block-global-cell-border-color"
							label={ __( 'Cell Border Color', 'flexible-table-block' ) }
							className="ftb-global-setting-modal__styles-item"
							value={ options.block_style?.cell_border_color }
							onChange={ ( value ) => {
								setOptions( {
									...options,
									block_style: {
										...options.block_style,
										cell_border_color: value,
									},
								} );
							} }
						/>
						<BaseControl
							id="flexible-table-block-global-cell-horizontal-align"
							className="ftb-global-setting-modal__styles-item"
						>
							<div
								aria-labelledby="flexible-table-block-global-cell-horizontal-align-heading"
								role="region"
							>
								<span
									id="flexible-table-block-global-cell-horizontal-align-heading"
									className="ftb-base-control-label"
								>
									{ __( 'Cell Text Alignment', 'flexible-table-block' ) }
								</span>
								<ButtonGroup className="ftb-button-group">
									{ TEXT_ALIGNMENT_CONTROLS.map( ( { icon, label, value } ) => {
										return (
											<Button
												key={ value }
												label={ label }
												isPrimary={ value === options.block_style?.cell_text_align }
												isSecondary={ value !== options.block_style?.cell_text_align }
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
							</div>
						</BaseControl>
						<BaseControl
							id="flexible-table-block-global-cell-vertical-align"
							className="ftb-global-setting-modal__styles-item"
						>
							<div
								aria-labelledby="flexible-table-block-global-cell-vertical-align-heading"
								role="region"
							>
								<span
									id="flexible-table-block-global-cell-vertical-align-heading"
									className="ftb-base-control-label"
								>
									{ __( 'Cell Vertical Alignment', 'flexible-table-block' ) }
								</span>
								<ButtonGroup className="ftb-button-group">
									{ VERTICAL_ALIGNMENT_CONTROLS.map( ( { icon, label, value } ) => {
										return (
											<Button
												key={ value }
												label={ label }
												isPrimary={ value === options.block_style?.cell_vertical_align }
												isSecondary={ value !== options.block_style?.cell_vertical_align }
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
							</div>
						</BaseControl>
					</div>
					<hr />
					<h2>{ __( 'Responsive breakpoint (px)', 'flexible-table-block' ) }</h2>
					<RangeControl
						id="flexible-table-block-global-breakpoint"
						help={ __(
							'Set the screen width (breakpoint) as the basis for switching between PC and mobile devices.',
							'flexible-table-block'
						) }
						beforeIcon="smartphone"
						afterIcon="desktop"
						min={ MIN_RESPONSIVE_BREAKPOINT }
						max={ MAX_RESPONSIVE_BREAKPOINT }
						value={
							options.breakpoint ? Number( options.breakpoint ) : DEFAULT_RESPONSIVE_BREAKPOINT
						}
						allowReset
						onChange={ ( value ) => {
							setOptions( {
								...options,
								breakpoint: value ? value : DEFAULT_RESPONSIVE_BREAKPOINT,
							} );
						} }
					/>
					<hr />
					<h2>{ __( 'Options', 'flexible-table-block' ) }</h2>
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
								'Focus insert/select buttons, select row/column buttons, section label from being focused when moving with the crosshairs',
								'flexible-table-block'
							) }
							checked={ !! options.focus_control_button }
							onChange={ ( value ) => {
								setOptions( {
									...options,
									focus_control_button: value,
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
					<ToggleControl
						label={ __( 'Use the TAB key to move cells', 'flexible-table-block' ) }
						checked={ !! options.tab_move }
						onChange={ ( value ) => {
							setOptions( {
								...options,
								tab_move: value,
							} );
						} }
					/>
					<ToggleControl
						label={ __(
							'Keep the contents of all cells when merging cells',
							'flexible-table-block'
						) }
						checked={ !! options.merge_content }
						onChange={ ( value ) => {
							setOptions( {
								...options,
								merge_content: value,
							} );
						} }
					/>
					{ isAdministrator && (
						<ToggleControl
							label={ __(
								'Show global setting link to non-administrative users',
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
					{ noticeInfo?.status && noticeInfo?.message && (
						<Notice
							className="ftb-global-setting-modal__notice"
							status={ noticeInfo.status }
							onRemove={ () => {
								setNoticeInfo( undefined );
								focusModal();
							} }
						>
							{ noticeInfo.message }
						</Notice>
					) }
					<div className="ftb-global-setting-modal__buttons">
						<Button isPrimary disabled={ isWaiting } onClick={ handleUpdateOptions }>
							{ __( 'Save', 'flexible-table-block' ) }
						</Button>
						<Button
							isLink
							isDestructive
							disabled={ isWaiting }
							onClick={ () => setIsResetPopup( ! isResetPopup ) }
						>
							{ __( 'Restore default settings', 'flexible-table-block' ) }
							{ isResetPopup && (
								<Popover
									className="ftb-global-setting-modal__confirm-popover"
									focusOnMount="container"
									position="top right"
									onClose={ () => setIsResetPopup( false ) }
								>
									<p>{ __( 'Are you sure?', 'flexible-table-block' ) }</p>
									<div className="ftb-global-setting-modal__confirm-popover-buttons">
										<Button isDestructive onClick={ handleResetOptions }>
											{ __( 'Restore', 'flexible-table-block' ) }
										</Button>
										<Button isSecondary onClick={ () => setIsResetPopup( false ) }>
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
