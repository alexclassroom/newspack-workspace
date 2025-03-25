/* eslint @wordpress/no-unsafe-wp-apis: 0 */
/**
 * External dependencies.
 */
import debounce from 'lodash/debounce';

/**
 * WordPress dependencies.
 */
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { DataViews } from '@wordpress/dataviews/wp';
import {
	Icon,
	ProgressBar,
	Spinner,
	ToggleControl,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { seen, update, edit } from '@wordpress/icons';

/**
 * Internal dependencies.
 */
import { NAMESPACE as storeNamespace } from '../store/constants';
import StoryField from './story-field';

const TableRowField = ( { story, field, allowEdit = false } ) => {
	const { isLoadingStory, view } = useSelect( select => ( {
		isLoadingStory: select( storeNamespace ).isLoadingStory( story.id ),
		view: select( storeNamespace ).getView(),
	} ) );

	const fieldIdx = view.fields.findIndex( f => f === field.slug );

	return (
		<div className="newspack-story-budget__table-row-field">
			<StoryField
				fieldId={ field.slug }
				storyId={ story.id }
				allowEdit={ allowEdit }
				saveInPlace
			/>
			{ fieldIdx === 0 && isLoadingStory && (
				<Spinner
					style={ {
						width: '13px',
						height: '13px',
					} }
				/>
			) }
		</div>
	);
};

export default () => {
	const { view, stories, fields, isLoading, progress } = useSelect(
		select => ( {
			view: select( storeNamespace ).getView(),
			stories: select( storeNamespace ).getStories(),
			fields: select( storeNamespace ).getFields(),
			isLoading: select( storeNamespace ).isLoading(),
			progress: select( storeNamespace ).getProgress(),
		} )
	);
	const [ editMode, setEditMode ] = useState( false );

	const { setView, setSearching, search, fetchStory } =
		useDispatch( storeNamespace );

	const doSearch = debounce( search, 300 );

	useEffect( () => {
		if ( view.search ) {
			setSearching();
			doSearch( view.search );
		}
	}, [ view.search ] );

	if ( isLoading && progress < 1 ) {
		return (
			<div className="newspack-story-budget__loading">
				<ProgressBar value={ Math.ceil( progress * 100 ) } />
				<p>Fetching Stories...</p>
			</div>
		);
	}

	const dataViewFields = fields.map( field => ( {
		id: field.slug,
		label: field.name,
		isVisible: () => field.show_in_table,
		type: field.type,
		enableSorting: field.is_sortable,
		elements: field.options?.length ? field.options : undefined,
		filterBy: field.is_filterable
			? {
					operators: field.is_multiple
						? [ 'isAny', 'isNone', 'isAll', 'isNotAll' ]
						: [ 'isAny', 'isNone' ],
					isPrimary: field.slug === 'budgets',
			  }
			: undefined,
		render: value => (
			<TableRowField
				story={ value.item }
				field={ field }
				allowEdit={ editMode }
			/>
		),
	} ) );

	const actions = [
		{
			id: 'view',
			label: 'View',
			isPrimary: true,
			icon: <Icon icon={ seen } />,
			callback: items => {
				fetchStory( items[ 0 ].id );
				window.location.hash = '#/stories/' + items[ 0 ].id;
			},
		},
		{
			id: 'refresh',
			label: 'Refresh',
			isPrimary: false,
			icon: <Icon icon={ update } />,
			callback: items => {
				fetchStory( items[ 0 ].id );
			},
		},
		{
			id: 'edit',
			label: 'Edit Post',
			isPrimary: false,
			icon: <Icon icon={ edit } />,
			callback: () => {
				// @TODO Redirect to the edit post page.
			},
		},
	];

	return (
		<DataViews
			isLoading={ isLoading }
			fields={ dataViewFields }
			view={ view }
			onChangeView={ setView }
			actions={ actions }
			data={
				isLoading
					? []
					: stories.slice(
							( view.page - 1 ) * view.perPage,
							( view.page - 1 ) * view.perPage + view.perPage
					  )
			}
			paginationInfo={ {
				totalItems: stories.length,
				totalPages: Math.ceil( stories.length / view.perPage ),
			} }
			defaultLayouts={ {
				table: {
					showMedia: false,
				},
			} }
			header={
				<HStack spacing={ 4 } style={ { marginLeft: '12px' } }>
					<ToggleControl
						label="Edit mode"
						checked={ editMode }
						onChange={ setEditMode }
						__nextHasNoMarginBottom
					/>
				</HStack>
			}
		/>
	);
};
