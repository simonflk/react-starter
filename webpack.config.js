/* eslint-env node */
const path = require('path');
const merge = require('webpack-merge');

const parts = require('./webpack.parts');

const port = process.env.PORT || '9000';
const publicPath = process.env.PUBLIC_PATH || '/';

const baseConfig = merge(
    {
        mode: 'development',
        devtool: 'eval-source-map',
        context: path.join(__dirname, 'src'),
        entry: {
            main: './index.js',
        },
        output: {
            publicPath,
            path: distPath(),
            filename: 'js/[name].js',
        },
    },
    parts.svgr(),
    parts.html({title: 'My application!'}),
    parts.jsOutputFile({contextPath: __dirname, sourceFile: 'env.js', outputFileName: 'js/env.js'}),
    parts.attachVersion(),
);

const developmentConfig = merge(parts.devServer({port, publicPath}), parts.loadCSS());

const modernConfig = parts.babel({env: 'modern'});

const legacyConfig = merge(
    {
        entry: {
            legacy: ['core-js/stable', 'regenerator-runtime/runtime', './index.js'],
        },
    },
    parts.babel({env: 'legacy', transpileDeps: true}),
);

const productionConfig = merge(
    {
        mode: 'production',
        devtool: 'source-maps',
        output: {
            filename: 'js/[name]-[chunkhash].js',
        },
        optimization: {
            splitChunks: {
                chunks: 'initial',
            },
        },
    },
    parts.extractCSS(),
);

const modernProductionConfig = parts.minifyJs();

const legacyProductionConfig = parts.minifyJsLegacy();

module.exports = (env = {}) => {
    process.env.NODE_ENV = process.env.NODE_ENV || env.production ? 'production' : 'development';

    // Legacy entry should replace (not append)
    const mergeLegacy = merge.smartStrategy({entry: 'replace'});

    const main = merge.smart(
        baseConfig,
        modernConfig,
        parts.devFlags(),
        env.production ? merge(productionConfig, modernProductionConfig) : developmentConfig,
    );
    const legacy = mergeLegacy(
        baseConfig,
        legacyConfig,
        parts.devFlags(),
        env.production ? merge(productionConfig, legacyProductionConfig) : developmentConfig,
    );

    // Return 2 webpack configs
    return [main, legacy];
};

function distPath(...pathParts) {
    return path.resolve(__dirname, 'dist', ...pathParts);
}
