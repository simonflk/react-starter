/* eslint-env node */
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlMultiWebpackPlugin = require('html-webpack-multi-build-plugin');
const gitRev = require('git-rev-sync');

const pkg = require('./package.json');

exports.devServer = ({host, port} = {}) => ({
    devServer: {
        host, // Defaults to `localhost`
        port, // Defaults to 8080
        https: true,
        index: 'index.html',
        stats: 'errors-only',
        overlay: {errors: true},
        historyApiFallback: true,
    },
});

exports.babel = ({env} = {}) => ({
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {envName: env, cacheDirectory: true},
                },
            },
        ],
    },
});

const commonCSSLoaders = [
    {loader: 'css-loader', options: {sourceMap: true, modules: false}},
    {loader: 'postcss-loader', options: {plugins: () => [require('autoprefixer')]}},
];

exports.loadCSS = ({include, exclude} = {}) => ({
    module: {
        rules: [
            {
                test: /\.css$/,
                include,
                exclude,
                use: ['style-loader', ...commonCSSLoaders],
            },
        ],
    },
});

exports.extractedCSS = ({include, exclude} = {}) => {
    // Output extracted CSS to a file
    const plugin = new MiniCssExtractPlugin({
        filename: '[name]-[contenthash].css',
    });

    return {
        module: {
            rules: [
                {
                    test: /\.css$/,
                    include,
                    exclude,
                    use: [MiniCssExtractPlugin.loader, ...commonCSSLoaders],
                },
            ],
        },
        plugins: [plugin],
    };
};

exports.html = ({title, favicon, template = 'src/index.html.ejs', meta = {}} = {}) => ({
    plugins: [
        new HtmlWebpackPlugin({
            title,
            favicon,
            meta,
            template,
            inject: false,
        }),
        new HtmlMultiWebpackPlugin(),
    ],
});

exports.attachVersion = () => {
    const gitSha = process.env.TRAVIS_PULL_REQUEST_SHA || gitRev.long();
    const gitBranch =
        process.env.TRAVIS_PULL_REQUEST_BRANCH || process.env.TRAVIS_BRANCH || gitRev.branch();
    return {
        plugins: [
            new webpack.DefinePlugin({
                __VERSION__: `"${pkg.version}"`,
                __COMMITHASH__: `"${gitSha.substring(0, 8)}"`,
                __BRANCH__: `"${gitBranch}"`,
            }),
        ],
    };
};
