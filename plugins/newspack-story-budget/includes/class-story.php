<?php
/**
 * Newspack Story Budget Story
 *
 * @package Newspack_Story_Budget
 */

namespace Newspack_Story_Budget;

use Newspack_Story_Budget\Fields;

/**
 * Story Class.
 */
class Story {
	/**
	 * Story ID.
	 *
	 * @var int
	 */
	public $id;

	/**
	 * Story post object.
	 *
	 * @var \WP_Post
	 */
	public $post;

	/**
	 * Constructor.
	 *
	 * @param int|\WP_Post $post Story ID or post object.
	 */
	public function __construct( $post ) {
		if ( $post instanceof \WP_Post ) {
			$this->id   = $post->ID;
			$this->post = $post;
		} else {
			$this->id   = $post;
			$this->post = get_post( $post );
		}
	}

	/**
	 * Whether it's a valid story.
	 *
	 * @return bool
	 */
	public function is_valid() {
		return ! empty( $this->id ) && ! empty( $this->post ) && ! is_wp_error( $this->post );
	}

	/**
	 * Get budget IDs assigned to this story.
	 *
	 * @return int[]
	 */
	public function get_budgets() {
		return \wp_get_post_terms( $this->id, Budgets::TAXONOMY, [ 'fields' => 'ids' ] );
	}

	/**
	 * Update budget IDs assigned to this story.
	 *
	 * @param int[] $budget_ids Budget IDs to assign to this story.
	 * @param bool  $append     Whether to append the new budget IDs to the existing ones or replace all existing IDs.
	 *
	 * @return bool True if updated successfully, otherwise false.
	 */
	public function update_budgets( $budget_ids = [], $append = false ) {
		return \wp_set_post_terms(
			$this->id,
			$budget_ids,
			\Newspack_Story_Budget\Budgets::TAXONOMY,
			$append
		);
	}

	/**
	 * Get story in array format.
	 *
	 * @return array
	 */
	public function to_array() {
		$all_fields = Fields::get_all_fields();
		$values    = [
			// `id` and `metadata are protected keys.
			'id'       => $this->id,

			// Static post info that doesn't need to be presented as fields.
			'metadata' => [
				'slug'        => \get_post_field( 'post_name', $this->post ),
				'preview_url' => \add_query_arg( 'newspack-story-preview', true, get_permalink( $this->id ) ),
			],
		];

		foreach ( $all_fields as $field ) {
			$values[ $field->get_slug() ] = $field->get_value( $this->id );
		}
		return $values;
	}
}
