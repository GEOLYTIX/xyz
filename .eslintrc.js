module.exports = {
	env: {
		es6: true,
		browser: true,
		node: true,
	},
	extends: [],
	plugins: [
	],
	parserOptions: {
		ecmaVersion: 2017,
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true
		}
	},
	rules: {
		"indent": [
            "error",
            2
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-undef": "off",
        "no-console": "off"
	},
};