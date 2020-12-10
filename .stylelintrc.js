module.exports = {
	extends: [
		'stylelint-config-rational-order',
		'stylelint-config-wordpress/scss',
	],
  ignoreFiles: [
		'node_modules/**/*.css',
		'build/**/*.css',
		'src/**/*.js'
  ],
	rules: {
		'no-descending-specificity': null,
		'font-weight-notation': null,
		'font-family-no-missing-generic-family-keyword': null,
		'selector-class-pattern': null,
		'at-rule-empty-line-before': null,
	}
}
