const webpack = require('webpack');
const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    main: [path.resolve(`${__dirname}/_src/assets/js/main.js`)],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(`${__dirname}/_dist/assets/js/`),
  },
  plugins: [
    new webpack.ProvidePlugin({
      jQuery: 'jquery',
      $: 'jquery',
      jquery: 'jquery',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
    ],
  },
};
