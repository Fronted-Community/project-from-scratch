const path = require("path");

module.exports = {
  entry: "./src/index", // 配置入口文件
  output: {
    filename: "[name].js", // 配置输出文件的名称
    path: path.join(__dirname, "./dist"), // 配置输出文件的路径
  },
 // module 配置模块加载规则，例如针对什么类型的资源需要使用哪些 Loader 进行处理
 //  module: {
 //    rules: [{
 //      test: /\.less$/i,
 //      include: {
 //        and: [path.join(__dirname, './src/')]
 //      },
 //      use: [
 //        "style-loader",
 //        "css-loader",
 //        {
 //          loader: "less-loader",
 //        },
 //      ],
 //    }],
 //  },
};
