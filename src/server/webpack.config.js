const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const srcPath = __dirname;
const outputPath = path.resolve(__dirname, '../../out');

module.exports = exports = {
  mode: 'none',
  entry: {
    server: path.resolve(srcPath, './server.ts')
  },
  output: {
    path: outputPath,
    filename: 'server.js'
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
  target: 'node',
  node: {
    __filename: false,
    __dirname: false
  },
  plugins: [
    new CleanWebpackPlugin(outputPath, { exclude: ['public'] })
  ]
};
