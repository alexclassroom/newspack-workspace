import { INITIAL_STATE } from '../constants';

export const actions = {
	VIEW_SET: 'VIEW_SET',
	FIELDS_SET: 'FIELDS_SET',
};

export default ( state = INITIAL_STATE.view, action ) => {
	switch ( action.type ) {
		case actions.VIEW_SET:
			return action.payload;
		case actions.FIELDS_SET:
			if ( state.fields?.length ) {
				return state;
			}
			return {
				...state,
				fields: action.payload
					.filter( field => field.show_in_table )
					.map( field => field.slug ),
			};
		default:
			return state;
	}
};
