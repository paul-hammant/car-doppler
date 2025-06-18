// webpack.config.js (minimal for Cypress component testing)
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  mode: 'development',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: path.resolve(__dirname, 'cypress/tsconfig.json'),
            transpileOnly: true, // Add this option
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      // Add other loaders if your components import other asset types (svg, png, etc.)
    ],
  },
  plugins: [
    // This plugin might not be strictly necessary if Cypress handles the index.html via component-index.html
    // new HtmlWebpackPlugin({
    //   template: './cypress/support/component-index.html',
    // }),
  ],
};
