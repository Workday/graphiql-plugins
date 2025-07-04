const path = require('path');
const webpack = require('webpack');


const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.tsx',
  devtool: 'inline-source-map',
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, 'index.html'),
      chunks: 'all'
    }),
    // graphql-ws is optional in @graphiql/toolkit, webpack doesn't seem to respect that
    new webpack.IgnorePlugin({ resourceRegExp: /^graphql-ws$/u })
  ],
  experiments: {
    asyncWebAssembly: true,
    topLevelAwait: true
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.wasm$/i,
        type: 'webassembly/async'
      }
    ]
  },
  resolve: {
    // graphql can accidentally be imported in 2 ways if we don't have this
    // https://stackoverflow.com/a/52635917/6079700
    extensions: ['.tsx', '.ts', '.mjs', '.js']
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist'),
      watch: true
    },
    client: {
      overlay: {
        errors: true,
        warnings: false
      }
    }
  }
};
