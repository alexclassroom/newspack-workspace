/* eslint @wordpress/no-unsafe-wp-apis: 0 */
/**
 * External dependencies.
 */
import { createRoot } from 'react-dom/client';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';

/**
 * WordPress dependencies.
 */
import {
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Button,
	Modal,
} from '@wordpress/components';

/**
 * Internal dependencies.
 */
import { registerStore } from '../store';
import Stories from '../components/stories';
import Story from '../components/story';
import './style.scss';

registerStore();

const Page = ( { children, name, ...props } ) => {
	const className = name ? `newspack-story-budget__page__${ name }` : '';
	return (
		<Modal
			onRequestClose={ () => ( window.location.hash = '' ) }
			size="medium"
			className={ `newspack-story-budget__page ${ className }` }
			{ ...props }
		>
			{ children }
		</Modal>
	);
};

const StoryBudget = () => {
	return (
		<div className="wrap">
			<VStack spacing="4" className="newspack-story-budget__header">
				<HStack spacing="4">
					<Heading level={ 1 }>Story Budget</Heading>
					<HStack
						spacing="4"
						direction="row-reverse"
						expanded={ false }
					>
						<Button variant="primary" href="#/budgets">
							Manage Budgets
						</Button>
						<Button variant="secondary" href="#/budgets/new">
							Add New Budget
						</Button>
						<Button variant="secondary" href="#/budgets/add-story">
							Add New Story
						</Button>
					</HStack>
				</HStack>
				<Text color="#757575" isBlock>
					Manage your story budget.
				</Text>
			</VStack>
			<Stories />
			<Router>
				<Switch>
					<Route path="/budgets" exact>
						<Page title="Budgets" />
					</Route>
					<Route path="/budgets/new" exact>
						<Page title="Add Budget" />
					</Route>
					<Route path="/budgets/add-story" exact>
						<Page title="Add Story" />
					</Route>
					<Route path="/stories/:id" exact>
						<Page
							name="story"
							size="fill"
							__experimentalHideHeader={ true }
						>
							<Story
								onCancel={ () => ( window.location.hash = '' ) }
							/>
						</Page>
					</Route>
				</Switch>
			</Router>
		</div>
	);
};

createRoot( document.getElementById( 'newspack-story-budget-app' ) ).render(
	<StoryBudget />
);
