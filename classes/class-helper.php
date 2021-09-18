<?php
/**
 * @package flexible-table-block
 * @author Tetsuaki Hamano
 * @license GPL-2.0+
 */

namespace flexible_table_block;

class Helper {

	/**
	 * Get common css.
	 *
	 * @return string
	 */
	public static function get_common_css( $breakpoint ) {
		$css .= <<<EOM
		@media screen and (max-width:{$breakpoint}px) {
			.wp-block-flexible-table-block-table.is-sticky-header thead th {
				position: sticky;
				top: 0;
				z-index: 1;
			}
		}
		EOM;

		return $css;
	}

	/**
	 * Minify CSS.
	 *
	 * @return string
	 */
	public static function minify_css( $css ) {
		// Minify CSS.
		$css = str_replace( array( "\n", "\t" ), '', $css );
		$css = str_replace( '  ', ' ', $css );
		$css = str_replace( ' {', '{', $css );
		$css = str_replace( '{ ', '{', $css );
		$css = str_replace( ' }', '}', $css );
		$css = str_replace( '} ', '}', $css );
		$css = str_replace( ', ', ',', $css );
		$css = str_replace( '; ', ';', $css );
		$css = str_replace( ': ', ':', $css );
		return $css;
	}
}
