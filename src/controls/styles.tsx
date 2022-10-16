/**
 * External dependencies
 */
import { css } from '@emotion/react';
import styled from '@emotion/styled';

export const ViewBox = styled.span`
	position: relative;
	display: block;
	width: 24px;
	height: 24px;
	margin-right: 12px;
`;

const Side = styled.span< { isFocused: boolean } >`
	background-color: currentColor;
	box-sizing: border-box;
	display: block;
	pointer-events: none;
	position: absolute;
	${ ( { isFocused } ) => ! isFocused && css( { opacity: 0.3 } ) }
`;

const Corner = styled.span< { isFocused: boolean } >`
	box-sizing: border-box;
	display: block;
	pointer-events: none;
	position: absolute;
	width: 9px;
	height: 9px;
	${ ( { isFocused } ) => ! isFocused && css( { opacity: 0.3 } ) }
`;

export const TopStroke = styled( Side )`
	top: 2px;
	right: 5px;
	left: 5px;
	height: 2px;
`;

export const RightStroke = styled( Side )`
	top: 5px;
	right: 2px;
	bottom: 5px;
	width: 2px;
	background-color: currentColor;
`;

export const BottomStroke = styled( Side )`
	right: 5px;
	bottom: 2px;
	left: 5px;
	height: 2px;
	background-color: currentColor;
`;

export const LeftStroke = styled( Side )`
	top: 5px;
	bottom: 5px;
	left: 2px;
	width: 2px;
	background-color: currentColor;
`;

export const TopLeftStroke = styled( Corner )`
	top: 2px;
	left: 2px;
	border-top: 2px solid;
	border-left: 2px solid;
`;

export const TopRightStroke = styled( Corner )`
	top: 2px;
	right: 2px;
	border-top: 2px solid;
	border-right: 2px solid;
`;

export const BottomRightStroke = styled( Corner )`
	right: 2px;
	bottom: 2px;
	border-right: 2px solid;
	border-bottom: 2px solid;
`;

export const BottomLeftStroke = styled( Corner )`
	bottom: 2px;
	left: 2px;
	border-bottom: 2px solid;
	border-left: 2px solid;
`;
