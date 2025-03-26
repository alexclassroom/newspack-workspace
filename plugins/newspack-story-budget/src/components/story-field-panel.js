/* eslint @wordpress/no-unsafe-wp-apis: 0 */
/**
 * WordPress dependencies.
 */
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';

/**
 * Internal dependencies.
 */
import { NAMESPACE as storeNamespace } from '../store/constants';
import StoryField from './story-field';

const StoryFieldPanelRow = ( { field, story, onChange } ) => {
	const popoverProps = {
		placement: 'left-start',
	};
	return (
		<HStack
			key={ field.slug }
			className="newspack-story-budget__field-row"
		>
			<Text>{ field.name }:</Text>
			<StoryField
				fieldId={ field.slug }
				storyId={ story.id }
				value={ story[ field.slug ] }
				onChange={ onChange }
				popoverProps={ popoverProps }
			/>
		</HStack>
	);
};

export default ( { story, onChange = () => {} } ) => {
	const fields = useSelect( select => select( storeNamespace ).getFields() );
	const [ editedStory, setEditedStory ] = useState( story );

	useEffect( () => {
		setEditedStory( story );
	}, [ story ] );

	return (
		<VStack>
			{ fields.map( field => (
				<StoryFieldPanelRow
					key={ field.slug }
					field={ field }
					story={ editedStory }
					onChange={ value => {
						const newEditedStory = {
							...editedStory,
							[ field.slug ]: value,
						};
						setEditedStory( newEditedStory );
						onChange( newEditedStory );
					} }
				/>
			) ) }
		</VStack>
	);
};
