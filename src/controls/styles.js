/**
 * External dependencies
 */
import { css } from '@emotion/react';
import styled from '@emotion/styled';

export const ViewBox = styled.span`
	width: 24px;
	height: 24px;
	display: block;
	position: relative;
	margin-right: 8px;
`;

const strokeFocus = ( { isFocused = false } ) => {
	return css( { opacity: isFocused ? 1 : 0.3 } );
};

const Side = styled.span`
	background-color: currentColor;
	box-sizing: border-box;
	display: block;
	pointer-events: none;
	position: absolute;
	${ strokeFocus };
`;

const Corner = styled.span`
	box-sizing: border-box;
	display: block;
	pointer-events: none;
	position: absolute;
	width: 7px;
	height: 7px;
	${ strokeFocus };
`;

export const TopStroke = styled( Side )`
	height: 2px;
	left: 7px;
	right: 7px;
	top: 4px;
`;

export const RightStroke = styled( Side )`
	background-color: currentColor;
	bottom: 7px;
	top: 7px;
	width: 2px;
	right: 4px;
`;

export const BottomStroke = styled( Side )`
	background-color: currentColor;
	height: 2px;
	left: 7px;
	right: 7px;
	bottom: 4px;
`;

export const LeftStroke = styled( Side )`
	background-color: currentColor;
	bottom: 7px;
	top: 7px;
	width: 2px;
	left: 4px;
`;

export const TopLeftStroke = styled( Corner )`
	top: 4px;
	left: 4px;
	border-left: 2px solid;
	border-top: 2px solid;
`;

export const TopRightStroke = styled( Corner )`
	top: 4px;
	right: 4px;
	border-top: 2px solid;
	border-right: 2px solid;
`;

export const BottomRightStroke = styled( Corner )`
	bottom: 4px;
	right: 4px;
	border-bottom: 2px solid;
	border-right: 2px solid;
`;

export const BottomLeftStroke = styled( Corner )`
	bottom: 4px;
	left: 4px;
	border-bottom: 2px solid;
	border-left: 2px solid;
`;
