module.exports = {
	extends: [
		'plugin:@wordpress/eslint-plugin/recommended',
		'plugin:@typescript-eslint/eslint-recommended',
	],
	plugins: [ '@typescript-eslint' ],
	parser: '@typescript-eslint/parser',
	rules: {
		'react/jsx-boolean-value': 'error',
		'react/jsx-curly-brace-presence': [ 'error', { props: 'never', children: 'never' } ],
		'@wordpress/dependency-group': 'error',
		'@wordpress/no-unsafe-wp-apis': 'off',
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
	overrides: [
		{
			files: [
				'**/test/**/*.ts',
				'**/test/**/*.js',
				'**/__tests__/**/*.ts',
				'**/__tests__/**/*.js',
				'**/*.spec.ts',
				'**/*.spec.js',
			],
			extends: [ 'plugin:@wordpress/eslint-plugin/test-unit' ],
			settings: {
				jest: {
					version: 26,
				},
			},
		},
		{
			files: [ 'test/e2e/**/*.js', 'test/e2e/**/*.ts' ],
			extends: [ 'plugin:@wordpress/eslint-plugin/test-e2e' ],
			rules: {
				'jest/expect-expect': 'off',
			},
		},
	],
};
