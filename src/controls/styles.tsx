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
	margin-right: 8px;
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
	width: 7px;
	height: 7px;
	${ ( { isFocused } ) => ! isFocused && css( { opacity: 0.3 } ) }
`;

export const TopStroke = styled( Side )`
	top: 4px;
	right: 7px;
	left: 7px;
	height: 2px;
`;

export const RightStroke = styled( Side )`
	top: 7px;
	right: 4px;
	bottom: 7px;
	width: 2px;
	background-color: currentColor;
`;

export const BottomStroke = styled( Side )`
	right: 7px;
	bottom: 4px;
	left: 7px;
	height: 2px;
	background-color: currentColor;
`;

export const LeftStroke = styled( Side )`
	top: 7px;
	bottom: 7px;
	left: 4px;
	width: 2px;
	background-color: currentColor;
`;

export const TopLeftStroke = styled( Corner )`
	top: 4px;
	left: 4px;
	border-top: 2px solid;
	border-left: 2px solid;
`;

export const TopRightStroke = styled( Corner )`
	top: 4px;
	right: 4px;
	border-top: 2px solid;
	border-right: 2px solid;
`;

export const BottomRightStroke = styled( Corner )`
	right: 4px;
	bottom: 4px;
	border-right: 2px solid;
	border-bottom: 2px solid;
`;

export const BottomLeftStroke = styled( Corner )`
	bottom: 4px;
	left: 4px;
	border-bottom: 2px solid;
	border-left: 2px solid;
`;
