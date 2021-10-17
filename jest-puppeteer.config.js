const config = require( '@wordpress/scripts/config/puppeteer.config' );

module.exports = {
	...config,
	launch: {
		...config.launch,
		slowMo: parseInt( process.env.PUPPETEER_SLOWMO, 10 ) || 50,
	},
};
