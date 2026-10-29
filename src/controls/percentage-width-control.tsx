/**
 * WordPress dependencies
 */
import {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalParseQuantityAndUnitFromRawValue as parseQuantityAndUnitFromRawValue,
} from '@wordpress/components';

const PERCENTAGE_WIDTHS = [ 25, 50, 75, 100 ];

type Props = {
	label: string;
	value: string | number | undefined;
	onChange: ( value: string ) => void;
	// An additional option after the percentages, such as `auto` or `none`.
	additionalOption?: {
		label: string;
		value: string;
	};
	className?: string;
};

export default function PercentageWidthControl( {
	label,
	value,
	onChange,
	additionalOption,
	className,
}: Props ) {
	const [ parsedQuantity, parsedUnit ] = parseQuantityAndUnitFromRawValue( value );

	const isSelectable =
		( additionalOption && value === additionalOption.value ) ||
		( parsedQuantity && PERCENTAGE_WIDTHS.includes( parsedQuantity ) && parsedUnit === '%' );

	return (
		<ToggleGroupControl
			hideLabelFromVision
			className={ className }
			label={ label }
			isBlock
			value={ isSelectable ? value : undefined }
			onChange={ ( newValue ) => onChange( newValue as string ) }
		>
			{ PERCENTAGE_WIDTHS.map( ( perWidth ) => (
				<ToggleGroupControlOption
					key={ perWidth }
					label={ `${ perWidth }%` }
					value={ `${ perWidth }%` }
				/>
			) ) }
			{ additionalOption && (
				<ToggleGroupControlOption
					label={ additionalOption.label }
					value={ additionalOption.value }
				/>
			) }
		</ToggleGroupControl>
	);
}
