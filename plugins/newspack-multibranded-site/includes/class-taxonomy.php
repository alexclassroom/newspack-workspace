<?php
/**
 * Newspack Multi-branded site taxonomy.
 *
 * @package Newspack
 */

namespace Newspack_Multibranded_Site;

/**
 * Class to handle the brands taxonomy
 */
class Taxonomy {

	/**
	 * The taxonomy slug.
	 *
	 * @var string
	 */
	const SLUG = 'brand';

	/**
	 * The post types to which the taxonomy should be applied.
	 *
	 * @var array
	 */
	const POST_TYPES = array( 'post', 'page' );

	/**
	 * The meta key used to flag the primary brand.
	 *
	 * @var string
	 */
	const PRIMARY_META_KEY = '_primary_brand';


	/**
	 * Runs the initialization.
	 */
	public static function init() {
		add_action( 'init', array( __CLASS__, 'register_taxonomy' ) );
		add_action( 'add_term_meta', array( __CLASS__, 'reset_primary' ), 10, 2 );
	}

	/**
	 * Get the primary brand.
	 *
	 * @return ?WP_Term The primary term. If no term is set as primary, the first term will be returned. If no terms exist, null will be returned.
	 */
	public static function get_primary() {
		$params = array(
			'taxonomy'   => self::SLUG,
			'hide_empty' => false,
			'number'     => 1,
			'meta_query' => array(
				array(
					'key'         => self::PRIMARY_META_KEY,
					'compare_key' => 'EXISTS',
				),
			),
		);
		$terms  = get_terms( $params );
		if ( ! empty( $terms ) && $terms[0] instanceof \WP_Term ) {
			return $terms[0];
		}

		// if nothing was found, return the first term.
		$params = array(
			'taxonomy'   => self::SLUG,
			'hide_empty' => false,
			'number'     => 1,
			'orderby'    => 'term_id',
			'order'      => 'ASC',
		);
		$terms  = get_terms( $params );
		if ( ! empty( $terms ) && $terms[0] instanceof \WP_Term ) {
			return $terms[0];
		}
	}

	/**
	 * Sets the primary brand.
	 *
	 * @param int|WP_Term $term_or_term_id The term object or the term id.
	 * @return bool True if the term was set as primary, false otherwise.
	 */
	public static function set_primary( $term_or_term_id ) {
		$term = $term_or_term_id instanceof \WP_Term ? $term_or_term_id : get_term( $term_or_term_id );
		if ( ! $term instanceof \WP_Term || self::SLUG !== $term->taxonomy ) {
			return false;
		}
		return (bool) add_term_meta( $term->term_id, self::PRIMARY_META_KEY, true );
	}

	/**
	 * Registers the taxonomy
	 *
	 * @return void
	 */
	public static function register_taxonomy() {
		$labels = array(
			'name'              => _x( 'Brands', 'taxonomy general name', 'newspack-multibranded-site' ),
			'singular_name'     => _x( 'Brand', 'taxonomy singular name', 'newspack-multibranded-site' ),
			'search_items'      => __( 'Search Brands', 'newspack-multibranded-site' ),
			'all_items'         => __( 'All Brands', 'newspack-multibranded-site' ),
			'parent_item'       => __( 'Parent Brand', 'newspack-multibranded-site' ),
			'parent_item_colon' => __( 'Parent Brand:', 'newspack-multibranded-site' ),
			'edit_item'         => __( 'Edit Brand', 'newspack-multibranded-site' ),
			'update_item'       => __( 'Update Brand', 'newspack-multibranded-site' ),
			'add_new_item'      => __( 'Add New Brand', 'newspack-multibranded-site' ),
			'new_item_name'     => __( 'New Brand Name', 'newspack-multibranded-site' ),
			'menu_name'         => __( 'Brands', 'newspack-multibranded-site' ),
		);
		$params = array(
			'labels'             => $labels,
			'hierarchical'       => true, // True to have the checkbox UI instead of the tags UI.
			'publicly_queryable' => false,
			'show_in_nav_menus'  => true,
			'show_in_menu'       => false,
			'show_ui'            => true,
			'show_admin_column'  => true,
			'show_in_rest'       => true,
			'query_var'          => true,
			'rewrite'            => array( 'slug' => 'brand' ),
			'capabilities'       => array(
				'manage_terms' => 'manage_options',
				'edit_terms'   => 'manage_options',
				'delete_terms' => 'manage_options',
				'assign_terms' => 'edit_posts',
			),
		);
		register_taxonomy( self::SLUG, self::POST_TYPES, $params );
	}

	/**
	 * Hooked into the add_term_meta hook, will clear the primary brand meta key from all terms to make sure we only have one primary brand.
	 *
	 * @param int    $term_id The term ID.
	 * @param string $meta_key Metadata key.
	 * @return void
	 */
	public static function reset_primary( $term_id, $meta_key ) {
		if ( self::PRIMARY_META_KEY !== $meta_key ) {
			return;
		}
		global $wpdb;
		$wpdb->query( $wpdb->prepare( "DELETE FROM $wpdb->termmeta WHERE meta_key = %s", self::PRIMARY_META_KEY ) ); //phpcs:ignore
	}

}
