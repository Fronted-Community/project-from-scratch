const path = require("path");
const ESLintPlugin = require('eslint-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  devServer: { hot: true, open: true },
  mode: 'development',
  entry: "./src/index", // 配置入口文件
  output: {
    filename: "[name].js", // 配置输出文件的名称
    path: path.join(__dirname, "./dist"), // 配置输出文件的路径
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-typescript', '@babel/preset-env'],
          },
        }],
      },
      {
        test: /\.ts$/,
        use: 'ts-loader'
      },
      {
        test: /\.(css|less)$/,
        use: [(process.env.NODE_ENV === 'development' ?
          'style-loader' :
          MiniCssExtractPlugin.loader),
          'css-loader',
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                // 添加 autoprefixer 插件
                plugins: [require("autoprefixer")],
              },
            },
          },
          'less-loader',
        ],
      },
      {
        test: /\.jsx$/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-env", "@babel/preset-react"],
        }
      },
      {
        test: /\.tsx$/,
        loader: 'babel-loader',
        options: {
          'presets': [
            "@babel/preset-env",
            "@babel/preset-react",
            '@babel/preset-typescript'
          ]
        }
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  plugins: [
    new ESLintPlugin(),
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "index.html"),
    }),
  ]
};
