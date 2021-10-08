/**
 * External dependencies
 */
import { get } from 'lodash';
import classnames from 'classnames';

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
	__experimentalText as Text,
} from '@wordpress/components';
import { store as blockEditorStore } from '@wordpress/block-editor';

export default function ColorControl( {
	id,
	label = __( 'Color', 'flexible-table-block' ),
	help,
	className,
	onChange,
	colors: colorsProp = [],
	value,
} ) {
	const colors = useSelect( ( select ) => {
		const { getSettings } = select( blockEditorStore );
		return get( getSettings(), [ 'colors' ], [] );
	} );

	const [ isPickerOpen, setIsPickerOpen ] = useState( false );
	const [ pickerIndex, setPickerIndex ] = useState( undefined );

	const headingId = `${ id }-heading`;

	const classNames = classnames( 'ftb-color-control', className );

	const handleOnReset = () => onChange( null );

	const handleOnChange = ( inputValue ) => onChange( inputValue );

	const handleOnPickerOpen = ( targetPickerIndex ) => {
		setIsPickerOpen( true );
		setPickerIndex( targetPickerIndex );
	};

	const handleOnPickerClose = () => {
		setIsPickerOpen( false );
		setPickerIndex();
	};

	return (
		<BaseControl className={ classNames } id={ id } help={ help } aria-labelledby={ headingId }>
			<div className="ftb-color-control__header">
				<Text id={ headingId }>{ label }</Text>
				<Button isSecondary isSmall onClick={ handleOnReset } value={ value }>
					{ __( 'Reset' ) }
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
								} ) }
								colorValue={ value }
							/>
						</Button>
						{ isPickerOpen && ! pickerIndex && (
							<Popover
								className="ftb-color-control__popover"
								position="top right"
								onClose={ handleOnPickerClose }
							>
								<ColorPalette
									colors={ [ ...colors, ...colorsProp ] }
									value={ value }
									onChange={ handleOnChange }
								/>
							</Popover>
						) }
					</div>
				</div>
			</div>
		</BaseControl>
	);
}
