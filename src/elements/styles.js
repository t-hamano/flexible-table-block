/**
 * External dependencies
 */
import styled from '@emotion/styled';
import { Button } from '@wordpress/components';

// Row & Column inserter button.
const Inserter = styled( Button )`
	&.components-button.has-icon {
		position: absolute;
		width: 18px;
		min-width: 0;
		height: 18px;
		background: transparent;
		padding: 0;
		border-radius: 50%;
		color: transparent;

		&::before {
			position: absolute;
			top: 6px;
			left: 6px;
			width: 6px;
			height: 6px;
			padding: 0;
			background: #eaeaea;
			border-radius: 50%;
			content: '';
		}

		&:hover,
		&:focus {
			background: var( --wp-admin-theme-color );
			color: #fff;

			&::before {
				content: none;
			}

			&:active {
				color: #fff;
			}
		}
	}
`;

export const ButtonRowBeforeInserter = styled( Inserter )`
	left: -44px;
	top: ${ ( props ) => ( props.hasPrevSection ? '3px' : '-9px' ) };
`;

export const ButtonRowAfterInserter = styled( Inserter )`
	left: -44px;
	bottom: ${ ( props ) => ( props.hasNextSection ? '3px' : '-9px' ) };
`;

export const ButtonColumnBeforeInserter = styled( Inserter )`
	left: -10px;
	top: -44px;
`;

export const ButtonColumnAfterInserter = styled( Inserter )`
	right: -10px;
	top: -44px;
`;

// Row & Column select button.
const Selector = styled( Button )`
	background: #eaeaea;

	&.components-button.has-icon {
		position: absolute;
		min-width: 0;
		padding: 0;
		justify-content: center;

		&.has-text {
			justify-content: center;

			svg {
				margin-right: 0;
			}
		}
	}
`;

export const ButtonRowSelector = styled( Selector )`
	left: -20px;
	border-radius: 2px 0 0 2px;
	width: 18px;
	height: calc( 100% - 2px );
	top: 1px;
`;

export const ButtonColumnSelector = styled( Selector )`
	left: 1px;
	border-radius: 2px 2px 0 0;
	height: 18px;
	width: calc( 100% - 2px );
	top: -20px;
`;

export const ButtonDeleter = styled( Button )`
	&.components-button {
		height: 36px;
		padding: 0;
		justify-content: center;

		&.has-text {
			justify-content: center;
		}
		svg {
			margin-right: 0;
		}
	}
`;
