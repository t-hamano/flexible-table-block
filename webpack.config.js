const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );

module.exports = {
	...defaultConfig,
	performance: {
		maxEntrypointSize: 1000000,
		maxAssetSize: 1000000,
	},
	resolve: {
		...defaultConfig.resolve,
		extensions: [ '.ts', '.tsx', '.js' ],
	},
	module: {
		...defaultConfig.module,
		rules: defaultConfig.module.rules.map( ( rule ) => {
			if ( rule.test.toString() === /\.jsx?$/.toString() ) {
				return {
					...rule,
					test: /\.(js|jsx|ts|tsx)$/,
				};
			}
			return rule;
		} ),
	},
};
