/* eslint-env node */
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlMultiWebpackPlugin = require('html-webpack-multi-build-plugin');
const JSOutputFilePlugin = require('js-output-file-webpack-plugin');
const BabelEnvDepsPlugin = require('webpack-babel-env-deps');
const TerserPlugin = require('terser-webpack-plugin');
const gitRev = require('git-rev-sync');

const pkg = require('./package.json');

exports.devServer = ({host, port, publicPath} = {}) => ({
    devServer: {
        host, // Defaults to `localhost`
        port, // Defaults to 8080
        publicPath, // Defaults to `/`
        https: true,
        index: 'index.html',
        stats: 'errors-only',
        openPage: publicPath.replace(/^\//, ''),
        overlay: {errors: true},
        historyApiFallback: {
            rewrites: [
                {from: new RegExp(`^(?!${publicPath})`), to: publicPath + '404.html'},
                {from: /./, to: publicPath + `index.html`},
            ],
        },
    },
});

exports.devFlags = () => {
    return {
        plugins: [
            new webpack.DefinePlugin({
                __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
                __DEBUG__: JSON.stringify(['true', '1'].includes(process.env.NODE_DEBUG)),
            }),
        ],
    };
};

exports.babel = ({env, transpileDeps} = {}) => ({
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: [transpileDeps ? BabelEnvDepsPlugin.exclude() : /node_modules/],
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
        filename: 'css/[name]-[contenthash].css',
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

exports.html = ({title, favicon, template = 'index.html.ejs', meta = {}, ...rest} = {}) => ({
    plugins: [
        new HtmlWebpackPlugin({
            title,
            favicon,
            meta,
            template,
            inject: false,
            ...rest,
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
                __VERSION__: JSON.stringify(pkg.version),
                __COMMITHASH__: JSON.stringify(gitSha.substring(0, 8)),
                __BRANCH__: JSON.stringify(gitBranch),
            }),
        ],
    };
};

exports.svgr = () => {
    return {
        module: {
            rules: [
                {
                    test: /\.svg$/,
                    use: ['@svgr/webpack'],
                },
            ],
        },
    };
};

exports.jsOutputFile = ({sourceFile, contextPath, outputFileName, ...rest} = {}) => {
    return {
        plugins: [new JSOutputFilePlugin({sourceFile, contextPath, outputFileName, ...rest})],
    };
};

exports.minifyJs = () => {
    return {
        optimization: {
            minimize: true,
            minimizer: [
                new TerserPlugin({sourceMap: true, terserOptions: {ecma: 8, safari10: true}}),
            ],
        },
    };
};

exports.minifyJsLegacy = () => {
    return {
        optimization: {
            minimize: true,
            minimizer: [new TerserPlugin({sourceMap: true})],
        },
    };
};
