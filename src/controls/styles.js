/**
 * External dependencies
 */
import { css } from '@emotion/react';
import styled from '@emotion/styled';

export const SideControlHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-bottom: 12px;
`;

export const SideControlWrapper = styled.div`
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	min-height: 30px;
`;

export const SideControlRow = styled.div`
	display: flex;
	padding-bottom: 8px;
`;

export const ViewBox = styled.span`
	width: 24px;
	height: 24px;
	display: block;
	position: relative;
`;

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

export const TopStroke = styled( Stroke )`
	height: 2px;
	left: 6px;
	right: 6px;
	top: 3px;
`;

export const RightStroke = styled( Stroke )`
	bottom: 6px;
	top: 6px;
	width: 2px;
	right: 3px;
`;

export const BottomStroke = styled( Stroke )`
	height: 2px;
	left: 6px;
	right: 6px;
	bottom: 3px;
`;

export const LeftStroke = styled( Stroke )`
	bottom: 6px;
	top: 6px;
	width: 2px;
	left: 3px;
`;
