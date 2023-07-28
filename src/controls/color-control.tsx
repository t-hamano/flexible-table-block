/**
 * External dependencies
 */
import classnames from 'classnames';
import type { Property } from 'csstype';
import type { ReactElement } from 'react';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';
import {
	BaseControl,
	Button,
	Popover,
	ColorIndicator,
	ColorPalette,
	SlotFillProvider,
	// @ts-ignore: has no exported member
	__experimentalText as Text,
} from '@wordpress/components';
import { store as blockEditorStore } from '@wordpress/block-editor';

type Props = {
	id: string;
	label: string | ReactElement;
	help?: string;
	className?: string;
	onChange: ( event: any ) => void;
	colors?: {
		name: string;
		slug: string;
		color: Property.Color;
	}[];
	value: Property.Color | undefined;
};

export default function ColorControl( {
	id,
	label = __( 'Color', 'flexible-table-block' ),
	help,
	className,
	onChange,
	colors: colorsProp = [],
	value,
}: Props ) {
	const colors = useSelect( ( select ) => {
		const settings = select(
			blockEditorStore
			// @ts-ignore
		).getSettings();
		return settings?.colors ?? [];
	}, [] );

	const [ isPickerOpen, setIsPickerOpen ] = useState< boolean >( false );

	const headingId: string = `${ id }-heading`;

	const classNames: string = classnames( 'ftb-color-control', className );

	const handleOnReset = () => onChange( undefined );

	const handleOnChange = ( inputValue: Property.Color ) => onChange( inputValue );

	const handleOnPickerOpen = () => setIsPickerOpen( true );

	const handleOnPickerClose = () => setIsPickerOpen( false );

	return (
		<SlotFillProvider>
			<BaseControl id={ id } className={ classNames } help={ help }>
				<div aria-labelledby={ headingId } role="region">
					<div className="ftb-color-control__header">
						<Text id={ headingId }>{ label }</Text>
						<Button isSmall variant="secondary" onClick={ handleOnReset }>
							{ __( 'Reset', 'flexible-table-block' ) }
						</Button>
					</div>
					<div className="ftb-color-control__controls">
						<div className="ftb-color-control__controls-inner">
							<div className="ftb-color-control__controls-row">
								<Button
									label={ __( 'All', 'flexible-table-block' ) }
									className={ classnames( 'ftb-color-control__indicator', {
										'ftb-color-control__indicator--none': ! value,
										'ftb-color-control__indicator--transparent': value === 'transparent',
									} ) }
									onClick={ () => handleOnPickerOpen() }
								>
									<ColorIndicator colorValue={ value || '' } />
								</Button>
								{ isPickerOpen && (
									<Popover className="ftb-color-control__popover" onClose={ handleOnPickerClose }>
										<ColorPalette
											colors={ [ ...colors, ...colorsProp ] }
											value={ value || '' }
											onChange={ handleOnChange }
										/>
									</Popover>
								) }
							</div>
						</div>
					</div>
				</div>
				<Popover.Slot />
			</BaseControl>
		</SlotFillProvider>
	);
}
