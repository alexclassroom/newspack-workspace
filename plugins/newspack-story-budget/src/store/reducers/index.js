import { combineReducers } from 'redux';

import budgets from './budgets';
import stories from './stories';
import fields from './fields';
import search from './search';
import meta from './meta';
import view from './view';
import errors from './errors';

import { STORAGE_KEYS } from '../constants';

import reducerActions from '../utils/reducer-actions';

const appReducer = combineReducers( {
	budgets,
	stories,
	fields,
	search,
	meta,
	view,
	errors,
} );

const reducer = ( state, action ) => {
	if ( action.type === 'HYDRATE' ) {
		return {
			...state,
			...action.payload,
		};
	}

	const newState = appReducer( state, action );

	for ( const key in STORAGE_KEYS ) {
		if ( reducerActions[ key ]?.[ action.type ] ) {
			sessionStorage.setItem(
				STORAGE_KEYS[ key ],
				JSON.stringify( newState[ key ] )
			);
		}
	}

	return newState;
};

export default reducer;
