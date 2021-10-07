const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );

module.exports = {
	...defaultConfig,
	performance: {
		maxEntrypointSize: 1000000,
		maxAssetSize: 1000000,
	},
};
