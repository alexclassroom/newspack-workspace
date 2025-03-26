/* eslint @wordpress/no-unsafe-wp-apis: 0 */
/**
 * WordPress dependencies.
 */
import { useSelect } from '@wordpress/data';
import {
	__experimentalInputControl as InputControl,
	__experimentalVStack as VStack,
	CheckboxControl,
	RadioControl,
	DatePicker,
	DateTimePicker,
	TextareaControl,
} from '@wordpress/components';

/**
 * Internal dependencies.
 */
import { NAMESPACE as storeNamespace } from '../store/constants';

export default ( { fieldId, value, onChange = () => {} } ) => {
	const { field } = useSelect( select => ( {
		field: select( storeNamespace ).getField( fieldId ),
	} ) );

	if ( ! field ) {
		return null;
	}

	const controlProps = {
		label: field.title,
		hideLabelFromVision: true,
		onChange: val => {
			if ( field.type === 'date' || field.type === 'datetime' ) {
				val = parseInt( new Date( val ).getTime() / 1000 );
			}
			if ( field.type === 'number' ) {
				val = val * 1;
			}
			onChange( val );
		},
	};

	if ( field.options?.length ) {
		if ( field.is_multiple ) {
			return (
				<VStack spacing={ 2 }>
					{ field.options.map( option => (
						<CheckboxControl
							key={ option.value }
							label={ option.label }
							checked={ value.includes( option.value ) }
							value={ value }
							onChange={ checked => {
								onChange(
									checked
										? [ ...value, option.value ]
										: value.filter(
												v => v !== option.value
										  )
								);
							} }
						/>
					) ) }
				</VStack>
			);
		}
		return (
			<RadioControl
				options={ field.options }
				hideLabelFromVision
				selected={ value }
				{ ...controlProps }
			/>
		);
	}

	if ( field.type === 'date' ) {
		return (
			<DatePicker
				currentDate={ new Date( value * 1000 ) }
				{ ...controlProps }
			/>
		);
	}

	if ( field.type === 'datetime' ) {
		return (
			<DateTimePicker
				currentDate={ new Date( value * 1000 ) }
				{ ...controlProps }
			/>
		);
	}

	if ( field.type === 'longtext' ) {
		return <TextareaControl value={ value } { ...controlProps } />;
	}

	if ( field.type === 'boolean' ) {
		return (
			<CheckboxControl
				checked={ value }
				label={ field.description || field.name }
				onChange={ onChange }
			/>
		);
	}

	if ( field.type === 'number' ) {
		controlProps.type = 'number';
	}

	return <InputControl value={ value } { ...controlProps } />;
};
