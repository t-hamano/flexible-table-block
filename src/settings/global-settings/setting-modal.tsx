/**
 * External dependencies
 */
import type { Dispatch, SetStateAction } from 'react';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { createInterpolateElement, useState } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';
import {
	BaseControl,
	Button,
	ButtonGroup,
	Notice,
	Modal,
	Popover,
	TabPanel,
	Spinner,
	RangeControl,
	ToggleControl,
	// @ts-ignore: has no exported member
	__experimentalUnitControl as UnitControl,
	// @ts-ignore: has no exported member
	__experimentalUseCustomUnits as useCustomUnits,
	SlotFillProvider,
} from '@wordpress/components';
import type { Notice as NoticeType } from '@wordpress/components';

/**
 * Internal dependencies
 */
import {
	BORDER_COLLAPSE_CONTROLS,
	DEFAULT_RESPONSIVE_BREAKPOINT,
	MIN_RESPONSIVE_BREAKPOINT,
	MAX_RESPONSIVE_BREAKPOINT,
	TEXT_ALIGNMENT_CONTROLS,
	VERTICAL_ALIGNMENT_CONTROLS,
	TABLE_WIDTH_UNITS,
	STORE_NAME,
	REST_API_ROUTE,
} from '../../constants';
import {
	BorderWidthControl,
	BorderStyleControl,
	ColorControl,
	PaddingControl,
} from '../../controls';
import { sanitizeUnitValue, cleanEmptyObject } from '../../utils/helper';
import type { ApiResponse, StoreOptions } from '../../store';

type Props = {
	options: StoreOptions;
	isAdministrator: boolean;
	setIsSettingModalOpen: Dispatch< SetStateAction< boolean > >;
};

interface NoticeInfo {
	status?: NoticeType.Props[ 'status' ];
	message?: string;
}

export default function SettingModal( { options, isAdministrator, setIsSettingModalOpen }: Props ) {
	const [ noticeInfo, setNoticeInfo ] = useState< NoticeInfo | undefined >( undefined );
	const [ isResetPopup, setIsResetPopup ] = useState< boolean >( false );
	const [ isWaiting, setIsWaiting ] = useState< boolean >( false );
	const [ currentOptions, setCurrentOptions ] = useState< StoreOptions >( options );

	const { setOptions: setStoreOptions } = useDispatch( STORE_NAME );
	const tableWidthUnits = useCustomUnits( { availableUnits: TABLE_WIDTH_UNITS } );

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
		setStoreOptions( currentOptions );

		apiFetch< ApiResponse >( {
			path: REST_API_ROUTE,
			method: 'POST',
			data: currentOptions,
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

				if ( ! response.block_css ) {
					return;
				}

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
				setCurrentOptions( response.options );
				setStoreOptions( response.options );
			}

			if ( ! response.block_css ) {
				return;
			}

			// Update inline CSS.
			updateInlineCss( response.block_css );
		} );
	};

	return (
		<SlotFillProvider>
			<Modal
				title={ __( 'Flexible Table Block Global setting', 'flexible-table-block' ) }
				className="ftb-global-setting-modal"
				onRequestClose={ () => setIsSettingModalOpen( false ) }
			>
				{ isWaiting && (
					<div className="ftb-global-setting-modal__loading">
						<Spinner />
					</div>
				) }
				<TabPanel
					className="ftb-global-setting-modal__tab-panel"
					orientation="vertical"
					tabs={ [
						{
							name: 'table',
							title: __( 'Table styles', 'flexible-table-block' ),
						},
						{
							name: 'cell',
							title: __( 'Cell styles', 'flexible-table-block' ),
						},
						{
							name: 'responsive',
							title: __( 'Responsive setting', 'flexible-table-block' ),
						},
						{
							name: 'options',
							title: __( 'Editor options', 'flexible-table-block' ),
						},
					] }
				>
					{ ( { name } ) => (
						<>
							{ name === 'table' && (
								<>
									<h2>{ __( 'Default table styles', 'flexible-table-block' ) }</h2>
									<div className="ftb-global-setting-modal__styles">
										<BaseControl
											id="flexible-table-block-global-table-width"
											label={ __( 'Table width', 'flexible-table-block' ) }
											className="ftb-global-setting-modal__styles-item ftb-width-control"
										>
											<UnitControl
												id="flexible-table-block-global-table-width"
												units={ tableWidthUnits }
												value={ currentOptions.block_style?.table_width }
												min="0"
												onChange={ ( value: string ) => {
													setCurrentOptions( {
														...currentOptions,
														block_style: {
															...currentOptions.block_style,
															table_width: sanitizeUnitValue( value ),
														},
													} );
												} }
											/>
										</BaseControl>
										<BaseControl
											id="flexible-table-block-global-table-max-width"
											label={ __( 'Table max width', 'flexible-table-block' ) }
											className="ftb-global-setting-modal__styles-item ftb-width-control"
										>
											<UnitControl
												id="flexible-table-block-global-table-max-width"
												units={ tableWidthUnits }
												value={ currentOptions.block_style?.table_max_width }
												min="0"
												onChange={ ( value: string ) => {
													setCurrentOptions( {
														...currentOptions,
														block_style: {
															...currentOptions.block_style,
															table_max_width: sanitizeUnitValue( value ),
														},
													} );
												} }
											/>
										</BaseControl>
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
													{ __( 'Cell borders', 'flexible-table-block' ) }
												</span>
												<ButtonGroup className="ftb-button-group">
													{ BORDER_COLLAPSE_CONTROLS.map( ( { icon, label, value } ) => {
														return (
															<Button
																key={ value }
																variant={
																	value === currentOptions.block_style?.table_border_collapse
																		? 'primary'
																		: 'secondary'
																}
																icon={ icon }
																onClick={ () => {
																	const borderCollapse =
																		currentOptions?.block_style?.table_border_collapse === value
																			? undefined
																			: value;
																	setCurrentOptions( {
																		...currentOptions,
																		block_style: {
																			...currentOptions.block_style,
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
									<h2>{ __( 'Default striped table styles', 'flexible-table-block' ) }</h2>
									<div className="ftb-global-setting-modal__styles">
										<ColorControl
											id="flexible-table-block-global-row-odd-color"
											label={ __(
												'Striped style background color ( odd rows )',
												'flexible-table-block'
											) }
											className="ftb-global-setting-modal__styles-item"
											value={ currentOptions.block_style?.row_odd_color }
											onChange={ ( value ) => {
												setCurrentOptions( {
													...currentOptions,
													block_style: {
														...currentOptions.block_style,
														row_odd_color: value,
													},
												} );
											} }
										/>
										<ColorControl
											id="flexible-table-block-global-row-even-color"
											label={ __(
												'Striped style background color ( even rows )',
												'flexible-table-block'
											) }
											className="ftb-global-setting-modal__styles-item"
											value={ currentOptions.block_style?.row_even_color }
											onChange={ ( value ) => {
												setCurrentOptions( {
													...currentOptions,
													block_style: {
														...currentOptions.block_style,
														row_even_color: value,
													},
												} );
											} }
										/>
									</div>
								</>
							) }
							{ name === 'cell' && (
								<>
									<h2>{ __( 'Default cell styles', 'flexible-table-block' ) }</h2>
									<div className="ftb-global-setting-modal__styles">
										<ColorControl
											id="flexible-table-block-global-cell-text-color-th"
											label={ createInterpolateElement(
												__( 'Cell text color ( <code>th</code> tag )', 'flexible-table-block' ),
												{ code: <code /> }
											) }
											className="ftb-global-setting-modal__styles-item"
											value={ currentOptions.block_style?.cell_text_color_th }
											onChange={ ( value ) => {
												setCurrentOptions( {
													...currentOptions,
													block_style: {
														...currentOptions.block_style,
														cell_text_color_th: value,
													},
												} );
											} }
										/>
										<ColorControl
											id="flexible-table-block-global-cell-text-color-td"
											label={ createInterpolateElement(
												__( 'Cell text color ( <code>td</code> tag )', 'flexible-table-block' ),
												{ code: <code /> }
											) }
											className="ftb-global-setting-modal__styles-item"
											value={ currentOptions.block_style?.cell_text_color_td }
											onChange={ ( value ) => {
												setCurrentOptions( {
													...currentOptions,
													block_style: {
														...currentOptions.block_style,
														cell_text_color_td: value,
													},
												} );
											} }
										/>
										<ColorControl
											id="flexible-table-block-global-cell-background-color-th"
											label={ createInterpolateElement(
												__(
													'Cell background color ( <code>th</code> tag )',
													'flexible-table-block'
												),
												{ code: <code /> }
											) }
											className="ftb-global-setting-modal__styles-item"
											value={ currentOptions.block_style?.cell_background_color_th }
											onChange={ ( value ) => {
												setCurrentOptions( {
													...currentOptions,
													block_style: {
														...currentOptions.block_style,
														cell_background_color_th: value,
													},
												} );
											} }
										/>
										<ColorControl
											id="flexible-table-block-global-cell-background-color-td"
											label={ createInterpolateElement(
												__(
													'Cell background color ( <code>td</code> tag )',
													'flexible-table-block'
												),
												{ code: <code /> }
											) }
											className="ftb-global-setting-modal__styles-item"
											value={ currentOptions.block_style?.cell_background_color_td }
											onChange={ ( value ) => {
												setCurrentOptions( {
													...currentOptions,
													block_style: {
														...currentOptions.block_style,
														cell_background_color_td: value,
													},
												} );
											} }
										/>
										<PaddingControl
											id="flexible-table-block-global-cell-padding"
											label={ __( 'Cell padding', 'flexible-table-block' ) }
											className="ftb-global-setting-modal__styles-item"
											values={ currentOptions?.block_style.cell_padding || {} }
											onChange={ ( values ) => {
												setCurrentOptions( {
													...currentOptions,
													block_style: {
														...currentOptions.block_style,
														cell_padding: cleanEmptyObject( values ),
													},
												} );
											} }
										/>
										<BorderWidthControl
											id="flexible-table-block-global-cell-border-width"
											label={ __( 'Cell border width', 'flexible-table-block' ) }
											className="ftb-global-setting-modal__styles-item"
											values={ { top: currentOptions.block_style?.cell_border_width } }
											allowSides={ false }
											hasIndicator={ false }
											onChange={ ( value ) => {
												setCurrentOptions( {
													...currentOptions,
													block_style: {
														...currentOptions.block_style,
														cell_border_width: sanitizeUnitValue( value.top ),
													},
												} );
											} }
										/>
										<BorderStyleControl
											id="flexible-table-block-global-cell-border-style"
											label={ __( 'Cell border style', 'flexible-table-block' ) }
											className="ftb-global-setting-modal__styles-item"
											values={ { top: currentOptions.block_style?.cell_border_style } }
											allowSides={ false }
											hasIndicator={ false }
											onChange={ ( value ) => {
												const newValue =
													currentOptions?.block_style?.cell_border_style === value.top
														? undefined
														: value.top;
												setCurrentOptions( {
													...currentOptions,
													block_style: {
														...currentOptions.block_style,
														cell_border_style: newValue,
													},
												} );
											} }
										/>
										<ColorControl
											id="flexible-table-block-global-cell-border-color"
											label={ __( 'Cell border color', 'flexible-table-block' ) }
											className="ftb-global-setting-modal__styles-item"
											value={ currentOptions.block_style?.cell_border_color }
											onChange={ ( value ) => {
												setCurrentOptions( {
													...currentOptions,
													block_style: {
														...currentOptions.block_style,
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
													{ __( 'Cell text alignment', 'flexible-table-block' ) }
												</span>
												<ButtonGroup className="ftb-button-group">
													{ TEXT_ALIGNMENT_CONTROLS.map( ( { icon, label, value } ) => {
														return (
															<Button
																key={ value }
																label={ label }
																variant={
																	value === currentOptions.block_style?.cell_text_align
																		? 'primary'
																		: 'secondary'
																}
																icon={ icon }
																onClick={ () => {
																	const newValue =
																		currentOptions?.block_style?.cell_text_align === value
																			? undefined
																			: value;
																	setCurrentOptions( {
																		...currentOptions,
																		block_style: {
																			...currentOptions.block_style,
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
													{ __( 'Cell vertical alignment', 'flexible-table-block' ) }
												</span>
												<ButtonGroup className="ftb-button-group">
													{ VERTICAL_ALIGNMENT_CONTROLS.map( ( { icon, label, value } ) => {
														return (
															<Button
																key={ value }
																label={ label }
																variant={
																	value === currentOptions.block_style?.cell_vertical_align
																		? 'primary'
																		: 'secondary'
																}
																icon={ icon }
																onClick={ () => {
																	const newValue =
																		currentOptions?.block_style?.cell_vertical_align === value
																			? undefined
																			: value;
																	setCurrentOptions( {
																		...currentOptions,
																		block_style: {
																			...currentOptions.block_style,
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
								</>
							) }
							{ name === 'responsive' && (
								<>
									<h2>{ __( 'Responsive breakpoint (px)', 'flexible-table-block' ) }</h2>
									<RangeControl
										id="flexible-table-block-global-breakpoint"
										help={ __(
											'Set the screen width (breakpoint) as the basis for switching between desktop and mobile devices.',
											'flexible-table-block'
										) }
										beforeIcon="smartphone"
										afterIcon="desktop"
										min={ MIN_RESPONSIVE_BREAKPOINT }
										max={ MAX_RESPONSIVE_BREAKPOINT }
										value={
											currentOptions.breakpoint
												? Number( currentOptions.breakpoint )
												: DEFAULT_RESPONSIVE_BREAKPOINT
										}
										allowReset
										onChange={ ( value ) => {
											setCurrentOptions( {
												...currentOptions,
												breakpoint: value ? value : DEFAULT_RESPONSIVE_BREAKPOINT,
											} );
										} }
									/>
								</>
							) }
							{ name === 'options' && (
								<>
									<ToggleControl
										label={ __( 'Show section labels', 'flexible-table-block' ) }
										help={ __(
											'Show section labels in the upper left corner of the table header, table body, and table footer sections.',
											'flexible-table-block'
										) }
										checked={ !! currentOptions.show_label_on_section }
										onChange={ ( value ) => {
											setCurrentOptions( {
												...currentOptions,
												show_label_on_section: value,
											} );
										} }
									/>
									<ToggleControl
										label={ __( 'Show control buttons', 'flexible-table-block' ) }
										help={ __(
											'Show insert row/column and select row/column buttons.',
											'flexible-table-block'
										) }
										checked={ !! currentOptions.show_control_button }
										onChange={ ( value ) => {
											setCurrentOptions( {
												...currentOptions,
												show_control_button: value,
											} );
										} }
									/>
									{ ( currentOptions.show_label_on_section ||
										currentOptions.show_control_button ) && (
										<ToggleControl
											label={ __(
												'Focus on the control button with the cursor movement keys',
												'flexible-table-block'
											) }
											help={ __(
												'Focus insert/select buttons, select row/column buttons, and section labels with the cursor movement keys.',
												'flexible-table-block'
											) }
											checked={ !! currentOptions.focus_control_button }
											onChange={ ( value ) => {
												setCurrentOptions( {
													...currentOptions,
													focus_control_button: value,
												} );
											} }
										/>
									) }
									<ToggleControl
										label={ __( 'Show dot on th tag', 'flexible-table-block' ) }
										help={ __(
											'Show a small dot in the upper right corner of a cell when the cell is th element.',
											'flexible-table-block'
										) }
										checked={ !! currentOptions.show_dot_on_th }
										onChange={ ( value ) => {
											setCurrentOptions( {
												...currentOptions,
												show_dot_on_th: value,
											} );
										} }
									/>
									<ToggleControl
										label={ __( 'Use the tab key to move cells', 'flexible-table-block' ) }
										help={ __(
											'Pressing the tab key moves the focus to the next cell. Holding down the shift key moves the focus to the previous cell.',
											'flexible-table-block'
										) }
										checked={ !! currentOptions.tab_move }
										onChange={ ( value ) => {
											setCurrentOptions( {
												...currentOptions,
												tab_move: value,
											} );
										} }
									/>
									<ToggleControl
										label={ __( 'Keep all contents when merging cells', 'flexible-table-block' ) }
										help={ __(
											'If turned off, only the contents of the first cell will remain when the cells are merged.',
											'flexible-table-block'
										) }
										checked={ !! currentOptions.merge_content }
										onChange={ ( value ) => {
											setCurrentOptions( {
												...currentOptions,
												merge_content: value,
											} );
										} }
									/>
									{ isAdministrator && (
										<ToggleControl
											label={ __(
												'Show Global setting button to non-administrative users',
												'flexible-table-block'
											) }
											help={ __(
												'By turning it on, you can prevent non-administrative users from changing Global setting.',
												'flexible-table-block'
											) }
											checked={ !! currentOptions.show_global_setting }
											onChange={ ( value ) => {
												setCurrentOptions( {
													...currentOptions,
													show_global_setting: value,
												} );
											} }
										/>
									) }
								</>
							) }
						</>
					) }
				</TabPanel>
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
					<Button variant="primary" disabled={ isWaiting } onClick={ handleUpdateOptions }>
						{ __( 'Save settings', 'flexible-table-block' ) }
					</Button>
					<Button
						variant="link"
						isDestructive
						disabled={ isWaiting }
						onClick={ () => setIsResetPopup( ! isResetPopup ) }
					>
						{ __( 'Restore default settings', 'flexible-table-block' ) }
						{ isResetPopup && (
							<Popover
								className="ftb-global-setting-modal__confirm-popover"
								focusOnMount="container"
								onClose={ () => setIsResetPopup( false ) }
							>
								<p>{ __( 'Are you sure?', 'flexible-table-block' ) }</p>
								<div className="ftb-global-setting-modal__confirm-popover-buttons">
									<Button isDestructive onClick={ handleResetOptions }>
										{ __( 'Restore', 'flexible-table-block' ) }
									</Button>
									<Button variant="secondary" onClick={ () => setIsResetPopup( false ) }>
										{ __( 'Cancel', 'flexible-table-block' ) }
									</Button>
								</div>
							</Popover>
						) }
					</Button>
				</div>
				<Popover.Slot />
			</Modal>
		</SlotFillProvider>
	);
}
