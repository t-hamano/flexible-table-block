<?php
/**
 * Plugin Name: Flexible Table Block
 * Description: Easily create flexible configuration tables.
 * Requires at least: 7.1
 * Requires PHP: 8.2
 * Version: 3.9.0
 * Author: Aki Hamano
 * Author URI: https://github.com/t-hamano
 * License: GPL2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: flexible-table-block
 *
 * @package Flexible_Table_Block
 * @author Aki Hamano
 * @license GPL-2.0+
 */

defined( 'ABSPATH' ) || exit;

define( 'FTB_BLOCK_CLASS', 'wp-block-flexible-table-block-table' );
define( 'FTB_NAMESPACE', 'flexible-table-block' );
define( 'FTB_PATH', untrailingslashit( plugin_dir_path( __FILE__ ) ) );

require_once __DIR__ . '/classes/class-helper.php';
require_once __DIR__ . '/classes/class-settings.php';
require_once __DIR__ . '/classes/class-enqueue.php';
require_once __DIR__ . '/classes/class-api.php';

new Flexible_Table_Block\Enqueue();
new Flexible_Table_Block\Api();
