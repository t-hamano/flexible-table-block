/**
 * External dependencies
 */
import type { Properties } from 'csstype';
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
	Notice,
	Modal,
	Popover,
	TabPanel,
	Spinner,
	RangeControl,
	ToggleControl,
	__experimentalText as Text,
	__experimentalSpacer as Spacer,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalUnitControl as UnitControl,
	__experimentalUseCustomUnits as useCustomUnits,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
	SlotFillProvider,
} from '@wordpress/components';

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
import type { NoticeProps } from '@wordpress/components/build-types/notice/types';

type Props = {
	options: StoreOptions;
	isAdministrator: boolean;
	setIsSettingModalOpen: Dispatch< SetStateAction< boolean > >;
};

interface NoticeInfo {
	status?: NoticeProps[ 'status' ];
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

			if ( ! iframeWindow ) {
				continue;
			}

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
										<div className="ftb-global-setting-modal__styles-item">
											<BaseControl
												id="flexible-table-block-global-table-width"
												label={ __( 'Table width', 'flexible-table-block' ) }
												className="ftb-width-control"
											>
												<UnitControl
													id="flexible-table-block-global-table-width"
													units={ tableWidthUnits }
													value={ currentOptions.block_style?.table_width }
													min={ 0 }
													onChange={ ( value ) => {
														setCurrentOptions( {
															...currentOptions,
															block_style: {
																...currentOptions.block_style,
																table_width: sanitizeUnitValue( value ),
															},
														} );
													} }
													size="__unstable-large"
												/>
											</BaseControl>
										</div>
										<div className="ftb-global-setting-modal__styles-item">
											<BaseControl
												id="flexible-table-block-global-table-max-width"
												label={ __( 'Table max width', 'flexible-table-block' ) }
												className="ftb-width-control"
											>
												<UnitControl
													id="flexible-table-block-global-table-max-width"
													units={ tableWidthUnits }
													value={ currentOptions.block_style?.table_max_width }
													min={ 0 }
													onChange={ ( value ) => {
														setCurrentOptions( {
															...currentOptions,
															block_style: {
																...currentOptions.block_style,
																table_max_width: sanitizeUnitValue( value ),
															},
														} );
													} }
													size="__unstable-large"
												/>
											</BaseControl>
										</div>
										<div className="ftb-global-setting-modal__styles-item">
											<ToggleGroupControl
												__nextHasNoMarginBottom
												label={ __( 'Cell borders', 'flexible-table-block' ) }
												value={ currentOptions.block_style?.table_border_collapse }
												isDeselectable
												onChange={ ( value ) => {
													const isAllowedValue = (
														_value: any
													): _value is Properties[ 'borderCollapse' ] => {
														return (
															! value ||
															BORDER_COLLAPSE_CONTROLS.some(
																( control ) => control.value === _value
															)
														);
													};
													if ( isAllowedValue( value ) ) {
														const newValue =
															currentOptions?.block_style?.table_border_collapse === value
																? undefined
																: value;
														setCurrentOptions( {
															...currentOptions,
															block_style: {
																...currentOptions.block_style,
																table_border_collapse: newValue,
															},
														} );
													}
												} }
											>
												{ BORDER_COLLAPSE_CONTROLS.map( ( { icon, label, value } ) => (
													<ToggleGroupControlOptionIcon
														key={ value }
														value={ value }
														icon={ icon }
														label={ label }
													/>
												) ) }
											</ToggleGroupControl>
										</div>
									</div>
									<h2>{ __( 'Default striped table styles', 'flexible-table-block' ) }</h2>
									<div className="ftb-global-setting-modal__styles">
										<div className="ftb-global-setting-modal__styles-item">
											<ColorControl
												label={ __(
													'Striped style background color ( odd rows )',
													'flexible-table-block'
												) }
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
										</div>
										<div className="ftb-global-setting-modal__styles-item">
											<ColorControl
												label={ __(
													'Striped style background color ( even rows )',
													'flexible-table-block'
												) }
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
									</div>
								</>
							) }
							{ name === 'cell' && (
								<>
									<h2>{ __( 'Default cell styles', 'flexible-table-block' ) }</h2>
									<div className="ftb-global-setting-modal__styles">
										<div className="ftb-global-setting-modal__styles-item">
											<ColorControl
												label={ createInterpolateElement(
													__( 'Cell text color ( <code>th</code> tag )', 'flexible-table-block' ),
													{ code: <code /> }
												) }
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
										</div>
										<div className="ftb-global-setting-modal__styles-item">
											<ColorControl
												label={ createInterpolateElement(
													__( 'Cell text color ( <code>td</code> tag )', 'flexible-table-block' ),
													{ code: <code /> }
												) }
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
										</div>
										<div className="ftb-global-setting-modal__styles-item">
											<ColorControl
												label={ createInterpolateElement(
													__(
														'Cell background color ( <code>th</code> tag )',
														'flexible-table-block'
													),
													{ code: <code /> }
												) }
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
										</div>
										<div className="ftb-global-setting-modal__styles-item">
											<ColorControl
												label={ createInterpolateElement(
													__(
														'Cell background color ( <code>td</code> tag )',
														'flexible-table-block'
													),
													{ code: <code /> }
												) }
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
										</div>
										<div className="ftb-global-setting-modal__styles-item">
											<PaddingControl
												label={ __( 'Cell padding', 'flexible-table-block' ) }
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
										</div>
										<div className="ftb-global-setting-modal__styles-item">
											<BorderWidthControl
												label={ __( 'Cell border width', 'flexible-table-block' ) }
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
										</div>
										<div className="ftb-global-setting-modal__styles-item">
											<BorderStyleControl
												label={ __( 'Cell border style', 'flexible-table-block' ) }
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
										</div>
										<div className="ftb-global-setting-modal__styles-item">
											<ColorControl
												label={ __( 'Cell border color', 'flexible-table-block' ) }
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
										</div>
										<div className="ftb-global-setting-modal__styles-item">
											<ToggleGroupControl
												__nextHasNoMarginBottom
												label={ __( 'Cell text alignment', 'flexible-table-block' ) }
												value={ currentOptions.block_style?.cell_text_align }
												isDeselectable
												onChange={ ( value ) => {
													if ( typeof value !== 'string' && value !== undefined ) {
														return;
													}
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
											>
												{ TEXT_ALIGNMENT_CONTROLS.map( ( { icon, label, value } ) => (
													<ToggleGroupControlOptionIcon
														key={ value }
														value={ value }
														icon={ icon }
														label={ label }
													/>
												) ) }
											</ToggleGroupControl>
										</div>
										<div className="ftb-global-setting-modal__styles-item">
											<ToggleGroupControl
												__nextHasNoMarginBottom
												label={ __( 'Cell vertical alignment', 'flexible-table-block' ) }
												value={ currentOptions.block_style?.cell_vertical_align }
												isDeselectable
												onChange={ ( value ) => {
													if ( typeof value !== 'string' && value !== undefined ) {
														return;
													}
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
											>
												{ VERTICAL_ALIGNMENT_CONTROLS.map( ( { icon, label, value } ) => (
													<ToggleGroupControlOptionIcon
														key={ value }
														value={ value }
														icon={ icon }
														label={ label }
													/>
												) ) }
											</ToggleGroupControl>
										</div>
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
										__next40pxDefaultSize
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
					<Button
						variant="primary"
						disabled={ isWaiting }
						onClick={ handleUpdateOptions }
						__next40pxDefaultSize
					>
						{ __( 'Save settings', 'flexible-table-block' ) }
					</Button>
					<Button
						isDestructive
						disabled={ isWaiting }
						onClick={ () => setIsResetPopup( ! isResetPopup ) }
						__next40pxDefaultSize
					>
						{ __( 'Restore default settings', 'flexible-table-block' ) }
						{ isResetPopup && (
							<Popover
								className="ftb-global-setting-modal__confirm-popover"
								focusOnMount="firstElement"
								onClose={ () => setIsResetPopup( false ) }
							>
								<Spacer marginBottom={ 0 } padding={ 2 }>
									<VStack spacing={ 4 }>
										<Text as="p">{ __( 'Are you sure?', 'flexible-table-block' ) }</Text>
										<HStack>
											<Button isDestructive onClick={ handleResetOptions } size="compact">
												{ __( 'Restore', 'flexible-table-block' ) }
											</Button>
											<Button
												variant="secondary"
												onClick={ () => setIsResetPopup( false ) }
												size="compact"
											>
												{ __( 'Cancel', 'flexible-table-block' ) }
											</Button>
										</HStack>
									</VStack>
								</Spacer>
							</Popover>
						) }
					</Button>
				</div>
				{ /* @ts-ignore Slot is not currently typed on Popover */ }
				<Popover.Slot />
			</Modal>
		</SlotFillProvider>
	);
}
