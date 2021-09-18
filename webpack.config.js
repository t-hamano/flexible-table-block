const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );

defaultConfig.plugins.shift();

module.exports = {
	...defaultConfig,
	performance: {
		maxEntrypointSize: 1000000,
		maxAssetSize: 1000000,
	},
};
