### 1 初始化项目
```shell
mkdir project-from-scratch
cd project-from-scratch
npm init -y
```
输出结果
```shell
➜  project-from-scratch npm init -y
Wrote to /Users/yuysnsun/learn/project-from-scratch/package.json:

{
  "name": "project-from-scratch",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

### 2 控制 node 版本
可以使用 nvm 控制 node 版本，特别是在多人协作过程中，可以让项目有一个稳定且统一的运行环境。

1. 使用 nvm 控制 node 版本

我们可以通过创建项目目录中的 .nvmrc 文件来指定要使用的 Node 版本。之后在项目目录中执行 nvm use 即可。.nvmrc 文件内容只需要遵守上文提到的语义化版本规则即可。另外还有个工具叫做 [avn](https://github.com/wbyoung/avn)，可以自动化这个过程。
https://stackoverflow.com/questions/57110542/how-to-write-a-nvmrc-file-which-automatically-change-node-version

```shell
node -v > .nvmrc
```

2. 使用 npm 控制 node 版本

通过在 `package.json` 中设置 `engines` 属性来指定版本范围。
```json
// 指定 node 版本的范围
{
  "engines": {
    "node": ">=14.19.1 <=17.9.0"
  }
}

// 指定为固定版本
{
  "engines": {
    "node": "~14.19.1"
  }
}
```
修改了 `engines` 配置后，使用 `yarn`和 `pnpm` 安装依赖，会在 node 版本不一致时报错，但是 `npm install` 并不会按照 `engines` 的属性来报错，这是因为在 `npm` 中设置了 `engine-strict` 的默认值为 false。
因此，我们需要创建 .npmrc 来显式的将 `engine-strict` 定义为 true：
```
# .npmrc
engine-strict=true
```

### 3 安装 webpack
https://webpack.js.org/guides/getting-started/#basic-setup
```shell
npm install webpack webpack-cli --save-dev
```


### 4 基础项目结构

需要修改 package json
```diff
# package.json 
 {
   "name": "webpack-demo",
   "version": "1.0.0",
   "description": "",
-  "main": "index.js", # primary entry point to your program
   "scripts": {
     "test": "echo \"Error: no test specified\" && exit 1"
   },
   "keywords": [],
   "author": "",
   "license": "MIT",
   "devDependencies": {
     "webpack": "^5.38.1",
     "webpack-cli": "^4.7.2"
   }
 }
```


项目结构
```
   
├── package.json
├── package-lock.json
├── src
|   └── index.js
└── webpack.config.js

```

**src/index.js**

```javascript
function component() {
  const element = document.createElement('div');

  // Lodash, currently included via a script, is required for this line to work
  element.innerHTML = _.join(['Hello', 'webpack'], ' ');

  return element;
}

document.body.appendChild(component());
```

此时我们可以进行打包：

```shell
➜  project-from-scratch npx webpack

asset main.js 116 bytes [emitted] [minimized] (name: main)
./src/index.js 174 bytes [built] [code generated]

WARNING in configuration
The 'mode' option has not been set, webpack will fallback to 'production' for this value.
Set 'mode' option to 'development' or 'production' to enable defaults for each environment.
You can also set it to 'none' to disable any default behavior. Learn more: https://webpack.js.org/configuration/mode/

webpack 5.91.0 compiled with 1 warning in 297 ms

```

webpack 默认将 src/index.js 作为入口文件，默认输出文件为 dist/main.js

```js
// dist/main.js
document.body.appendChild(function(){const e=document.createElement("div");return e.innerHTML="Hello Webpack",e}());
```

接下来，我们通过 Webpack 配置文件 `webpack.config.js` 进行开发环境配置:
```js
// webpack.config.js
const path = require("path");

module.exports = {
  entry: "./src/index", // 配置入口文件
  output: {
    filename: "[name].js", // 配置输出文件的名称
    path: path.join(__dirname, "./dist"), // 配置输出文件的路径
  }
};
```

至此，已经足够驱动一个最简单项目的编译工作。

webpack 的编译流程
- **输入**：从文件系统读入代码文件；
    -  `entry`：用于定义项目入口文件，Webpack 会从这些入口文件开始按图索骥找出所有项目文件；
    - `context`：项目执行上下文路径；
- **模块递归处理**：调用 Loader 转译 Module 内容，并将结果转换为 AST，从中分析出模块依赖关系，进一步递归调用模块处理过程，直到所有依赖文件都处理完毕；
    - `resolve`：用于配置模块路径解析规则，可用于帮助 Webpack 更精确、高效地找到指定模块
    - `module`：用于配置模块加载规则，例如针对什么类型的资源需要使用哪些 Loader 进行处理
    - `externals`：用于声明外部资源，Webpack 会直接忽略这部分资源，跳过这些资源的解析、打包操作
- **后处理**：所有模块递归处理完毕后开始执行后处理，包括模块合并、注入运行时、产物优化等，最终输出 Chunk 集合；
    - `optimization`：用于控制如何优化产物包体积，内置 Dead Code Elimination、Scope Hoisting、代码混淆、代码压缩等功能
    - `target`：用于配置编译产物的目标运行环境，支持 web、node、electron 等值，不同值最终产物会有所差异
    - `mode`：编译模式短语，支持 `development`、`production` 等值，可以理解为一种声明环境的短语
- **输出**：将 Chunk 写出到外部文件系统；
    - `output`：配置产物输出路径、名称等；


在前端项目中经常需要处理 JS 之外的其它资源，包括 css、ts、图片等，此时需要为这些资源配置适当的加载器。

```js
// webpack.config.js
const path = require("path");

module.exports = {
  entry: "./src/index",
  output: {
    filename: "[name].js",
    path: path.join(__dirname, "./dist"),
  },
  module: {  //配置模块加载规则，例如针对什么类型的资源需要使用哪些 Loader 进行处理
    rules: [{
      test: /\.less$/i, 
      include: {
        and: [path.join(__dirname, './src/')]
      },
      use: [
        "style-loader",
        "css-loader",
        {
          loader: "less-loader",
        },
      ],
    }],
  },
};
```
