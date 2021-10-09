/**
 * External dependencies
 */
import styled from '@emotion/styled';

/**
 * WordPress dependencies
 */
import { Button } from '@wordpress/components';

const ButtonInserter = styled( Button )`
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

// eslint-disable-next-line no-unused-vars
export const ButtonRowBeforeInserter = styled( ( { hasPrevSection, ...props } ) => (
	<ButtonInserter { ...props } />
) )`
	left: -44px;
	top: ${ ( props ) => ( props.hasPrevSection ? '3px' : '-9px' ) };
`;

// eslint-disable-next-line no-unused-vars
export const ButtonRowAfterInserter = styled( ( { hasNextSection, ...props } ) => (
	<ButtonInserter { ...props } />
) )`
	left: -44px;
	bottom: ${ ( props ) => ( props.hasNextSection ? '3px' : '-9px' ) };
`;

export const ButtonColumnBeforeInserter = styled( ButtonInserter )`
	left: -10px;
	top: -44px;
`;

export const ButtonColumnAfterInserter = styled( ButtonInserter )`
	right: -10px;
	top: -44px;
`;

const ButtonSelector = styled( Button )`
	&.components-button.has-icon {
		min-width: 0;
		padding: 0;
		justify-content: center;
		background: #eaeaea;
		position: absolute;
		color: #1e1e1e;

		&.has-text {
			justify-content: center;

			svg {
				margin-right: 0;
			}
		}
	}
`;

export const ButtonRowSelector = styled( ButtonSelector )`
	&.components-button.has-icon {
		left: -20px;
		border-radius: 2px 0 0 2px;
		width: 18px;
		height: calc( 100% - 2px );
		top: 1px;
	}
`;

export const ButtonColumnSelector = styled( ButtonSelector )`
	&.components-button.has-icon {
		left: 1px;
		border-radius: 2px 2px 0 0;
		height: 18px;
		width: calc( 100% - 2px );
		top: -20px;
	}
`;

const ButtonDeleter = styled( Button )`
	&.components-button.has-icon {
		background: #fff;
		border: 1px solid #ccc;
		border-radius: 2px;
		box-shadow: 0 2px 6px rgba( 0, 0, 0, 0.05 );
		position: absolute;
		z-index: 1;
		min-width: 0;
		padding: 0;
		width: 30px;
		height: 30px;
	}
`;

export const ButtonRowDeleter = styled( ButtonDeleter )`
	&.components-button.has-icon {
		left: -55px;
		top: -15px;
	}
`;

export const ButtonColumnDeleter = styled( ButtonDeleter )`
	&.components-button.has-icon {
		left: 50%;
		margin-left: -15px;
		top: -55px;
	}
`;
