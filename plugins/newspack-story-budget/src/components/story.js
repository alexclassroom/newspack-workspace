/* eslint @wordpress/no-unsafe-wp-apis: 0 */
/**
 * External dependencies.
 */
import { __ } from '@wordpress/i18n';

/**
 * WordPress dependencies.
 */
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Spinner,
	Button,
} from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';

/**
 * Internal dependencies.
 */
import { NAMESPACE as storeNamespace } from '../store/constants';
import StoryFieldPanel from './story-field-panel';

export default ( { storyId, onCancel } ) => {
	const { fields, story, isLoadingStory, canEdit } = useSelect( select => ( {
		fields: select( storeNamespace ).getFields(),
		story: select( storeNamespace ).getStory( storyId ),
		isLoadingStory: select( storeNamespace ).isLoadingStory( storyId ),
		canEdit: select( 'core' ).canUser( 'update', {
			kind: 'postType',
			name: 'post',
			id: storyId,
		} ),
	} ) );
	const { saveStory } = useDispatch( storeNamespace );
	const [ editedStory, setEditedStory ] = useState( story );
	const [ isIframeLoading, setIsIframeLoading ] = useState( true );
	if ( ! story ) {
		if ( isLoadingStory ) {
			return (
				<VStack
					expanded
					style={ { height: '100%' } }
					alignment="center"
					justify="center"
				>
					<HStack expanded alignment="center" justify="center">
						<Spinner />
					</HStack>
				</VStack>
			);
		}
		return null;
	}
	return (
		<HStack
			alignment="stretch"
			spacing="0"
			className="newspack-story-budget__story"
		>
			<VStack style={ { flexGrow: 1, position: 'relative' } }>
				{ isIframeLoading && (
					<VStack
						style={ {
							position: 'absolute',
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							background: '#fff',
							zIndex: 2,
						} }
						alignment="center"
						justify="center"
					>
						<Spinner />
					</VStack>
				) }
				<iframe
					title={ story.title }
					src={ story.metadata.preview_url }
					style={ {
						width: '100%',
						height: '100%',
						minHeight: '500px',
					} }
					onLoad={ () => setIsIframeLoading( false ) }
				/>
			</VStack>
			<VStack justify="top" className="newspack-story-budget__sidebar">
				<div
					style={ {
						flexGrow: 1,
						justifyContent: 'flex-start',
						overflow: 'auto',
						padding: '16px',
					} }
				>
					<StoryFieldPanel
						fields={ fields }
						story={ story }
						onChange={ setEditedStory }
					/>
				</div>
				{ ( canEdit || onCancel ) && (
					<HStack
						expanded
						direction="row-reverse"
						justify="end"
						style={ { padding: '16px', boxSizing: 'border-box' } }
					>
						{ canEdit && (
							<Button
								variant="primary"
								disabled={ isLoadingStory }
								onClick={ () =>
									saveStory( storyId, editedStory )
								}
							>
								{ __( 'Save', 'newspack-story-budget' ) }
							</Button>
						) }
						<Button
							variant="secondary"
							disabled={ isLoadingStory }
							onClick={ onCancel }
						>
							{ canEdit
								? __( 'Cancel', 'newspack-story-budget' )
								: __( 'Close', 'newspack-story-budget' ) }
						</Button>
						{ isLoadingStory && <Spinner /> }
					</HStack>
				) }
			</VStack>
		</HStack>
	);
};
