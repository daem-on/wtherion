// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");

const isProduction = process.env.NODE_ENV == 'production';
const buildLang = process.env.BUILD_LANG || "en-us";

// const localization = require(`./lang/${buildLang}.json`);
// for (let item in localization) {
//     localization[item] = JSON.stringify(localization[item]);
// }

const stylesHandler = 'style-loader';



const config = {
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
    },
    devServer: {
        open: false,
        host: 'localhost',
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'index.html',
        }),
        new webpack.ProvidePlugin({
            paper: 'paper',
            jQuery: 'jquery',
        }),
        new webpack.DefinePlugin({
            lang: require(`./lang/${buildLang}.json`)
        }),
        new CopyPlugin({
            patterns: [
              { from: "css", to: "css" },
              { from: "assets", to: "assets" },
            ],
        }),

        // Add your plugins here
        // Learn more about plugins from https://webpack.js.org/configuration/plugins/
    ],
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/i,
                loader: 'ts-loader',
                exclude: ['/node_modules/'],
            },
            {
                test: /\.css$/i,
                use: [stylesHandler,'css-loader'],
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
                type: 'asset',
            },
            {
                test: /\.paper\.js$/,
                loader: "paper-loader"
            },

            // Add your rules for custom modules here
            // Learn more about loaders from https://webpack.js.org/loaders/
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
};

module.exports = () => {
    if (isProduction) {
        config.mode = 'production';
        
        
        config.plugins.push(new WorkboxWebpackPlugin.GenerateSW());
        
    } else {
        config.mode = 'development';
        config.devtool = "eval-source-map";
    }
    return config;
};
