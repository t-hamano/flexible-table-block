/**
 * External dependencies
 */
import styled from '@emotion/styled';
import { Button } from '@wordpress/components';

// Row & Column inserter button.
const Inserter = styled( Button )`
	position: absolute;
	width: 18px;
	min-width: 0 !important;
	height: 18px;
	background: transparent;
	padding: 0 !important;
	border-radius: 50%;
	color: transparent;

	&::before {
		position: absolute;
		top: 6px;
		left: 6px;
		width: 6px;
		height: 6px;
		padding: 0;
		background: #828282;
		border-radius: 50%;
		content: '';
	}

	&:hover {
		background: var( --wp-admin-theme-color );
		color: #fff;

		&::before {
			content: none;
		}

		&:active {
			color: #fff;
		}
	}
`;

export const InserterButtonRowBefore = styled( Inserter )`
	left: -24px;
	top: ${ ( props ) => ( props.hasPrevSection ? '3px' : '-9px' ) };
`;

export const InserterButtonRowAfter = styled( Inserter )`
	left: -24px;
	bottom: ${ ( props ) => ( props.hasNextSection ? '3px' : '-9px' ) };
`;

export const InserterButtonColumnBefore = styled( Inserter )`
	left: -10px;
	top: -24px;
`;

export const InserterButtonColumnAfter = styled( Inserter )`
	right: -10px;
	top: -24px;
`;
