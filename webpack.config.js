const { resolve } = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (env = {}) => {
  const rootDir = resolve(__dirname);
  const isProduction = Boolean(env.production);
  const mode = isProduction ? 'production' : 'development';

  const plugins = [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(mode),
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
  ];

  if (isProduction) {
    plugins.push(new UglifyJsPlugin({
      uglifyOptions: {
        compress: { inline: false }, // https://github.com/mishoo/UglifyJS2/issues/2842
      },
    }));
  }

  return {
    mode,
    entry: {
      'dist/popup/index': ['babel-polyfill', './src/popup/index.jsx'],
      'dist/background': ['babel-polyfill', './src/background.js'],
      'dist/content/index': ['babel-polyfill', './src/content/index.js'],
      'dist/content/modal': ['./src/content/modal.scss', './src/content/modal'],
    },

    output: {
      path: rootDir,
      filename: '[name].js',
    },

    module: {
      rules: [
        {
          enforce: 'pre',
          test: /(\.js|\.jsx)$/,
          loader: 'eslint-loader',
          include: resolve(rootDir, 'src'),
          options: {
            failOnWarning: isProduction,
            failOnError: isProduction,
            cache: false,
          },
        },
        {
          test: /(\.js|\.jsx)$/,
          include: resolve(rootDir, 'src'),
          loader: 'babel-loader',
          options: { cacheDirectory: !isProduction },
        },
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'sass-loader',
          ]
        },
        {
          test: /\.handlebars$/,
          loader: 'handlebars-loader',
        }
      ],
    },

    resolve: {
      modules: [
        resolve(rootDir, 'src'),
        'node_modules',
      ],
    },

    performance: { hints: false },
    devtool: isProduction ? false : 'inline-source-map',
    context: rootDir,
    plugins,
  };
};
