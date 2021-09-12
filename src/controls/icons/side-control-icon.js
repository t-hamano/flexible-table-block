/**
 * External dependencies
 */
import { css } from '@emotion/react';
import styled from '@emotion/styled';

/**
 * Internal dependencies
 */
import { ViewBox } from '../styles/common-styles';

const strokeFocus = ( { isFocused = false } ) => {
	return css( {
		backgroundColor: 'currentColor',
		opacity: isFocused ? 1 : 0.3,
	} );
};

const Stroke = styled.span`
	box-sizing: border-box;
	display: block;
	pointer-events: none;
	position: absolute;
	${ strokeFocus };
`;

const TopStroke = styled( Stroke )`
	height: 2px;
	left: 6px;
	right: 6px;
	top: 3px;
`;

const RightStroke = styled( Stroke )`
	bottom: 6px;
	top: 6px;
	width: 2px;
	right: 3px;
`;

const BottomStroke = styled( Stroke )`
	height: 2px;
	left: 6px;
	right: 6px;
	bottom: 3px;
`;

const LeftStroke = styled( Stroke )`
	bottom: 6px;
	top: 6px;
	width: 2px;
	left: 3px;
`;

export default function SideControlIcon( { sides } ) {
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
