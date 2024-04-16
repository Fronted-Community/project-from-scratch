##  配置其他资源

#### 1 配置 Babel

Babel 是一个开源 JavaScript 转编译器，它能将高版本 —— 如 ES6 代码等价转译为向后兼容，能直接在旧版 JavaScript 引擎运行的低版本代码，例如：
```js
// 使用 Babel 转译前
arr.map(item => item + 1)

// 转译后
arr.map(function (item){
  return item + 1;
})

```

示例中高版本的箭头函数语法经过 Babel 处理后被转译为低版本 `function` 语法，从而能在不支持箭头函数的 JavaScript 引擎中正确执行。借助 Babel 我们既可以始终使用最新版本 ECMAScript 语法编写 Web 应用，又能确保产物在各种环境下正常运行。

Webpack 场景下，只需使用 `babel-loader` 即可接入 Babel 转译功能：
1. 安装依赖
```bash
npm i -D @babel/core @babel/preset-env babel-loader
```

2. 添加模块处理规则
```js
// webpack.config.js
module.exports = {
  /* ... */
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader'],
      },
    ],
  },
};

```

示例中，`module` 属性用于声明模块处理规则，`module.rules` 子属性则用于定义针对什么类型的文件使用哪些 Loader 处理器，上例可解读为：

- `test: /\.js$/`：用于声明该规则的过滤条件，只有路径名命中该正则的文件才会应用这条规则，示例中的 `/\.js$/` 表示对所有 `.js` 后缀的文件生效
- `use`：用于声明这条规则的 Loader 处理器序列，所有命中该规则的文件都会被传入 Loader 序列做转译处理

```js
// src/index.js

const arr = [1, 2, 3, 4, 5];  
  
arr.map(item => item + 1)
```

运行 `npx webpack`

```js
// dist/main.js
[1,2,3,4,5].map((a=>a+1));
```
可以看到，打包后的文件并没有代替箭头函数

需要对 babel 进行配置，可以使用 `.babelrc` 文件或 `rule.options` 属性配置 Babel 功能逻辑
```js
// 预先安装 @babel/preset-env
// npm i -D @babel/preset-env
module.exports = {
  /* ... */
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'], // 是 Babel 的预设规则集
            },
          },
        ],
      },
    ],
  },
};

```

再次运行打包，可以看到打包后的文件中箭头函数被替代：
```js
// dist/main.js
[1,2,3,4,5].map((function(n){return n+1}));
```

#### 2 配置 ESLint 插件

ESLint 是 JavaScript 代码风格检查工具。JavaScript 是一种高度灵活的动态、弱类型脚本语言，因此 JavaScript 很难在编译过程发现语法、类型，或其它可能影响稳定性的错误，特别在多人协作的复杂项目下，语言本身的弱约束可能会开发效率与质量产生不小的影响，ESLint 的出现正是为了解决这一问题。

Webpack 下，可以使用 `eslint-webpack-plugin` 接入 ESLint 工具
1. 安装依赖
```shell
# 安装 eslint 
npm i -D eslint eslint-webpack-plugin

# 简单起见，这里直接使用 standard 规范
# npm i -D eslint-config-standard eslint-plugin-promise eslint-plugin-import eslint-plugin-node eslint-plugin-n
# 这些好像用不到？？eslint-plugin-promise eslint-plugin-node eslint-plugin-n
npm i -D eslint-config-standard eslint-plugin-import
npm i -D eslint-config-standard
```

2. 在项目根目录添加 `.eslintrc` 配置文件，内容：
```js
// .eslintrc
{
  "extends": "standard" //匹配安装的 eslint-config-standard 依赖
}
```
3. 添加 `webpack.config.js` 配置文件，补充 `eslint-webpack-plugin` 配置：
   Plugin 是**Webpack 中的扩展器**，在Webpack 运行的生命周期中会广播出许多钩子事件，Plugin 可以监听这些事件，并挂载自己的任务，也就是注册事件。 当Webpack 构建的时候，插件注册的事件就会随着钩子的触发而执行。
```js
// webpack.config.js
const path = require('path')
const ESLintPlugin = require('eslint-webpack-plugin')

module.exports = {
  ...
  // 添加 eslint-webpack-plugin 插件实例
  plugins: [new ESLintPlugin()]
}
```

4. 执行编译命令 `npx webpack`
```js
// src/index.js

const arr = [1, 2, 3, 4, 5];  
  
arr.map(item => item + 1)

let b=123

console.log(arr,b);
```

配置完毕后，就可以在 Webpack 编译过程实时看到代码风格错误提示：

```bash
➜  project-from-scratch git:(1-webpack-setput-ts) ✗ npx webpack
assets by status 80 bytes [cached] 1 asset
./src/index.js 109 bytes [built] [code generated]

WARNING in configuration
The 'mode' option has not been set, webpack will fallback to 'production' for this value.
Set 'mode' option to 'development' or 'production' to enable defaults for each environment.
You can also set it to 'none' to disable any default behavior. Learn more: https://webpack.js.org/configuration/mode/

ERROR in [eslint] 
/Users/yuysnsun/learn/project-from-scratch/src/index.js
  1:28  error  Extra semicolon                               semi
  4:5   error  'b' is never reassigned. Use 'const' instead  prefer-const
  4:6   error  Operator '=' must be spaced                   space-infix-ops
  6:16  error  A space is required after ','                 comma-spacing
  6:19  error  Extra semicolon                               semi

✖ 5 problems (5 errors, 0 warnings)
  5 errors and 0 warnings potentially fixable with the `--fix` option.


webpack 5.91.0 compiled with 1 error and 1 warning in 2631 ms

```

#### 3 配置 TypeScript

TypeScript 借鉴 C# 语言，在 JavaScript 基础上提供了一系列类型约束特性
TypeScript 的代码编译过程就能提前发现问题，而 JavaScript 环境下则需要到启动运行后才报错。这种类型检查特性虽然一定程度上损失了语言本身的灵活性，但能够让问题在编译阶段提前暴露，确保运行阶段的类型安全性，**特别适合用于构建多人协作的大型 JavaScript 项目**，也因此，时至今日 TypeScript 依然是一项应用广泛的 JavaScript 超集语言。

Webpack 有很多种接入 TypeScript 的方法，包括 `ts-loader`、`awesome-ts-loader`、 `babel-loader`。通常可使用 `ts-loader` 构建 TypeScript 代码：

1. 安装依赖
```shell
npm i -D typescript ts-loader
```

2. 配置 Webpack
```js
const path = require('path');

module.exports = {
  /* xxx */
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader'
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  }
};

```
- 使用 `module.rules` 声明对所有符合 `/\.ts$/` 正则 —— 即 `.ts` 结尾的文件应用 `ts-loader` 加载器
- 使用 `resolve.extensions` 声明自动解析 `.ts` 后缀文件，这意味着代码如 `import "./a.ts"` 可以忽略后缀声明，简化为 `import "./a"` 文件

3. 创建 `tsconfig.json` 配置文件，并补充 TypeScript 配置信息
```json
// tsconfig.json 
{ 
	"compilerOptions": { 
		"noImplicitAny": true,
		"moduleResolution": "node" 
	} 
}
```

项目中已经使用 `babel-loader`，也可以选择使用 [`@babel/preset-typescript`](https://link.juejin.cn/?target=https%3A%2F%2Fbabeljs.io%2Fdocs%2Fen%2Fbabel-preset-typescript "https://babeljs.io/docs/en/babel-preset-typescript") 规则集，借助 `babel-loader` 完成 JavaScript 与 TypeScript 的转码工作：
1. 安装依赖
```shell
 npm i -D @babel/preset-typescript
```

2. 配置 Webpack
```js
module.exports = {
  /* ... */
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-typescript'],
            },
          },
        ],
      },
    ],
  },
};
```

需要注意，`@babel/preset-typescript` 只是简单完成代码转换，并未做类似 `ts-loader` 的类型检查工作，大家需要根据实际场景选择适当工具。


