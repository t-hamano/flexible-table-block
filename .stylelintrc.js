module.exports = {
	extends: [
		"@wordpress/stylelint-config/scss",
		"stylelint-config-rational-order"
	],
  ignoreFiles: [
		"build/**/*.css",
		"node_modules/**/*.css",
		"vendor/**/*.css",
		"**/*.js",
		"**/*.ts",
		"**/*.tsx",
  ],
	rules: {
		"no-descending-specificity": null,
		"font-weight-notation": null,
		"selector-class-pattern": null,
	}
}
