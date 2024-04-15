const path = require("path");
const ESLintPlugin = require('eslint-webpack-plugin')

module.exports = {
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
      }
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [new ESLintPlugin()]
};
