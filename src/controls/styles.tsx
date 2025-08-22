/**
 * External dependencies
 */
import { css } from '@emotion/react';
import styled from '@emotion/styled';

export const ViewBox = styled.span`
	position: relative;
	width: 24px;
	height: 24px;
`;

const Corner = styled.span< { isFocused: boolean } >`
	box-sizing: border-box;
	display: block;
	pointer-events: none;
	position: absolute;
	width: 8px;
	height: 8px;
	${ ( { isFocused } ) => ! isFocused && css( { opacity: 0.3 } ) }
`;

export const TopLeftStroke = styled( Corner )`
	top: 3px;
	left: 3px;
	border-top: 2px solid;
	border-left: 2px solid;
`;

export const TopRightStroke = styled( Corner )`
	top: 3px;
	right: 3px;
	border-top: 2px solid;
	border-right: 2px solid;
`;

export const BottomRightStroke = styled( Corner )`
	right: 3px;
	bottom: 3px;
	border-right: 2px solid;
	border-bottom: 2px solid;
`;

export const BottomLeftStroke = styled( Corner )`
	bottom: 3px;
	left: 3px;
	border-bottom: 2px solid;
	border-left: 2px solid;
`;
