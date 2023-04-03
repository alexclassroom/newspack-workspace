<?php
/**
 * Class TestLogoCustomization
 *
 * @package Newspack_Multibranded_Site
 */

use Newspack_Multibranded_Site\Taxonomy;
use Newspack_Multibranded_Site\Meta\Menus;

/**
 * Test the Menus filter.
 */
class TestMenusCustomization extends WP_UnitTestCase {

	/**
	 * Tests get current brand and determine current brand methods
	 */
	public function test_filter_menus() {
		$term_without_custom_menus = $this->factory->term->create_and_get( [ 'taxonomy' => Taxonomy::SLUG ] );
		$term_with_custom_menus    = $this->factory->term->create_and_get( [ 'taxonomy' => Taxonomy::SLUG ] );

		set_theme_mod( 'nav_menu_locations', [ 'primary' => 999 ] );

		add_term_meta(
			$term_with_custom_menus->term_id,
			Menus::get_key(),
			[
				[
					'location' => 'primary',
					'menu'     => 123,
				],
			]
		);

		Taxonomy::set_primary( $term_without_custom_menus );
		$logos = get_theme_mod( 'nav_menu_locations' );
		$this->assertSame( 999, $logos['primary'] );

		Taxonomy::set_primary( $term_with_custom_menus );
		$this->go_to( '/' ); // Resets the current brand.
		$logos = get_theme_mod( 'nav_menu_locations' );
		$this->assertSame( 123, $logos['primary'] );
	}
}
