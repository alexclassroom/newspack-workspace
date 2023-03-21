<?php
/**
 * Class TestTaxonomy
 *
 * @package Newspack_Multibranded_Site
 */

use Newspack_Multibranded_Site\Taxonomy;

/**
 * Sample test case.
 */
class TestTaxonomy extends WP_UnitTestCase {

	/**
	 * A simple test to see if the taxonomy was registered.
	 */
	public function test_taxonomy_exists() {
		$this->assertTrue( taxonomy_exists( Taxonomy::SLUG ), 'The taxonomy is not registered' );
	}

	/**
	 * Test get primary.
	 */
	public function test_get_primary() {
		$term1 = $this->factory->term->create_and_get( array( 'taxonomy' => Taxonomy::SLUG ) );
		$term2 = $this->factory->term->create_and_get( array( 'taxonomy' => Taxonomy::SLUG ) );
		$term3 = $this->factory->term->create_and_get( array( 'taxonomy' => Taxonomy::SLUG ) );

		$primary = Taxonomy::get_primary();
		$this->assertSame( $term1->term_id, $primary->term_id, 'If no primary was set, should return the first' );

		add_term_meta( $term3->term_id, Taxonomy::PRIMARY_META_KEY, true );

		$primary = Taxonomy::get_primary();
		$this->assertSame( $term3->term_id, $primary->term_id );

		add_term_meta( $term2->term_id, Taxonomy::PRIMARY_META_KEY, true );

		$primary = Taxonomy::get_primary();
		$this->assertSame( $term2->term_id, $primary->term_id );
	}

	/**
	 * Test reset primary on setting a new primary.
	 */
	public function test_reset_primary_on_add() {
		$term1 = $this->factory->term->create_and_get( array( 'taxonomy' => Taxonomy::SLUG ) );
		$term2 = $this->factory->term->create_and_get( array( 'taxonomy' => Taxonomy::SLUG ) );
		$term3 = $this->factory->term->create_and_get( array( 'taxonomy' => Taxonomy::SLUG ) );

		global $wpdb;
		$query = $wpdb->prepare( "SELECT count(term_id) FROM $wpdb->termmeta WHERE meta_key = %s", Taxonomy::PRIMARY_META_KEY );

		// phpcs:disable
		$this->assertSame( 0, (int) $wpdb->get_var( $query ), 'No primary term should be set' );

		add_term_meta( $term1->term_id, Taxonomy::PRIMARY_META_KEY, true );
		$this->assertSame( 1, (int) $wpdb->get_var( $query ), 'One primary term should be set' );

		add_term_meta( $term2->term_id, Taxonomy::PRIMARY_META_KEY, true );
		$this->assertSame( 1, (int) $wpdb->get_var( $query ), 'One primary term should be set' );

		add_term_meta( $term3->term_id, Taxonomy::PRIMARY_META_KEY, true );
		$this->assertSame( 1, (int) $wpdb->get_var( $query ), 'One primary term should be set' );
		// phpcs:enable
	}

	/**
	 * Test set primary.
	 */
	public function test_set_primary() {
		$term1    = $this->factory->term->create_and_get( array( 'taxonomy' => Taxonomy::SLUG ) );
		$term2    = $this->factory->term->create_and_get( array( 'taxonomy' => Taxonomy::SLUG ) );
		$category = $this->factory->term->create_and_get( array( 'taxonomy' => 'category' ) );

		$this->assertTrue( Taxonomy::set_primary( $term1->term_id ), 'Should be able to set a primary term from term id' );
		$primary = Taxonomy::get_primary();
		$this->assertSame( $term1->term_id, $primary->term_id );

		$this->assertTrue( Taxonomy::set_primary( $term2 ), 'Should be able to set a primary term from an object' );
		$primary = Taxonomy::get_primary();
		$this->assertSame( $term2->term_id, $primary->term_id );

		$this->assertFalse( Taxonomy::set_primary( $category ), 'Should not be able to set a primary term from a category' );
		$primary = Taxonomy::get_primary();
		$this->assertSame( $term2->term_id, $primary->term_id );

		$this->assertFalse( Taxonomy::set_primary( array( 'asd' ) ), 'Should return false for invalid input' );
	}
}
