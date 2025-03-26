/* globals newspackStoryBudget */
import { __ } from '@wordpress/i18n';
import { apiFetch } from '@wordpress/data-controls';
import { resolveSelect } from '@wordpress/data';

const { apiNamespace } = newspackStoryBudget;

export function* initializeEntitiesConfig() {
	yield resolveSelect( 'core' ).canUser( 'update', {
		kind: 'postType',
		name: 'post',
	} );
}

export function setSearching() {
	return {
		type: 'SEARCH_START',
	};
}

function refreshAbortController( controller ) {
	if ( controller ) {
		controller.abort();
	}
	return typeof AbortController === 'undefined'
		? undefined
		: new AbortController();
}

let searchAbortController = refreshAbortController();

export function* search( str ) {
	yield { type: 'SEARCH_START' };
	searchAbortController = refreshAbortController( searchAbortController );
	try {
		const result = yield apiFetch( {
			path: `${ apiNamespace }/stories/search`,
			data: { s: str },
			method: 'POST',
			signal: searchAbortController?.signal,
		} );
		return {
			type: 'SEARCH_SUCCESS',
			payload: {
				ids: result.story_ids,
			},
		};
	} catch ( error ) {
		if ( error.name === 'AbortError' ) {
			return;
		}
		return {
			type: 'SEARCH_ERROR',
			payload: error,
		};
	}
}

export function setView( args ) {
	return {
		type: 'VIEW_SET',
		payload: args,
	};
}

export function* fetchFields() {
	try {
		const result = yield apiFetch( { path: `${ apiNamespace }/fields` } );
		return {
			type: 'FIELDS_SET',
			payload: result,
		};
	} catch ( error ) {
		return {
			type: 'FIELDS_ERROR',
			payload: error,
		};
	}
}

export function* fetchBudgets() {
	try {
		const result = yield apiFetch( { path: `${ apiNamespace }/budgets` } );
		const { budgets, total } = result;
		while ( budgets.length < total ) {
			const next = yield apiFetch( {
				path: `${ apiNamespace }/budgets?offset=${ budgets.length }`,
			} );
			budgets.push( ...next.budgets );
		}
		return {
			type: 'BUDGETS_SET',
			payload: budgets,
		};
	} catch ( error ) {
		return {
			type: 'BUDGETS_ERROR',
			payload: error,
		};
	}
}

export function* fetchStories() {
	yield { type: 'FETCH_START' };
	try {
		const result = yield apiFetch( { path: `${ apiNamespace }/stories` } );
		const { stories, total } = result;
		yield {
			type: 'FETCH_PROGRESS',
			payload: { result, progress: stories.length / total },
		};
		while ( stories.length < total ) {
			const next = yield apiFetch( {
				path: `${ apiNamespace }/stories?offset=${ stories.length }`,
			} );
			stories.push( ...next.stories );
			yield {
				type: 'FETCH_PROGRESS',
				payload: { result: next, progress: stories.length / total },
			};
		}
		return {
			type: 'STORIES_SET',
			payload: stories,
		};
	} catch ( error ) {
		return {
			type: 'STORIES_ERROR',
			payload: error,
		};
	}
}

export function* fetchStory( id ) {
	yield { type: 'FETCH_STORY_START', payload: id };
	try {
		const result = yield apiFetch( {
			path: `${ apiNamespace }/stories/${ id }`,
		} );
		yield { type: 'FETCH_STORY_SUCCESS', payload: id };
		return {
			type: 'STORIES_ADD',
			payload: result,
		};
	} catch ( error ) {
		yield { type: 'FETCH_STORY_ERROR', payload: id };
		return {
			type: 'STORIES_ERROR',
			payload: error,
		};
	}
}

export function* saveStory( id, story ) {
	yield { type: 'SAVE_STORY_START', payload: { id, story } };
	try {
		const result = yield apiFetch( {
			path: `${ apiNamespace }/stories/${ id }`,
			method: 'POST',
			data: story,
		} );
		return {
			type: 'SAVE_STORY_SUCCESS',
			payload: result,
		};
	} catch ( error ) {
		const message = error?.message || __( 'Error saving story.', 'newspack-story-budget' );
		return { type: 'SAVE_STORY_ERROR', payload: { id, story, message } };
	}
}

export function* saveStoryField( id, slug, value ) {
	yield { type: 'SAVE_STORY_FIELD_START', payload: { id, slug, value } };
	try {
		const result = yield apiFetch( {
			path: `${ apiNamespace }/stories/${ id }/${ slug }`,
			method: 'POST',
			data: { value },
		} );
		yield { type: 'STORIES_ADD', payload: result };
		return {
			type: 'SAVE_STORY_FIELD_SUCCESS',
			payload: { id, slug, value: result[ slug ] },
		};
	} catch ( error ) {
		const message = error?.message || __( 'Error saving field.', 'newspack-story-budget' );
		return { type: 'SAVE_STORY_FIELD_ERROR', payload: { id, slug, value, message } };
	}
}
