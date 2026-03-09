const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  // Load environment variables
  require('dotenv').config();

  return {
    entry: {
      main: {
        import: './src/index.js',
        library: {
          name: 'ChatbotWidget',
          type: 'umd',
        },
      },
      admin: './src/admin/index.js',
      mastercontrol: './src/mastercontrol/index.js',
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: (pathData) => {
        if (pathData.chunk.name === 'main') {
          return isProduction ? 'chatbot-widget.min.js' : 'chatbot-widget.js';
        }
        return isProduction ? '[name].min.js' : '[name].js';
      },
      clean: true,
      globalObject: 'this',
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
            },
          },
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(png|jpe?g|gif|svg|webp)$/i,
          type: 'asset/inline',
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        filename: 'index.html',
        chunks: ['main'],
      }),
      new HtmlWebpackPlugin({
        template: './public/admin.html',
        filename: 'admin.html',
        chunks: ['admin'],
      }),
      new HtmlWebpackPlugin({
        template: './public/mastercontrol.html',
        filename: 'mastercontrol.html',
        chunks: ['mastercontrol'],
      }),
      // Define environment variables
      new webpack.DefinePlugin({
        'process.env.REACT_APP_API_BASE_URL':   JSON.stringify(process.env.REACT_APP_API_BASE_URL),
        'process.env.REACT_APP_TYPEBOT_ID':     JSON.stringify(process.env.REACT_APP_TYPEBOT_ID),
        'process.env.REACT_APP_BEARER_TOKEN':   JSON.stringify(process.env.REACT_APP_BEARER_TOKEN),
        'process.env.REACT_APP_ADMIN_API_URL':  JSON.stringify(process.env.REACT_APP_ADMIN_API_URL),
        'process.env.REACT_APP_WIDGET_URL':     JSON.stringify(process.env.REACT_APP_WIDGET_URL),
        'process.env.NODE_ENV': JSON.stringify(argv.mode || 'development'),
      }),
    ],
    resolve: {
      extensions: ['.js', '.jsx'],
    },
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist'),
      },
      compress: true,
      port: process.env.REACT_APP_DEV_PORT || 4000,
      open: true,
      hot: true,
    },
  };
};