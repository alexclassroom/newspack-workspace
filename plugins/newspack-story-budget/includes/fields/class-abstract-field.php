<?php
/**
 * Newspack Story Budget - abstract class for a story budget field.
 *
 * @package Newspack_Story_Budget
 */

namespace Newspack_Story_Budget\Fields;

use Newspack_Story_Budget\Budgets;

/**
 * Abstract class to represent a single story budget field.
 */
abstract class Abstract_Field {
	/**
	 * The prefix for all field names when getting or setting as post meta.
	 */
	const FIELD_PREFIX = '_np_story_budget_';

	/**
	 * Optional description for the field, if editable.
	 *
	 * @var mixed
	 */
	protected $description = null;

	/**
	 * Whether the field is editable or read-only.
	 *
	 * @var bool
	 */
	protected $is_editable = false;

	/**
	 * Whether the field can be used to filter stories.
	 *
	 * @var bool
	 */
	protected $is_filterable = false;

	/**
	 * If true, the field's value is an array of values.
	 *
	 * @var bool
	 */
	protected $is_multiple = false;

	/**
	 * Whether the field can be used to search stories.
	 *
	 * @var bool
	 */
	protected $is_searchable = false;

	/**
	 * The human-readable name of the field.
	 *
	 * @var string
	 */
	protected $name;

	/**
	 * Whether the field should be shown in the dynamic Budgets table.
	 *
	 * @var bool
	 */
	protected $show_in_dynamic_table = false;

	/**
	 * Whether the field should be shown in the WP post editor sidebar.
	 *
	 * @var bool
	 */
	protected $show_in_editor = false;

	/**
	 * Whether the field should be shown in the WP posts table.
	 *
	 * @var bool
	 */
	protected $show_in_wp_posts_table = false;

	/**
	 * The unique slug for the field.
	 *
	 * @var string
	 */
	protected $slug;

	/**
	 * The type of the field's data. One of: boolean, number, text, date
	 *
	 * @var string
	 */
	protected $type = 'text';

	/**
	 * Errors that occurred during field initialization.
	 *
	 * @var \WP_Error
	 */
	protected $errors = null;

	/**
	 * Object contructor.
	 *
	 * @param array $args {
	 *    Configuration for initializing a field.
	 *    @type string   $description?            Optional description of the field's purpose.
	 *    @type bool     $is_editable?            Whether the field is editable or read-only.
	 *    @type bool     $is_filterable?          Whether the field can be used to filter stories.
	 *    @type bool     $is_multiple?            If true, the field's value is an array of values.
	 *    @type bool     $is_searchable?          Whether the field can be used to search stories.
	 *    @type string   $name                    The human-readable name of the field.
	 *    @type string   $show_in_dynamic_table?  Whether the field should be shown in the dynamic Budgets table.
	 *    @type string   $show_in_editor?         Whether the field should be shown in the WP post editor sidebar.
	 *    @type string   $show_in_wp_posts_table? Whether the field should be shown in the WP posts table.
	 *    @type string   $slug?                   The unique slug ID for the field. If not given, will be generated from the name.
	 *    @type string   $type                    The type of the field's data.
	 * }
	 */
	public function __construct( $args ) {
		$this->errors = new \WP_Error();

		$this->name                   = \sanitize_text_field( $args['name'] );
		$this->description            = ! empty( $args['description'] ) ? \sanitize_text_field( $args['description'] ) : null;
		$this->slug                   = ! empty( $args['slug'] ) ? \sanitize_title( $args['slug'] ) : \sanitize_title( $this->name );
		$this->is_filterable          = ! empty( $args['is_filterable'] ) ? true : false;
		$this->is_multiple            = ! empty( $args['is_multiple'] ) ? true : false;
		$this->is_searchable          = ! empty( $args['is_searchable'] ) ? true : false;
		$this->show_in_dynamic_table  = ! empty( $args['show_in_dynamic_table'] ) ? true : false;
		$this->show_in_editor         = ! empty( $args['show_in_editor'] ) ? true : false;
		$this->show_in_wp_posts_table = ! empty( $args['show_in_wp_posts_table'] ) ? true : false;

		if ( ! empty( $args['type'] ) ) {
			$type = $this->set_type( $args['type'] );
			if ( \is_wp_error( $type ) ) {
				$this->errors->add( $type->get_error_code(), $type->get_error_message() );
			}
		}

		if ( 191 < strlen( $this->get_post_meta_name() ) ) {
			$this->errors->add(
				'newspack_story_budget_field_slug_too_long',
				sprintf(
					// Translators: the field slug.
					__( 'The field slug "%s" is too long. Please use a shorter slug.', 'newspack-story-budget' ),
					$this->slug
				)
			);
		}
	}

	/**
	 * Whether the field encountered any errors while being initialized.
	 *
	 * @return bool
	 */
	public function has_errors() {
		return $this->errors->has_errors();
	}

	/**
	 * Get any errors that occurred while initializing the field.
	 *
	 * @return WP_Error Field registration errors.
	 */
	public function get_errors() {
		return $this->errors;
	}

	/**
	 * Get the field's type.
	 *
	 * @return string The field's type.
	 */
	public function get_type() {
		return $this->type;
	}

	/**
	 * Sets the field's data type.
	 *
	 * @param string $type The field's type.
	 */
	protected function set_type( $type ) {
		/**
		 * Filters the allowed data types.
		 *
		 * @param string[] $allowed_types The allowed data types.
		 */
		$allowed_types = apply_filters( 'newspack_story_budget_field_data_types', [ 'boolean', 'number', 'text', 'date' ] );
		if ( ! in_array( $type, $allowed_types, true ) ) {
			return new \WP_Error(
				'newspack_story_budget_invalid_field_configuration',
				sprintf(
					// Translators: 1: Field type passed in configuration, 2: Allowed field types.
					__( 'Invalid field type "%1$s". Must be one of: %2$s', 'newspack-story-budget' ),
					$type,
					implode( ', ', $allowed_types )
				)
			);
		}
		$this->type = $type;
		return $this->type;
	}

	/**
	 * Get the field's name.
	 *
	 * @return string The field's name.
	 */
	public function get_name() {
		return $this->name;
	}

	/**
	 * Get the prefixed post meta field name.
	 *
	 * @return string The name of the post meta field.
	 */
	public function get_post_meta_name() {
		return self::FIELD_PREFIX . $this->get_slug();
	}

	/**
	 * Get the field's slug.
	 *
	 * @return string The field's slug.
	 */
	public function get_slug() {
		return $this->slug;
	}

	/**
	 * True if the field is editable, false if read-only.
	 *
	 * @return bool
	 */
	public function is_editable() {
		return $this->is_editable;
	}

	/**
	 * True if the field should be displayed in the wp posts table, false if not.
	 *
	 * @return bool
	 */
	public function show_in_wp_posts_table() {
		return $this->show_in_wp_posts_table;
	}

	/**
	 * True if the field should be searchable, false if not.
	 *
	 * @return bool
	 */
	public function is_searchable() {
		return $this->is_searchable;
	}

	/**
	 * Get the field's value.
	 *
	 * @param int $post_id The post ID to get the value for. If not passed, return the default value, if any.
	 *
	 * @return mixed The field's value.
	 */
	abstract public function get_value( $post_id );

	/**
	 * Update the value of the field stored as post meta.
	 *
	 * @param int   $post_id The post ID to update the value for.
	 * @param mixed $value The new value of the field.
	 *
	 * @return bool True if updated successfully, otherwise false.
	 */
	protected function add_stored_value( $post_id, $value ) {
		if ( ! in_array( \get_post_type( $post_id ), Budgets::get_post_types(), true ) ) {
			return false;
		}

		$updated = \add_post_meta( $post_id, $this->get_post_meta_name(), $value );
		if ( ! $updated ) {
			return false;
		}
		return true;
	}

	/**
	 * Update the value of the field stored as post meta.
	 *
	 * @param int   $post_id The post ID to update the value for.
	 * @param mixed $value The new value of the field.
	 *
	 * @return bool True if updated successfully, otherwise false.
	 */
	protected function update_stored_value( $post_id, $value ) {
		if ( ! in_array( \get_post_type( $post_id ), Budgets::get_post_types(), true ) ) {
			return false;
		}

		$updated = \update_post_meta( $post_id, $this->get_post_meta_name(), $value );
		if ( ! $updated ) {
			return false;
		}
		return true;
	}
}
