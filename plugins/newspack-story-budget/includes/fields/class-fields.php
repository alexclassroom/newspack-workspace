<?php
/**
 * Newspack Story Budget - class for handling fields.
 *
 * @package Newspack_Story_Budget
 */

namespace Newspack_Story_Budget;

use Newspack_Story_Budget\Fields\Abstract_Field;
use Newspack_Story_Budget\Fields\Editable_Field;
use Newspack_Story_Budget\Fields\Read_Only_Field;
use Newspack_Story_Budget\Fields\Statuses;

/**
 * Story budget fields.
 */
class Fields {
	/**
	 * Registered fields.
	 *
	 * @var array
	 */
	protected static $all_fields = [];

	/**
	 * Initializes default fields.
	 */
	public static function init() {
		\add_action( 'init', [ __CLASS__, 'register_fields' ] );
		\add_action( 'save_post', [ __CLASS__, 'on_post_update' ] );

		// Add custom columns for fields that should be displayed in the admin list table.
		\add_filter( 'manage_post_posts_columns', [ __CLASS__, 'wp_posts_columns' ] );
		\add_action( 'manage_post_posts_custom_column', [ __CLASS__, 'wp_posts_columns_values' ], 10, 2 );
	}

	/**
	 * Register fields.
	 */
	public static function register_fields() {
		$default_fields_config = self::get_default_fields_config();

		/**
		 * Filters the story budget fields to register.
		 */
		$field_configs = apply_filters( 'newspack_story_budget_fields', array_merge( $default_fields_config, [] ) );

		foreach ( $field_configs as $field_config ) {
			if ( ! empty( $field_config['is_editable'] ) ) {
				$field = new Editable_Field( $field_config );
			} else {
				$field = new Read_Only_Field( $field_config );
			}

			if ( isset( self::$all_fields[ $field->get_slug() ] ) ) {
				Logger::error( sprintf( 'Field with slug %s already exists.', $field->get_slug() ) );
				continue;
			}

			// Don't register the field if creating it threw any errors.
			if ( $field->has_errors() ) {
				$field_errors = $field->get_errors();
				Logger::error( $field_errors->get_error_messages() );
				continue;
			}
			self::$all_fields[ $field->get_slug() ] = $field;
		}
	}

	/**
	 * Get config for default fields.
	 *
	 * @return array
	 */
	public static function get_default_fields_config() {
		return [

			// Core editable fields.
			[
				'description'            => __( 'The internal name for the story.', 'newspack-story-budget' ),
				'is_editable'            => true,
				'name'                   => __( 'Story Name', 'newspack-story-budget' ),
				'slug'                   => 'name',
				'type'                   => 'text',
				'show_in_wp_posts_table' => true,
				'is_searchable'          => true,
			],
			[
				'default_value' => function() {
					return 'writing';
				},
				'description'   => __( 'The current editorial status of the story.', 'newspack-story-budget' ),
				'is_editable'   => true,
				'is_filterable' => true,
				'name'          => __( 'Status', 'newspack-story-budget' ),
				'slug'          => 'status',
				'type'          => 'text',
				'options'       => Statuses::get_statuses_arrays(),
			],

			// Core Read-only fields.
			[
				'save_value_callback' => [ __CLASS__, 'get_word_count' ],
				'description'         => __( 'The word count of the story.', 'newspack-story-budget' ),
				'is_editable'         => false,
				'name'                => __( 'Length', 'newspack-story-budget' ),
				'slug'                => 'word-count',
				'type'                => 'number',
			],
			[
				'get_value_callback' => [ __CLASS__, 'get_publish_date' ],
				'description'        => __( 'The date the story was published online.', 'newspack-story-budget' ),
				'is_editable'        => false,
				'name'               => __( 'Publish date (online)', 'newspack-story-budget' ),
				'slug'               => 'publish-date-online',
				'type'               => 'number',
			],
		];
	}

	/**
	 * Get all registered fields.
	 */
	public static function get_all_fields() {
		return self::$all_fields;
	}

	/**
	 * Get a field by its slug.
	 *
	 * @param string $slug The slug for the field to get.
	 */
	public static function get_field( $slug ) {
		if ( ! isset( self::$all_fields[ $slug ] ) ) {
			return null;
		}
		return self::$all_fields[ $slug ];
	}

	/**
	 * Get a field by its post meta name.
	 *
	 * @param string $post_meta_name The post meta name for the field to get.
	 */
	public static function get_field_by_post_meta_name( $post_meta_name ) {
		$slug = str_replace( Abstract_Field::FIELD_PREFIX, '', $post_meta_name );
		return self::get_field( $slug );
	}

	/**
	 * Update stored field value of read-only fields when post is updated.
	 *
	 * @param int $post_id The post ID being updated.
	 */
	public static function on_post_update( $post_id ) {
		if ( ! in_array( \get_post_type( $post_id ), Budgets::get_post_types(), true ) ) {
			return;
		}
		$fields = self::get_all_fields();
		foreach ( $fields as $field ) {
			if ( $field->is_editable() || ! $field->get_save_value_callback() ) {
				continue;
			}
			$value = call_user_func( $field->get_save_value_callback(), $post_id );
			if ( ! empty( $value ) ) {
				\update_post_meta( $post_id, $field->get_post_meta_name(), $value );
			}
		}
	}

	/**
	 * Add custom columns to the post list table.
	 *
	 * @param array $columns The existing columns.
	 * @return array The modified columns.
	 */
	public static function wp_posts_columns( $columns ) {
		$fields = self::get_all_fields();
		foreach ( $fields as $field ) {
			if ( $field->show_in_wp_posts_table() ) {
				$columns[ $field->get_post_meta_name() ] = $field->get_name();
			}
		}
		return $columns;
	}

	/**
	 * Display the value of the custom columns in the post list table.
	 *
	 * @param string $column_name The name of the column.
	 * @param int    $post_id The post ID.
	 */
	public static function wp_posts_columns_values( $column_name, $post_id ) {
		$field = self::get_field_by_post_meta_name( $column_name );
		if ( ! $field ) {
			return;
		}
		$value = $field->get_value( $post_id );

		if ( ! empty( $value ) ) {
			echo esc_html( $value );
		}
	}

	/**
	 * Get the word count of the post's content.
	 *
	 * @param int $post_id The post ID.
	 *
	 * @return int The word count.
	 */
	public static function get_word_count( $post_id = null ) {
		if ( ! $post_id ) {
			$post_id = \get_the_ID();
		}
		$post = \get_post( $post_id );
		if ( ! $post ) {
			return 0;
		}
		return str_word_count( trim( \wp_strip_all_tags( $post->post_content ) ) );
	}

	/**
	 * Get the publish date of the post.
	 *
	 * @param int $post_id The post ID.
	 *
	 * @return string The post's online publish date, if any.
	 */
	public static function get_publish_date( $post_id = null ) {
		if ( ! $post_id ) {
			$post_id = \get_the_ID();
		}
		$post = \get_post( $post_id );
		if ( ! $post ) {
			return '';
		}
		return get_the_date( null, $post );
	}
}
