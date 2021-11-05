/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { registerStore } from '@wordpress/data';
/**
 * Internal dependencies
 */
import { STORE_NAME, REST_API_ROUTE } from './constants';

import type { StoreOptions } from './constants';
import type { AnyAction as Action } from 'redux';

const DEFAULT_STATE = {
	options: {},
};

const actions = {
	getOptions( path: string ) {
		return {
			type: 'GET_OPTIONS',
			path,
		};
	},
	setOptions( options: StoreOptions ) {
		return {
			type: 'SET_OPTIONS',
			options,
		};
	},
};

const reducer = ( state = DEFAULT_STATE, action: Action ) => {
	switch ( action.type ) {
		case 'SET_OPTIONS': {
			return {
				...state,
				options: action.options,
			};
		}
		default: {
			return state;
		}
	}
};

const selectors = {
	getOptions( state: { options: StoreOptions } ) {
		const { options } = state;
		return options;
	},
};

const controls = {
	GET_OPTIONS( action: Action ) {
		return apiFetch( { path: action.path } );
	},
};

const resolvers = {
	*getOptions() {
		const options: StoreOptions = yield actions.getOptions( REST_API_ROUTE );
		return actions.setOptions( options );
	},
};

registerStore( STORE_NAME, {
	reducer,
	controls,
	selectors,
	resolvers,
	actions,
} );

export { STORE_NAME };
