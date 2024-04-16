## 配置 React

React 实现了 [JavaScript-XML](https://link.juejin.cn/?target=https%3A%2F%2Fzh-hans.reactjs.org%2Fdocs%2Fintroducing-jsx.html "https://zh-hans.reactjs.org/docs/introducing-jsx.html")(JSX) 技术，以支持在 JavaScript 中编写 Template 代码。为支持这一特性，我们需要搭建一套使用的工程化环境，将 JSX 及 React 组件转换为能够在浏览器上运行的 JavaScript 代码。使用 Webpack 搭建 React 应用开发环境包括：
- 如何使用 `Babel` 处理JSX文件？
- 如何使用 `html-webpack-plugin`、`webpack-dev-server` 运行 React 应用？
- 如何在 React 中复用 TypeScript、Less 等编译工具？

#### 1. 使用 Babel 加载 JSX 文件

在 Webpack 中可以借助 `babel-loader`，并使用 React 预设规则集 `@babel/preset-react` ，完成 JSX 到 JavaScript 的转换

1. 安装依赖

```shell
npm i react react-dom 
npm i -D webpack webpack-cli babel-loader @babel/core @babel/preset-react 
```

2. 修改 Webpack 配置，加入 `babel-loader` 相关声明：
```js
module.exports = {
  mode: 'none',
  module: {
    rules: [
      {
        test: /\.jsx$/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-env", "@babel/preset-react"],
        }
      },
    ],
  },
};
```

JSX 支持新旧两种转换模式，一是上图这种 `React.createElement` 函数，这种模式要求我们在代码中引入 React，如上图的 `import React from "react"`；二是自动帮我们注入运行时代码，此时需要设置 `runtime:automatic`，如：
```js
{
  test: /\.jsx$/,
  loader: 'babel-loader',
  options: {
    "presets": [
      ["@babel/preset-react", {
        "runtime": "automatic"
      }]
    ]
  }
}
```

这种模式会自动导入 `react/jsx-runtime`，不必开发者手动管理 React 依赖。

3. 启用 Babel 对JSX语法的支持
   将 `@babel/preset-react` 添加到Babel配置的 `presets` 部分。在 `.babelrc` 文件或者 `babel.config.js` 文件中添加如下配置：
```json
// `.babelrc`
{
  "presets": ["@babel/preset-env", "@babel/preset-react"]
}
```

```js
// `babel.config.js`
module.exports = {
  presets: ['@babel/preset-env', '@babel/preset-react']
};
```

4. 配置 ts 支持
   由于项目使用了 ts，我们需要安装 ts 相关的 react 依赖
```shell
# 如若不安装，会看到错误提示 
# TS7026: JSX element implicitly has type any because no interface JSX.IntrinsicElements exists.
npm install @types/react --save-dev

npm i -D typescript @babel/preset-typescript
```


更新配置：
```js
module.exports = {
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  module: {
    rules: [
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
  }
};
```

修改 `tsconfig.json` 文件，添加 `jsx` 配置属性
```json
{
  "compilerOptions": {
    //...
    "jsx": "react-jsx"
  }
}
```


#### 2. 运行页面

接入 `babel-loader` 使得 Webpack 能够正确理解、翻译 JSX 文件的内容，接下来我们还需要用 `html-webpack-plugin` 和 `webpack-dev-server` 让页面真正运行起来，配置如下：

1. 安装依赖
```shell
npm i -D html-webpack-plugin
npm i -D webpack-dev-server
```

`html-webpack-plugin`  用于生成入口 index.html 文件，其中包含 webpack bundler 生成的脚本

2. 更新配置：
```js
const HTMLWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    mode: 'development',
    devServer: { hot: true, open: true },
    ... ... 
    plugins: [
        new HTMLWebpackPlugin(
           template: path.join(__dirname, "src", "index.html"),
        )
    ]
}
```

如果没有 `index.html`文件

```js
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  module: {/*...*/},
  mode: 'development',
  devServer: { hot: true, open: true },
  plugins: [
    new HtmlWebpackPlugin({
      templateContent: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Webpack App</title>
  </head>
  <body>
    <div id="app" />
  </body>
</html>
    `
    })
  ]
};
```

运行 `npx webpack serve` 命令，即可自动打开带热更功能的页面
