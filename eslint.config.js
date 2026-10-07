/**
 * WordPress dependencies
 */
const defaultConfig = require( '@wordpress/eslint-plugin' );

module.exports = [
	{
		ignores: [ '**/node_modules/**', '**/vendor/**', '**/build/**' ],
	},
	...defaultConfig.configs.recommended,
	{
		rules: {
			'import/no-extraneous-dependencies': 'off',
			'react/jsx-boolean-value': 'error',
			'react/jsx-curly-brace-presence': [ 'error', { props: 'never', children: 'never' } ],
			'@wordpress/dependency-group': 'error',
			'@wordpress/no-unsafe-wp-apis': 'off',
			'@wordpress/no-setting-ds-tokens': 'off',
			'@wordpress/no-unknown-ds-tokens': 'off',
			'@wordpress/i18n-text-domain': [
				'error',
				{
					allowedTextDomain: 'flexible-table-block',
				},
			],
			'prettier/prettier': [
				'error',
				{
					useTabs: true,
					tabWidth: 2,
					singleQuote: true,
					printWidth: 100,
					bracketSpacing: true,
					parenSpacing: true,
					bracketSameLine: false,
				},
			],
		},
	},
	...defaultConfig.configs[ 'test-unit' ].map( ( config ) => ( {
		...config,
		files: [ 'src/**/test/**/*.js', 'src/**/test/**/*.ts' ],
	} ) ),
	...defaultConfig.configs[ 'test-e2e' ].map( ( config ) => ( {
		...config,
		files: [ 'test/e2e/**/*.js', 'test/e2e/**/*.ts' ],
		settings: {
			...config.settings,
			// Jest is no longer installed, so eslint-plugin-jest cannot detect its version.
			jest: { version: 30 },
		},
		rules: {
			...config.rules,
			'jest/expect-expect': 'off',
			'react-hooks/rules-of-hooks': 'off',
		},
	} ) ),
];
