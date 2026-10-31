/**
 * External dependencies
 */
import type { Properties } from 'csstype';
import type { Dispatch, SetStateAction } from 'react';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { useDispatch, useRegistry } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';
import {
	Dropdown,
	Modal,
	RangeControl,
	__experimentalUnitControl as UnitControl,
	__experimentalUseCustomUnits as useCustomUnits,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
} from '@wordpress/components';
import { Button, Notice, Spinner, Stack, SwitchControl, Tabs, Text } from '@wordpress/ui';
import { desktop, mobile } from '@wordpress/icons';

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
	SIZE_UNITS,
	REST_API_ROUTE,
} from '../../constants';
import {
	BorderWidthControl,
	BorderStyleControl,
	ColorControl,
	PaddingControl,
} from '../../controls';
import { sanitizeUnitValue, cleanEmptyObject } from '../../utils/helper';
import { store as ftbStore, type ApiResponse, type StoreOptions } from '../../store';

type Props = {
	options: StoreOptions;
	canManageOptions: boolean;
	setIsSettingModalOpen: Dispatch< SetStateAction< boolean > >;
};

interface EditorStyle {
	css?: string;
	flexibleTableBlock?: boolean;
	[ key: string ]: unknown;
}

type BlockStyle = StoreOptions[ 'block_style' ];

interface NoticeInfo {
	status?: 'warning' | 'success' | 'error' | 'info';
	message?: string;
}

export default function SettingModal( {
	options,
	canManageOptions,
	setIsSettingModalOpen,
}: Props ) {
	const [ noticeInfo, setNoticeInfo ] = useState< NoticeInfo | undefined >( undefined );
	const [ isWaiting, setIsWaiting ] = useState( false );
	const [ currentOptions, setCurrentOptions ] = useState< StoreOptions >( options );

	const { setOptions: setStoreOptions } = useDispatch( ftbStore );
	const registry = useRegistry();
	const tableWidthUnits = useCustomUnits( { availableUnits: SIZE_UNITS } );

	// Update a single top-level option.
	function setOption< K extends keyof StoreOptions >( key: K, value: StoreOptions[ K ] ) {
		setCurrentOptions( ( prevOptions ) => ( { ...prevOptions, [ key ]: value } ) );
	}

	// Update a single default block style.
	function setBlockStyle< K extends keyof BlockStyle >( key: K, value: BlockStyle[ K ] ) {
		setCurrentOptions( ( prevOptions ) => ( {
			...prevOptions,
			block_style: { ...prevOptions.block_style, [ key ]: value },
		} ) );
	}

	// Force focus on the modal as it loses focus when saving or restoring settings.
	function focusModal() {
		const modal = document.querySelector( '.ftb-global-setting-modal' ) as HTMLInputElement;
		if ( modal ) {
			modal.focus();
		}
	}

	// Update the block CSS in the editor styles.
	function updateInlineCss( css: string ) {
		const isBlockStyle = ( style: EditorStyle ) => style.flexibleTableBlock;

		// Update every store that holds the block CSS. The site editor passes settings built
		// from `core/edit-site` to the editor provider, which overwrites `core/editor` settings
		// whenever they are rebuilt (e.g. when global styles change).
		const stores = [
			{ name: 'core/edit-site', getter: 'getSettings', setter: 'updateSettings' },
			{ name: 'core/editor', getter: 'getEditorSettings', setter: 'updateEditorSettings' },
			{ name: 'core/block-editor', getter: 'getSettings', setter: 'updateSettings' },
		];

		for ( const { name, getter, setter } of stores ) {
			const styles: EditorStyle[] | undefined = registry.select( name )?.[ getter ]?.()?.styles;

			if ( ! styles?.some( isBlockStyle ) ) {
				continue;
			}

			registry.dispatch( name )[ setter ]( {
				styles: styles.map( ( style ) => ( isBlockStyle( style ) ? { ...style, css } : style ) ),
			} );
		}
	}

	// Update options.
	const handleUpdateOptions = () => {
		setIsWaiting( true );
		setNoticeInfo( undefined );

		apiFetch< ApiResponse >( {
			path: REST_API_ROUTE,
			method: 'POST',
			data: currentOptions,
		} )
			.then( ( response ) => {
				// Show notice message.
				if ( response.status && response.message ) {
					setNoticeInfo( {
						status: response.status,
						message: response.message,
					} );
				}

				if ( response.status === 'error' ) {
					return;
				}

				// Update store options only after the options are saved.
				setStoreOptions( currentOptions );

				if ( response.block_css ) {
					updateInlineCss( response.block_css );
				}
			} )
			.catch( ( error ) => {
				setNoticeInfo( {
					status: 'error',
					message: error?.message,
				} );
			} )
			.finally( () => {
				focusModal();
				setIsWaiting( false );
			} );
	};

	// Reset state and store options.
	const handleResetOptions = () => {
		setIsWaiting( true );
		setNoticeInfo( undefined );

		apiFetch< ApiResponse >( {
			path: REST_API_ROUTE,
			method: 'DELETE',
		} )
			.then( ( response ) => {
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

				if ( response.block_css ) {
					updateInlineCss( response.block_css );
				}
			} )
			.catch( ( error ) => {
				setNoticeInfo( {
					status: 'error',
					message: error?.message,
				} );
			} )
			.finally( () => {
				focusModal();
				setIsWaiting( false );
			} );
	};

	return (
		<Modal
			title={ __( 'Flexible Table Block Global setting', 'flexible-table-block' ) }
			className="ftb-global-setting-modal"
			onRequestClose={ () => setIsSettingModalOpen( false ) }
			size="large"
		>
			{ isWaiting && (
				<Stack align="center" justify="center" className="ftb-global-setting-modal__loading">
					<Spinner />
				</Stack>
			) }
			<Tabs.Root
				className="ftb-global-setting-modal__tab-panel"
				orientation="vertical"
				defaultValue="table"
			>
				<Tabs.List>
					<Tabs.Tab value="table">{ __( 'Table styles', 'flexible-table-block' ) }</Tabs.Tab>
					<Tabs.Tab value="cell">{ __( 'Cell styles', 'flexible-table-block' ) }</Tabs.Tab>
					<Tabs.Tab value="responsive">
						{ __( 'Responsive setting', 'flexible-table-block' ) }
					</Tabs.Tab>
					<Tabs.Tab value="options">{ __( 'Editor options', 'flexible-table-block' ) }</Tabs.Tab>
				</Tabs.List>
				<Tabs.Panel value="table">
					<Stack direction="column" gap="lg">
						<Text variant="heading-md" render={ <h5 /> }>
							{ __( 'Default table styles', 'flexible-table-block' ) }
						</Text>
						<div className="ftb-global-setting-modal__styles">
							<div className="ftb-global-setting-modal__styles-item">
								<UnitControl
									label={ __( 'Table width', 'flexible-table-block' ) }
									units={ tableWidthUnits }
									value={ currentOptions.block_style?.table_width }
									min={ 0 }
									onChange={ ( value ) =>
										setBlockStyle( 'table_width', sanitizeUnitValue( value ) )
									}
									__unstableInputWidth="100px"
								/>
							</div>
							<div className="ftb-global-setting-modal__styles-item">
								<UnitControl
									label={ __( 'Table max width', 'flexible-table-block' ) }
									units={ tableWidthUnits }
									value={ currentOptions.block_style?.table_max_width }
									min={ 0 }
									onChange={ ( value ) =>
										setBlockStyle( 'table_max_width', sanitizeUnitValue( value ) )
									}
									__unstableInputWidth="100px"
								/>
							</div>
							<div className="ftb-global-setting-modal__styles-item">
								<ToggleGroupControl
									label={ __( 'Cell borders', 'flexible-table-block' ) }
									value={ currentOptions.block_style?.table_border_collapse }
									isDeselectable
									onChange={ ( value ) => {
										const isAllowedValue = (
											_value: any
										): _value is Properties[ 'borderCollapse' ] => {
											return (
												! _value ||
												BORDER_COLLAPSE_CONTROLS.some( ( control ) => control.value === _value )
											);
										};
										if ( isAllowedValue( value ) ) {
											setBlockStyle( 'table_border_collapse', value );
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
						<Text variant="heading-md" render={ <h5 /> }>
							{ __( 'Default striped table styles', 'flexible-table-block' ) }
						</Text>
						<div className="ftb-global-setting-modal__styles">
							<div className="ftb-global-setting-modal__styles-item">
								<ColorControl
									label={ __(
										'Striped style background color ( odd rows )',
										'flexible-table-block'
									) }
									value={ currentOptions.block_style?.row_odd_color }
									onChange={ ( value ) => setBlockStyle( 'row_odd_color', value ) }
								/>
							</div>
							<div className="ftb-global-setting-modal__styles-item">
								<ColorControl
									label={ __(
										'Striped style background color ( even rows )',
										'flexible-table-block'
									) }
									value={ currentOptions.block_style?.row_even_color }
									onChange={ ( value ) => setBlockStyle( 'row_even_color', value ) }
								/>
							</div>
						</div>
					</Stack>
				</Tabs.Panel>
				<Tabs.Panel value="cell">
					<Stack direction="column" gap="lg">
						<Text variant="heading-md" render={ <h5 /> }>
							{ __( 'Default cell styles', 'flexible-table-block' ) }
						</Text>
						<div className="ftb-global-setting-modal__styles">
							<div className="ftb-global-setting-modal__styles-item">
								<ColorControl
									label={ __( 'Cell text color ( th tag )', 'flexible-table-block' ) }
									value={ currentOptions.block_style?.cell_text_color_th }
									onChange={ ( value ) => setBlockStyle( 'cell_text_color_th', value ) }
								/>
							</div>
							<div className="ftb-global-setting-modal__styles-item">
								<ColorControl
									label={ __( 'Cell text color ( td tag )', 'flexible-table-block' ) }
									value={ currentOptions.block_style?.cell_text_color_td }
									onChange={ ( value ) => setBlockStyle( 'cell_text_color_td', value ) }
								/>
							</div>
							<div className="ftb-global-setting-modal__styles-item">
								<ColorControl
									label={ __( 'Cell background color ( th tag )', 'flexible-table-block' ) }
									value={ currentOptions.block_style?.cell_background_color_th }
									onChange={ ( value ) => setBlockStyle( 'cell_background_color_th', value ) }
								/>
							</div>
							<div className="ftb-global-setting-modal__styles-item">
								<ColorControl
									label={ __( 'Cell background color ( td tag )', 'flexible-table-block' ) }
									value={ currentOptions.block_style?.cell_background_color_td }
									onChange={ ( value ) => setBlockStyle( 'cell_background_color_td', value ) }
								/>
							</div>
							<div className="ftb-global-setting-modal__styles-item">
								<PaddingControl
									label={ __( 'Cell padding', 'flexible-table-block' ) }
									values={ currentOptions?.block_style.cell_padding || {} }
									onChange={ ( values ) =>
										setBlockStyle( 'cell_padding', cleanEmptyObject( values ) )
									}
								/>
							</div>
							<div className="ftb-global-setting-modal__styles-item">
								<BorderWidthControl
									label={ __( 'Cell border width', 'flexible-table-block' ) }
									values={ { top: currentOptions.block_style?.cell_border_width } }
									allowSides={ false }
									hasIndicator={ false }
									onChange={ ( value ) =>
										setBlockStyle( 'cell_border_width', sanitizeUnitValue( value.top ) )
									}
								/>
							</div>
							<div className="ftb-global-setting-modal__styles-item">
								<BorderStyleControl
									label={ __( 'Cell border style', 'flexible-table-block' ) }
									values={ { top: currentOptions.block_style?.cell_border_style } }
									allowSides={ false }
									hasIndicator={ false }
									onChange={ ( value ) => setBlockStyle( 'cell_border_style', value.top ) }
								/>
							</div>
							<div className="ftb-global-setting-modal__styles-item">
								<ColorControl
									label={ __( 'Cell border color', 'flexible-table-block' ) }
									value={ currentOptions.block_style?.cell_border_color }
									onChange={ ( value ) => setBlockStyle( 'cell_border_color', value ) }
								/>
							</div>
							<div className="ftb-global-setting-modal__styles-item">
								<ToggleGroupControl
									label={ __( 'Cell text alignment', 'flexible-table-block' ) }
									value={ currentOptions.block_style?.cell_text_align }
									isDeselectable
									onChange={ ( value ) => {
										if ( typeof value !== 'string' && value !== undefined ) {
											return;
										}
										setBlockStyle( 'cell_text_align', value );
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
									label={ __( 'Cell vertical alignment', 'flexible-table-block' ) }
									value={ currentOptions.block_style?.cell_vertical_align }
									isDeselectable
									onChange={ ( value ) => {
										if ( typeof value !== 'string' && value !== undefined ) {
											return;
										}
										setBlockStyle( 'cell_vertical_align', value );
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
					</Stack>
				</Tabs.Panel>
				<Tabs.Panel value="responsive">
					<Stack direction="column" gap="lg">
						<Text variant="heading-md" render={ <h5 /> }>
							{ __( 'Responsive breakpoint (px)', 'flexible-table-block' ) }
						</Text>
						<RangeControl
							help={ __(
								'Set the screen width (breakpoint) as the basis for switching between desktop and mobile devices.',
								'flexible-table-block'
							) }
							beforeIcon={ mobile }
							afterIcon={ desktop }
							min={ MIN_RESPONSIVE_BREAKPOINT }
							max={ MAX_RESPONSIVE_BREAKPOINT }
							value={
								currentOptions.breakpoint
									? Number( currentOptions.breakpoint )
									: DEFAULT_RESPONSIVE_BREAKPOINT
							}
							allowReset
							onChange={ ( value ) =>
								setOption( 'breakpoint', value ? value : DEFAULT_RESPONSIVE_BREAKPOINT )
							}
						/>
					</Stack>
				</Tabs.Panel>
				<Tabs.Panel value="options">
					<Stack direction="column" gap="lg">
						<SwitchControl
							label={ __( 'Show section labels', 'flexible-table-block' ) }
							description={ __(
								'Show section labels in the upper left corner of the table header, table body, and table footer sections.',
								'flexible-table-block'
							) }
							checked={ !! currentOptions.show_label_on_section }
							onCheckedChange={ ( value ) => setOption( 'show_label_on_section', value ) }
						/>
						<SwitchControl
							label={ __( 'Show control buttons', 'flexible-table-block' ) }
							description={ __(
								'Show insert row/column and select row/column buttons.',
								'flexible-table-block'
							) }
							checked={ !! currentOptions.show_control_button }
							onCheckedChange={ ( value ) => setOption( 'show_control_button', value ) }
						/>
						{ ( currentOptions.show_label_on_section || currentOptions.show_control_button ) && (
							<SwitchControl
								label={ __(
									'Focus on the control button with the cursor movement keys',
									'flexible-table-block'
								) }
								description={ __(
									'Focus insert/select buttons, select row/column buttons, and section labels with the cursor movement keys.',
									'flexible-table-block'
								) }
								checked={ !! currentOptions.focus_control_button }
								onCheckedChange={ ( value ) => setOption( 'focus_control_button', value ) }
							/>
						) }
						<SwitchControl
							label={ __( 'Show dot on th tag', 'flexible-table-block' ) }
							description={ __(
								'Show a small dot in the upper right corner of a cell when the cell is th element.',
								'flexible-table-block'
							) }
							checked={ !! currentOptions.show_dot_on_th }
							onCheckedChange={ ( value ) => setOption( 'show_dot_on_th', value ) }
						/>
						<SwitchControl
							label={ __( 'Use the tab key to move cells', 'flexible-table-block' ) }
							description={ __(
								'Pressing the tab key moves the focus to the next cell. Holding down the shift key moves the focus to the previous cell.',
								'flexible-table-block'
							) }
							checked={ !! currentOptions.tab_move }
							onCheckedChange={ ( value ) => setOption( 'tab_move', value ) }
						/>
						<SwitchControl
							label={ __( 'Keep all contents when merging cells', 'flexible-table-block' ) }
							description={ __(
								'If turned off, only the contents of the first cell will remain when the cells are merged.',
								'flexible-table-block'
							) }
							checked={ !! currentOptions.merge_content }
							onCheckedChange={ ( value ) => setOption( 'merge_content', value ) }
						/>
						{ canManageOptions && (
							<SwitchControl
								label={ __(
									'Show Global setting button to non-administrative users',
									'flexible-table-block'
								) }
								description={ __(
									'By turning it on, you can prevent non-administrative users from changing Global setting.',
									'flexible-table-block'
								) }
								checked={ !! currentOptions.show_global_setting }
								onCheckedChange={ ( value ) => setOption( 'show_global_setting', value ) }
							/>
						) }
					</Stack>
				</Tabs.Panel>
			</Tabs.Root>
			{ noticeInfo?.status && noticeInfo?.message && (
				<Notice.Root className="ftb-global-setting-modal__notice" intent={ noticeInfo.status }>
					<Notice.Description>{ noticeInfo.message }</Notice.Description>
					<Notice.CloseIconButton
						onClick={ () => {
							setNoticeInfo( undefined );
							focusModal();
						} }
					/>
				</Notice.Root>
			) }
			<Stack
				align="center"
				justify="space-between"
				gap="sm"
				className="ftb-global-setting-modal__buttons"
			>
				<Button disabled={ isWaiting } onClick={ handleUpdateOptions }>
					{ __( 'Save settings', 'flexible-table-block' ) }
				</Button>
				{ canManageOptions && (
					<Dropdown
						focusOnMount="firstElement"
						popoverProps={ {
							className: 'ftb-global-setting-modal__confirm-popover',
							placement: 'top',
						} }
						renderToggle={ ( { isOpen, onToggle } ) => (
							<Button
								variant="minimal"
								disabled={ isWaiting }
								aria-expanded={ isOpen }
								onClick={ onToggle }
							>
								{ __( 'Restore default settings', 'flexible-table-block' ) }
							</Button>
						) }
						renderContent={ ( { onClose } ) => (
							<Stack direction="column" gap="lg" style={ { padding: '8px' } }>
								<Text render={ <p /> }>{ __( 'Are you sure?', 'flexible-table-block' ) }</Text>
								<Stack align="center" justify="space-between" gap="sm">
									<Button
										onClick={ () => {
											onClose();
											handleResetOptions();
										} }
										size="compact"
									>
										{ __( 'Restore', 'flexible-table-block' ) }
									</Button>
									<Button variant="outline" onClick={ onClose } size="compact">
										{ __( 'Cancel', 'flexible-table-block' ) }
									</Button>
								</Stack>
							</Stack>
						) }
					/>
				) }
			</Stack>
		</Modal>
	);
}
