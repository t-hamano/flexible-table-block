/**
 * WordPress dependencies
 */
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );

/**
 * `@wordpress/ui` is bundled into this plugin (it ships `wpScript: false`), but
 * its dependency `@wordpress/theme` ships `wpScript: true`, so the default
 * dependency-extraction behavior externalizes it to `window.wp.theme`. That
 * global is not reliably registered/compatible across WordPress versions, which
 * makes `ThemeProvider` (used internally by `@wordpress/ui` overlays such as
 * Popover) resolve to `undefined` at runtime. Force-bundle it instead.
 *
 * Returning `null` (not `undefined`) skips the plugin's default cascade so the
 * request is treated as a regular module and bundled; returning `undefined`
 * keeps the default behavior for every other request.
 *
 * @param {string} request Module request being processed.
 * @return {null|undefined} `null` to bundle, `undefined` to use defaults.
 */
function requestToExternal( request ) {
	if ( request === '@wordpress/theme' ) {
		return null;
	}
	return undefined;
}

const configs = Array.isArray( defaultConfig ) ? defaultConfig : [ defaultConfig ];

module.exports = configs.map( ( config ) => ( {
	...config,
	plugins: config.plugins.map( ( plugin ) =>
		plugin.constructor.name === 'DependencyExtractionWebpackPlugin'
			? new DependencyExtractionWebpackPlugin( { requestToExternal } )
			: plugin
	),
} ) );
