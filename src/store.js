/**
 * WordPress dependencies
 */

import apiFetch from '@wordpress/api-fetch';
import { registerStore } from '@wordpress/data';

const DEFAULT_STATE = {
	options: {},
};
const STORE_NAME = 'flexible-table-block';

const actions = {
	getOptions( path ) {
		return {
			type: 'GET_OPTIONS',
			path,
		};
	},
	setOptions( options ) {
		return {
			type: 'SET_OPTIONS',
			options,
		};
	},
};

const reducer = ( state = DEFAULT_STATE, action ) => {
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
	getOptions( state ) {
		const { options } = state;
		return options;
	},
};

const controls = {
	GET_OPTIONS( action ) {
		return apiFetch( { path: action.path } );
	},
};

const resolvers = {
	*getOptions() {
		const options = yield actions.getOptions( '/flexible-table-block/v1/get_options/' );
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
