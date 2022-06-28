// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");

const isProduction = process.env.NODE_ENV == 'production';
const buildLang = process.env.BUILD_LANG || "en-us";

const localization = require(`./lang/${buildLang}.json`);

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
            templateParameters: {
                "loc": localization,
                "isProduction": isProduction
            }
        }),
        new webpack.ProvidePlugin({
            paper: 'paper',
            jQuery: 'jquery',
        }),
        new CopyPlugin({
            patterns: [
            //   { from: "css", to: "css" },
              { from: "assets", to: "assets" },
              { from: "manifest.json", to: "manifest.json" }
            ],
        }),

        // Add your plugins here
        // Learn more about plugins from https://webpack.js.org/configuration/plugins/
    ],
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/i,
                exclude: ['/node_modules/'],
                use: [
                    {
                        loader: 'string-replace-loader',
                        options: {
                            search: /%(\S+)%/g,
                            replace(_, p1) {return localization[p1] ?? p1;},
                        }
                    },
                    {
                        loader: 'ts-loader',
                    },
                ]
            },
            {
                test: /\.css$/i,
                use: [stylesHandler,'css-loader'],
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
                type: 'asset',
            },

            // Add your rules for custom modules here
            // Learn more about loaders from https://webpack.js.org/loaders/
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            Res: path.resolve(__dirname, "src/res"),
            Lang$: path.resolve(__dirname, `lang/${buildLang}.json`),
        }
    },
};

module.exports = () => {
    if (isProduction) {
        config.mode = 'production';
        config.plugins.push(new WorkboxWebpackPlugin.GenerateSW({
            maximumFileSizeToCacheInBytes: 6 * 1024 * 1024
        }));
    } else {
        config.mode = 'development';
        config.devtool = "eval-source-map";
    }
    return config;
};
