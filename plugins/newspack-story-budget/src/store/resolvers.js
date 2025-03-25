export const getFields =
	() =>
	async ( { dispatch } ) => {
		await dispatch.fetchFields();
	};

export const getField =
	slug =>
	async ( { dispatch, select } ) => {
		if ( select.hasField( slug ) ) {
			return;
		}
		await dispatch.fetchFields();
	};

export const getBudgets =
	() =>
	async ( { dispatch } ) => {
		await dispatch.fetchBudgets();
	};

export const getStories =
	() =>
	async ( { dispatch } ) => {
		await dispatch.fetchStories();
	};

export const getStory =
	id =>
	async ( { dispatch, select } ) => {
		if ( select.hasFetchedStory( id ) ) {
			return;
		}
		await dispatch.fetchStory( id );
	};
