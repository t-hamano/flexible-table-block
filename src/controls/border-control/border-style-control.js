/**
 * WordPress dependencies
 */
import {
	Button,
	ButtonGroup,
	BaseControl
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { borderSolid, borderDotted, borderDashed, borderDouble } from '../../icon';

const BORDER_STYLES = [
	{ label: __( 'Solid', 'flexible-table-block' ), icon: borderSolid, value: 'solid' },
	{ label: __( 'Dotted', 'flexible-table-block' ), icon: borderDotted, value: 'dotted' },
	{ label: __( 'Dashed', 'flexible-table-block' ), icon: borderDashed, value: 'dashed' },
	{ label: __( 'Double', 'flexible-table-block' ), icon: borderDouble, value: 'double' }
];

export default function BorderStyleControl({ onChange, label, direction, values: valuesProp }) {

	const values =
		'string' !== typeof valuesProp ?
			valuesProp :
			{
				top: valuesProp,
				right: valuesProp,
				bottom: valuesProp,
				left: valuesProp
			};

	return (
		<BaseControl
			label={ __( 'Border style', 'flexible-table-block' ) + ` ( ${label} )` }
			id="flexible-table-block/border-style"
		>
			<ButtonGroup className="wp-block-flexible-table-block-table__components-button-group" >
				{ BORDER_STYLES.map( ( borderStyle ) => (
					<Button
						key={ borderStyle.value }
						icon={ borderStyle.icon }

						// isPressed={ borderStyle.value === values }
						label={ borderStyle.label }

						onClick={ () =>
							onChange( borderStyle.value, direction )
						}
					/>
				) ) }
			</ButtonGroup>
		</BaseControl>
	);
}
