/* eslint-env node */
const path = require('path');
const merge = require('webpack-merge');

const parts = require('./webpack.parts');

const port = process.env.PORT || '9000';

const commonConfig = merge(
    {
        mode: 'development',
        devtool: 'eval-source-map',
        entry: {
            main: sourcePath('index.js'),
        },
        output: {
            filename: '[name].js',
            path: distPath(),
            publicPath: '/',
        },
    },
    parts.babel({env: 'modern'}),
    parts.html({title: 'My application!'}),
    parts.attachVersion(),
);

const legacyConfig = merge(
    {
        entry: {
            legacy: ['core-js/stable', 'regenerator-runtime/runtime', sourcePath('index.js')],
        },
    },
    parts.babel({env: 'legacy'}),
);

const developmentConfig = merge(parts.devServer({port}), parts.loadCSS());

const productionConfig = merge(
    {
        mode: 'production',
        devtool: 'source-maps',
        output: {
            filename: '[name]-[chunkhash].js',
        },
        optimization: {
            splitChunks: {
                chunks: 'initial',
            },
        },
    },
    parts.extractedCSS(),
);

module.exports = (env = {}) => {
    process.env.NODE_ENV = process.env.NODE_ENV || env.production ? 'production' : 'development';

    // Custom merger to explicitly pick (and not merge) legacy `entry`
    const mergeLegacy = merge({
        customizeObject(prev, next, key) {
            if (key === 'entry') {
                return next;
            }
        },
    });

    const main = merge(commonConfig, env.production ? productionConfig : developmentConfig);
    const legacy = mergeLegacy(main, legacyConfig);

    // Return 2 webpack configs
    return [main, legacy];
};

function sourcePath(...pathParts) {
    return path.resolve(__dirname, 'src', ...pathParts);
}

function distPath(...pathParts) {
    return path.resolve(__dirname, 'dist', ...pathParts);
}
