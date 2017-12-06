let path = require('path');

module.exports = {
    entry: {
        xyz: './public/js/xyz_entry.js',
    },
    output: {
        filename: 'build/[name]_bundle.js',
        path: path.resolve(__dirname, 'public/js')
    },
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env'],
                        cacheDirectory: true
                    }
                }
            }
        ]
    }
};