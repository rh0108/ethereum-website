const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
    entry: ['@babel/polyfill', './src/index.js'],
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.js$/,
                include: /^[^node_modules]+(src|test)/,
                use: 'eslint-loader',
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    cacheDirectory: true,
                    rootMode: 'upward',
                },
            },
        ],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        library: 'aztec',
        libraryTarget: 'umd',
    },
    performance: {
        hints: 'warning',
        maxAssetSize: 200000,
        maxEntrypointSize: 400000,
    },
    plugins: [
        new CopyWebpackPlugin([
            {
                from: 'src/**/*.wasm',
                to: '[name].[ext]',
            },
        ]),
    ],
    resolve: {
        extensions: ['.js'],
    },
};
