/**
 * External dependencies
 */
import clsx from 'clsx';
import type { Property } from 'csstype';

/**
 * WordPress dependencies
 */
import { ColorIndicator } from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { Button, VisuallyHidden } from '@wordpress/ui';

type Props = {
	label: string;
	value?: Property.Color;
	isNone: boolean;
	isTransparent: boolean;
	isMixed?: boolean;
	isExpanded?: boolean;
	onClick: () => void;
};

export default function ColorIndicatorButton( {
	label,
	value,
	isNone,
	isTransparent,
	isMixed = false,
	isExpanded = false,
	onClick,
}: Props ) {
	let description: string;
	if ( isMixed ) {
		description = __( 'Mixed', 'flexible-table-block' );
	} else if ( isNone ) {
		description = __( 'No color selected', 'flexible-table-block' );
	} else if ( isTransparent ) {
		description = __( 'Transparent', 'flexible-table-block' );
	} else {
		description = value || '';
	}

	const descriptionId = useInstanceId(
		ColorIndicatorButton,
		'ftb-color-indicator-button__description'
	);

	return (
		<>
			<Button
				variant="minimal"
				tone="neutral"
				size="small"
				aria-label={ label }
				aria-describedby={ description ? descriptionId : undefined }
				aria-expanded={ isExpanded }
				className={ clsx( 'ftb-color-indicator-button', {
					'is-none': isNone,
					'is-mixed': isMixed,
					'is-transparent': isTransparent,
				} ) }
				onClick={ onClick }
			>
				{ isMixed ? (
					__( 'Mixed', 'flexible-table-block' )
				) : (
					<ColorIndicator
						colorValue={ value || '' }
						className="ftb-color-indicator-button__indicator"
					/>
				) }
			</Button>
			{ description && <VisuallyHidden id={ descriptionId }>{ description }</VisuallyHidden> }
		</>
	);
}
