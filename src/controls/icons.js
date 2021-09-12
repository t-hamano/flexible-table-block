/**
 * Internal dependencies
 */
import { ViewBox, TopStroke, RightStroke, BottomStroke, LeftStroke } from './styles';

export function SideControlIcon( { sides } ) {
	const top = ! sides || sides.includes( 'top' );
	const right = ! sides || sides.includes( 'right' );
	const bottom = ! sides || sides.includes( 'bottom' );
	const left = ! sides || sides.includes( 'left' );

	return (
		<ViewBox>
			<TopStroke isFocused={ top } />
			<RightStroke isFocused={ right } />
			<BottomStroke isFocused={ bottom } />
			<LeftStroke isFocused={ left } />
		</ViewBox>
	);
}
