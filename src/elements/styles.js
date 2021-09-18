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
	margin-top: ${ ( props ) => ( props.hasPrevSection ? '-18px' : '-28px' ) };
`;

export const InserterButtonRowAfter = styled( Inserter )`
	left: -24px;
	margin-top: ${ ( props ) => ( props.hasNextSection ? '24px' : '36px' ) };
`;

export const InserterButtonColumnBefore = styled( Inserter )`
	left: -9px;
	margin-top: -44px;
`;

export const InserterButtonColumnAfter = styled( Inserter )`
	right: -9px;
	margin-top: -44px;
`;
