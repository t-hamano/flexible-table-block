/**
 * WordPress dependencies
 */
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );

const configs = Array.isArray( defaultConfig ) ? defaultConfig : [ defaultConfig ];

module.exports = configs.map( ( config ) => ( {
	...config,
	plugins: config.plugins.map( ( plugin ) =>
		plugin.constructor.name === 'DependencyExtractionWebpackPlugin'
			? new DependencyExtractionWebpackPlugin( {
					// Bundle @wordpress/theme instead of externalizing it.
					// TODO: Remove once DependencyExtractionWebpackPlugin bundles
					// the @wordpress/theme package by default.
					requestToExternal: ( request ) => ( request === '@wordpress/theme' ? null : undefined ),
			  } )
			: plugin
	),
} ) );
