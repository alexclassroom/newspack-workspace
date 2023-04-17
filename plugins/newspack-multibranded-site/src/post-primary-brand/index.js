/* global newspackPostPrimaryBrandVars */

import { __, _n, _x } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { Button, CheckboxControl, Flex, FlexItem, SelectControl } from '@wordpress/components';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';
import { registerPlugin } from '@wordpress/plugins';
import { useDispatch, useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { decodeEntities } from '@wordpress/html-entities';

/**
 * Module Constants
 */
const DEFAULT_QUERY = {
	per_page: -1,
	orderby: 'name',
	order: 'asc',
	_fields: 'id,name,parent',
	context: 'view',
};

const EMPTY_ARRAY = [];

const ADMIN_URL = newspackPostPrimaryBrandVars.adminURL;

const TAXONOMY_SLUG = newspackPostPrimaryBrandVars.taxonomySlug;

const META_KEY = newspackPostPrimaryBrandVars.metaKey;

/**
 * The Brands panel. Mostly copied from core/editor/components/post-taxonomies/hierarchical-term-selector.js
 */
const NewspackPostPrimaryBrand = () => {
	const slug = TAXONOMY_SLUG;

	const { editPost } = useDispatch( 'core/editor' );

	const [ currentPrimaryBrand, setCurrentPrimaryBrand ] = useState( null );

	const { terms, availableTerms, taxonomy } = useSelect(
		select => {
			const { getCurrentPost, getEditedPostAttribute } = select( 'core/editor' );
			const { getTaxonomy, getEntityRecords } = select( coreStore );
			const _taxonomy = getTaxonomy( slug );
			const post = getCurrentPost();

			setCurrentPrimaryBrand( post.meta[ META_KEY ] );

			return {
				terms: _taxonomy ? getEditedPostAttribute( _taxonomy.rest_base ) : EMPTY_ARRAY,
				availableTerms: getEntityRecords( 'taxonomy', slug, DEFAULT_QUERY ) || EMPTY_ARRAY,
				taxonomy: _taxonomy,
			};
		},
		[ slug ]
	);

	const getTermSelectOptionFromId = id => {
		const term = availableTerms.find( term => term.id === id );
		return term ? { value: term.id, label: term.name } : null;
	};

	/**
	 * Update terms for post.
	 *
	 * @param {number[]} termIds Term ids.
	 */
	const onUpdateTerms = termIds => {
		editPost( { [ taxonomy.rest_base ]: termIds } );
	};

	/**
	 * Handler for checking term.
	 *
	 * @param {number} termId
	 */
	const onChange = termId => {
		const hasTerm = terms.includes( termId );
		const newTerms = hasTerm ? terms.filter( id => id !== termId ) : [ ...terms, termId ];
		onUpdateTerms( newTerms );
	};

	const onChangePrimaryBrand = termId => {
		editPost( { meta: { [ META_KEY ]: termId } } );
		setCurrentPrimaryBrand( termId );
	};

	return (
		<PluginDocumentSettingPanel
			name="newspack-multibranded-site-post-brands"
			title={ __( 'Brands', 'newspack-multibranded-site' ) }
		>
			<Flex direction="column" gap="4">
				<div
					className="editor-post-taxonomies__hierarchical-terms-list"
					tabIndex="0"
					role="group"
					aria-label={ __( 'Brands', 'newspack-multibranded-site' ) }
				>
					{ availableTerms.map( term => {
						return (
							<div key={ term.id } className="editor-post-taxonomies__hierarchical-terms-choice">
								<CheckboxControl
									__nextHasNoMarginBottom
									checked={ terms.indexOf( term.id ) !== -1 }
									onChange={ () => {
										const termId = parseInt( term.id, 10 );
										onChange( termId );
									} }
									label={ decodeEntities( term.name ) }
								/>
							</div>
						);
					} ) }

					{ terms.length > 1 && (
						<SelectControl
							label={ __( 'Primary brand', 'newspack-multibranded-site' ) }
							value={ currentPrimaryBrand || 0 }
							options={ [
								{
									label: __( 'None', 'newspack-multibranded-site' ),
									value: 0,
								},
								...terms.map( term => getTermSelectOptionFromId( term ) ).filter( term => term ),
							] }
							onChange={ onChangePrimaryBrand }
						/>
					) }
				</div>

				<FlexItem>
					<Button href={ ADMIN_URL } variant="link" target="blank">
						{ __( 'Manage Brands', 'newspack-multibranded-site' ) }
					</Button>
				</FlexItem>
			</Flex>
		</PluginDocumentSettingPanel>
	);
};

registerPlugin( 'newspack-multibranded-site-post-brands', {
	render: NewspackPostPrimaryBrand,
	icon: null,
} );
