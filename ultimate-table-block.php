<?php
/**
 * Plugin Name: Ultimate Table Block
 * Description: A block that allows you to create flexible configuration tables..
 * Version: 1.0.0
 * Author: Tetsuaki Hamano
 * Author URI: https://github.com/t-hamano
 * License: GPL2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: ultimate-table-block
 * @package ultimate-table-block
 * @author Tetsuaki Hamano
 * @license GPL-2.0+
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

defined( 'ABSPATH' ) || exit;

$asset_file = include( plugin_dir_path( __FILE__ ) . 'build/index.asset.php' );

function ultimate_table_block_register_block() {

	if ( ! function_exists( 'register_block_type' ) ) {
		return;
	}

	$asset_file = include( plugin_dir_path( __FILE__ ) . 'build/index.asset.php' );

	//ブロック用スクリプト
	wp_register_script(
		'ultimate-table-block-script',
		plugins_url( 'build/index.js', __FILE__ ),
		$asset_file['dependencies'],
		$asset_file['version']
	);

	// フロントエンド用スタイル
	wp_register_style(
		'ultimate-table-block-style',
		plugins_url( 'build/style-index.css', __FILE__ ),
		array(),
		filemtime( plugin_dir_path( __FILE__ ) . 'build/style-index.css' )
	);

	//エディター用スタイル
	wp_register_style(
		'ultimate-table-block-editor',
		plugins_url( 'build/index.css', __FILE__ ),
		array(),
		filemtime( plugin_dir_path( __FILE__ ) . 'build/index.css' )
	);

	//ブロックタイプの登録
	register_block_type(
		'ultimate-table-block/table',
		array(
			'editor_script' => 'ultimate-table-block-script',
			'editor_style'  => 'ultimate-table-block-editor',
			'style'         => 'ultimate-table-block-style',
		)
	);
}
add_action( 'init', 'ultimate_table_block_register_block' );
