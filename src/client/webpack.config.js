const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const webComponentsJsPath = path.resolve(__dirname, '../../node_modules/@webcomponents/webcomponentsjs');
const srcPath = __dirname;
const outputPath = path.resolve(__dirname, '../../out/public');

module.exports = exports = {
  mode: 'none',
  entry: {
    index: path.resolve(srcPath, './index.ts')
  },
  output: {
    path: outputPath,
    filename: '[name].bundle.js',
    chunkFilename: '[name].bundle.js'
  },
  module: {
    rules: [{
      test: /\.ts$/,
      use: [{
        loader: 'ts-loader',
        options: {
          onlyCompileBundledFiles: true,
          configFile: path.resolve(__dirname, './tsconfig.json')
        }
      }]
    }]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  devtool: 'source-map',
  plugins: [
    new CleanWebpackPlugin(outputPath, {
      allowExternal: true
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(srcPath, './index.ejs'),
      filename: path.resolve(outputPath, './index.html'),
      inject: false
    }),
    new CopyWebpackPlugin([{
      from: path.resolve(webComponentsJsPath, './webcomponents-loader.js'),
      to: outputPath,
      flatten: true
    }, {
      from: path.resolve(webComponentsJsPath, './bundles/webcomponents-*.js'),
      to: path.resolve(outputPath, './bundles'),
      flatten: true
    }])
  ]
};
