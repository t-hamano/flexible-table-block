/**
 * External dependencies
 */
import type { Property } from 'csstype';

/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { createReduxStore, register } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { STORE_NAME, REST_API_ROUTE } from './constants';

export interface ApiResponse {
	// Mirrors the `status` prop of `@wordpress/components` Notice, whose type is
	// not exposed through the package's `exports` map.
	status?: 'warning' | 'success' | 'error' | 'info';
	message?: string;
	options?: StoreOptions;
	block_css?: string;
}

export interface StoreOptions {
	show_label_on_section: boolean;
	show_control_button: boolean;
	focus_control_button: boolean;
	show_dot_on_th: boolean;
	tab_move: boolean;
	merge_content: boolean;
	show_global_setting: boolean;
	breakpoint: number;
	block_style: {
		table_width?: string;
		table_max_width?: string;
		row_odd_color?: string;
		row_even_color?: string;
		table_border_collapse?: string;
		cell_text_color_th?: string;
		cell_text_color_td?: string;
		cell_background_color_th?: string;
		cell_background_color_td?: string;
		cell_padding?: {
			top?: Property.PaddingTop;
			right?: Property.PaddingRight;
			bottom?: Property.PaddingBottom;
			left?: Property.PaddingLeft;
		};
		cell_border_width?: string;
		cell_border_style?: string;
		cell_border_color?: string;
		cell_text_align?: string;
		cell_vertical_align?: string;
	};
}

type State = {
	options: StoreOptions | Record< string, never >;
};

type SetOptionsAction = {
	type: 'SET_OPTIONS';
	options: StoreOptions;
};

const DEFAULT_STATE: State = {
	options: {},
};

const actions = {
	setOptions( options: StoreOptions ): SetOptionsAction {
		return {
			type: 'SET_OPTIONS',
			options,
		};
	},
};

const reducer = ( state: State = DEFAULT_STATE, action: SetOptionsAction ): State => {
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
	getOptions( state: State ): StoreOptions {
		return state.options as StoreOptions;
	},
};

const resolvers = {
	getOptions:
		() =>
		async ( { dispatch }: { dispatch: { setOptions: typeof actions.setOptions } } ) => {
			const options = await apiFetch< StoreOptions >( { path: REST_API_ROUTE } );
			dispatch.setOptions( options );
		},
};

export const store = createReduxStore( STORE_NAME, {
	reducer,
	selectors,
	resolvers,
	actions,
} );

register( store );
