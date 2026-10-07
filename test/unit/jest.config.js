module.exports = {
	rootDir: '../../',
	preset: '@wordpress/jest-preset-default',
	transform: {
		'\\.[jt]sx?$': [ 'babel-jest', { presets: [ '@wordpress/babel-preset-default' ] } ],
	},
	testPathIgnorePatterns: [ '<rootDir>/test/e2e', '/node_modules/' ],
};
