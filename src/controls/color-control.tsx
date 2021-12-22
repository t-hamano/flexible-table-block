/**
 * External dependencies
 */
import { get } from 'lodash';
import classnames from 'classnames';
import type { Property } from 'csstype';

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
	// @ts-ignore: has no exported member
	__experimentalText as Text,
} from '@wordpress/components';
import { store as blockEditorStore } from '@wordpress/block-editor';

type Props = {
	id: string;
	label: string;
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
		// @ts-ignore
		const settings = select( blockEditorStore ).getSettings();
		return get( settings, [ 'colors' ], [] );
	} );

	const [ isPickerOpen, setIsPickerOpen ] = useState< boolean >( false );

	const headingId: string = `${ id }-heading`;

	const classNames: string = classnames( 'ftb-color-control', className );

	const handleOnReset = () => onChange( undefined );

	const handleOnChange = ( inputValue: Property.Color ) => onChange( inputValue );

	const handleOnPickerOpen = () => setIsPickerOpen( true );

	const handleOnPickerClose = () => setIsPickerOpen( false );

	return (
		<BaseControl id={ id } className={ classNames } help={ help }>
			<div aria-labelledby={ headingId } role="region">
				<div className="ftb-color-control__header">
					<Text id={ headingId }>{ label }</Text>
					<Button isSmall isSecondary onClick={ handleOnReset }>
						{ __( 'Reset', 'flexible-table-block' ) }
					</Button>
				</div>
				<div className="ftb-color-control__controls">
					<div className="ftb-color-control__controls-inner">
						<div className="ftb-color-control__controls-row">
							<Button
								label={ __( 'All', 'flexible-table-block' ) }
								className="ftb-color-control__indicator"
								onClick={ () => handleOnPickerOpen() }
							>
								<ColorIndicator
									className={ classnames( {
										'component-color-indicator--none': ! value,
										'component-color-indicator--transparent': value === 'transparent',
									} ) }
									colorValue={ value || '' }
								/>
							</Button>
							{ isPickerOpen && (
								<Popover
									className="ftb-color-control__popover"
									position="top right"
									onClose={ handleOnPickerClose }
								>
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
		</BaseControl>
	);
}
