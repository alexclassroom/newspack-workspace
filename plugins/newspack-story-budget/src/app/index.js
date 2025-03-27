/* eslint @wordpress/no-unsafe-wp-apis: 0 */
/**
 * External dependencies.
 */
import { createRoot } from 'react-dom/client';
import {
	HashRouter,
	useLocation,
	useParams,
	Switch,
	Route,
	Redirect,
} from 'react-router-dom';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { Modal, Button, SlotFillProvider } from '@wordpress/components';

/**
 * Internal dependencies.
 */
import AppHeader, { AppHeaderActions } from '../components/app-header';
import { TabbedNavigation } from 'newspack-components';
import Stories from '../components/stories';
import Story from '../components/story';
import '../style.scss';

const ModalPage = ( { children, name, closeHref, ...props } ) => {
	const className = name
		? `newspack-story-budget__modal-page__${ name }`
		: '';
	return (
		<Modal
			onRequestClose={ () =>
				closeHref
					? ( window.location.href = closeHref )
					: window.history.back()
			}
			size="large"
			className={ `newspack-story-budget__modal-page ${ className }` }
			{ ...props }
		>
			{ children }
		</Modal>
	);
};

const StoryPage = () => {
	const { id } = useParams();
	return (
		<ModalPage name="story" size="fill" __experimentalHideHeader>
			<Story
				storyId={ id }
				onCancel={ () => ( window.location.hash = '' ) }
			/>
		</ModalPage>
	);
};

const StoryBudget = () => {
	const location = useLocation();

	const navigationItems = [
		{ label: __( 'Stories', 'newspack-story-budget' ), path: '/stories' },
		{ label: __( 'Budgets', 'newspack-story-budget' ), path: '/budgets' },
	];

	const currentNavItem = navigationItems.find(
		item => location.pathname.indexOf( item.path ) === 0
	);

	const headerText = `${ __( 'Story Budget', 'newspack-story-budget' ) } / ${
		currentNavItem?.label
	}`;

	return (
		<SlotFillProvider>
			<div className="wrap">
				<AppHeader headerText={ headerText } />
				<TabbedNavigation items={ navigationItems } />
				<div className="newspack-story-budget__content">
					<Switch>
						<Route path="/stories">
							<AppHeaderActions>
								<Button variant="primary" href="#/stories/new">
									{ __(
										'Add New Story',
										'newspack-story-budget'
									) }
								</Button>
							</AppHeaderActions>
							<Stories />
							<Switch>
								<Route path="/stories/new" exact>
									<ModalPage
										title={ __(
											'Add New Story',
											'newspack-story-budget'
										) }
										closeHref="#/stories"
									/>
								</Route>
								<Route path="/stories/:id">
									<StoryPage />
								</Route>
							</Switch>
						</Route>
						<Route path="/budgets">
							<AppHeaderActions>
								<Button variant="primary" href="#/budgets/new">
									{ __(
										'Add New Budget',
										'newspack-story-budget'
									) }
								</Button>
							</AppHeaderActions>
							<Switch>
								<Route path="/budgets/new">
									<ModalPage
										title={ __(
											'Add New Budget',
											'newspack-story-budget'
										) }
										closeHref="#/budgets"
									/>
								</Route>
							</Switch>
						</Route>
						<Redirect to="/stories" />
					</Switch>
				</div>
			</div>
		</SlotFillProvider>
	);
};

createRoot( document.getElementById( 'newspack-story-budget-app' ) ).render(
	<HashRouter>
		<StoryBudget />
	</HashRouter>
);
