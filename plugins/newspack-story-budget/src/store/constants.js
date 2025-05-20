export const NAMESPACE = 'newspack-story-budget';

export const INITIAL_STATE = {
	budgets: [],
	stories: {},
	search: {
		stories: [],
		budgets: []
	},
	fields: [],
	errors: {},
	meta: {
		loading: false,
		refreshing: false,
		searching: false,
		storyMetaFetchQueue: {},
		stories: {
			can_edit: false,
		},
		isCreatingStory: false,
		isCreatingBudget: false,
	},
	view: {
		type: 'table',
		search: '',
		page: 1,
		perPage: 10,
		fields: [],
		filters: [],
		sort: {
			field: 'last_modified',
			direction: 'desc',
		},
		layout: {
			density: 'compact',
		},
	},
	budgetsView: {
		search: '',
		page: 1,
		perPage: 10,
		filters: [],
	},
};

export const NOTICE_CONTEXT = 'newspack-story-budget';
