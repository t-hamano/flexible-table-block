<?php
/**
 * Plugin Name: Flexible Table Block
 * Description: A block that allows you to create flexible configuration tables.
 * Version: 2.0.0
 * Author: Tetsuaki Hamano
 * Author URI: https://github.com/t-hamano
 * License: GPL2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: flexible-table-block
 * @package flexible-table-block
 * @author Tetsuaki Hamano
 * @license GPL-2.0+
 */

defined( 'ABSPATH' ) || exit;

$ftb_data = get_file_data( __FILE__, array( 'TextDomain' => 'Text Domain' ) );

define( 'FTB_NAMESPACE', $ftb_data['TextDomain'] );
define( 'FTB_PATH', untrailingslashit( plugin_dir_path( __FILE__ ) ) );
define( 'FTB_URL', untrailingslashit( plugin_dir_url( __FILE__ ) ) );

function flexible_table_block_register_block() {
	$asset_file = include( FTB_PATH . '/build/index.asset.php' );

	wp_register_style(
		FTB_NAMESPACE . '-editor',
		FTB_URL . '/build/index.css',
		array(),
		filemtime( FTB_PATH . '/build/index.css' ),
	);

	wp_register_style(
		FTB_NAMESPACE,
		FTB_URL . '/build/style-index.css',
		array(),
		filemtime( FTB_PATH . '/build/style-index.css' ),
	);

	wp_register_script(
		FTB_NAMESPACE,
		FTB_URL . '/build/index.js',
		$asset_file['dependencies'],
		$asset_file['version']
	);

	register_block_type(
		__DIR__ . '/src',
		array(
			'editor_script' => FTB_NAMESPACE,
			'editor_style'  => FTB_NAMESPACE . '-editor',
			'style'         => FTB_NAMESPACE,
		)
	);
}
add_action( 'init', 'flexible_table_block_register_block' );
