## 配置 CSS & CSS 预处理器 & PostCSS
原生 Webpack 并不能识别 CSS 语法，假如不做额外配置直接导入 `.css` 文件，会导致编译失败。为此，在 Webpack 中处理 CSS 文件，通常需要用到：

- [`css-loader`](https://link.juejin.cn/?target=https%3A%2F%2Fwebpack.js.org%2Floaders%2Fcss-loader%2F "https://webpack.js.org/loaders/css-loader/")：该 Loader 会将 CSS 等价翻译为形如 `module.exports = "${css}"` 的JavaScript 代码，使得 Webpack 能够如同处理 JS 代码一样解析 CSS 内容与资源依赖；
- [`style-loader`](https://link.juejin.cn/?target=https%3A%2F%2Fwebpack.js.org%2Floaders%2Fstyle-loader%2F "https://webpack.js.org/loaders/style-loader/")：该 Loader 将在产物中注入一系列 runtime 代码，这些代码会将 CSS 内容注入到页面的 `<style>` 标签，使得样式生效；
- [`mini-css-extract-plugin`](https://link.juejin.cn/?target=https%3A%2F%2Fwebpack.js.org%2Fplugins%2Fmini-css-extract-plugin "https://webpack.js.org/plugins/mini-css-extract-plugin")：该插件会将 CSS 代码抽离到单独的 `.css` 文件，并将文件通过 `<link>` 标签方式插入到页面中。


#### 1 配置 CSS

`css-loader` 提供了很多处理 CSS 代码的基础能力，包括 CSS 到 JS 转译、依赖解析、Sourcemap、css-in-module 等，基于这些能力，Webpack 才能像处理 JS 模块一样处理 CSS 模块代码。接入时首先需要安装依赖：

1. 安装依赖
```shell
 npm i -D css-loader
```
2. 修改 Webpack 配置，定义 `.css` 规则：
```js
module.exports = {
/* ... */
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["css-loader"],
      },
    ],
  },
};

```

此后，执行 `npx webpack` 或其它构建命令即可。经过 `css-loader` 处理后，样式代码最终会被转译成一段 JS 字符串

```css
/* before */
.main-hd {
    font-size: 10px;
}
```

```js
// after 
c.push([t.id,".main-hd {\n    font-size: 10px;\n}\n",""])
```

但这段字符串只是被当作普通 JS 模块处理，并不会实际影响到页面样式，后续还需要：

 - **开发环境**：使用 `style-loader` 将样式代码注入到页面 `<style>` 标签；
 - **生产环境**：使用 `mini-css-extract-plugin` 将样式代码抽离到单独产物文件，并以 `<link>` 标签方式引入到页面中。

经过 `css-loader` 处理后，CSS 代码会被转译为等价 JS 字符串，但这些字符串还不会对页面样式产生影响，需要继续接入 `style-loader` 加载器。

与其它 Loader 不同，`style-loader` 并不会对代码内容做任何修改，而是简单注入一系列运行时代码，用于将 `css-loader` 转译出的 JS 字符串插入到页面的 `style` 标签。接入时同样需要安装依赖：

```shell
npm i -D style-loader
```

之后修改 Webpack 配置，定义 `.css` 规则：

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        // 注意保持 `style-loader` 在前，`css-loader` 在后
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};
```
上述配置语义上相当于 `style-loader(css-loader(css))` 链式调用，执行后样式代码会被转译为类似下面这样的代码：
```js
// Part1: css-loader 处理结果，对标到原始 CSS 代码
const __WEBPACK_DEFAULT_EXPORT__ = (
"body {\n    background: yellow;\n    font-weight: bold;\n}"
);
// Part2: style-loader 处理结果，将 CSS 代码注入到 `style` 标签
injectStylesIntoStyleTag(
 __WEBPACK_DEFAULT_EXPORT__
)
```
至此，运行页面触发 `injectStylesIntoStyleTag` 函数将 CSS 代码注入到 `<style>` 标签，样式才真正开始生效。可以打开 `dist/index.html` 查看效果

经过 `style-loader` + `css-loader` 处理后，样式代码最终会被写入 Bundle 文件，并在运行时通过 `style` 标签注入到页面。这种将 JS、CSS 代码合并进同一个产物文件的方式有几个问题：

- JS、CSS 资源无法并行加载，从而降低页面性能；
- 资源缓存粒度变大，JS、CSS 任意一种变更都会致使缓存失效。

因此，生产环境中通常会用 [`mini-css-extract-plugin`](https://link.juejin.cn/?target=https%3A%2F%2Fwebpack.js.org%2Fplugins%2Fmini-css-extract-plugin "https://webpack.js.org/plugins/mini-css-extract-plugin") 插件替代 `style-loader`，将样式代码抽离成单独的 CSS 文件。使用时，首先需要安装依赖：
```shell
npm i -D mini-css-extract-plugin
```
之后，添加配置信息：
```js
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
    module: {
        rules: [{
            test: /\.css$/,
            use: [
                // 根据运行环境判断使用那个 loader
                (process.env.NODE_ENV === 'development' ?
                    'style-loader' :
                    MiniCssExtractPlugin.loader),
                'css-loader'
            ]
        }]
    },
    plugins: [
        new MiniCssExtractPlugin()
    ]
}
```
需要注意：

- `mini-css-extract-plugin` 库同时提供 Loader、Plugin 组件，需要同时使用
- `mini-css-extract-plugin` 不能与 `style-loader` 混用，否则报错，所以上述示例中第 9 行需要判断 `process.env.NODE_ENV` 环境变量决定使用那个 Loader
- `mini-css-extract-plugin` 需要与 `html-webpack-plugin` 同时使用，才能将产物路径以 `link` 标签方式插入到 html 中

至此，运行 Webpack 后，`dist`目录中将同时生成 JS、CSS 两种产物文件：`main.js` 和 `main.css`

#### 2 CSS 预处理器

在实际开发中，由于原生 CSS 已经难以应对复杂的开发需求，我们往往会使用功能更强大的 CSS 预处理器(Preprocessor)，让样式代码复用性、可读性、可维护性更强，条理与结构更清晰。常用的 CSS 预处理器有 [Less](https://link.juejin.cn/?target=https%3A%2F%2Flesscss.org%2F "https://lesscss.org/")、[Sass](https://link.juejin.cn/?target=https%3A%2F%2Fsass-lang.com%2F "https://sass-lang.com/")、[Stylus](https://link.juejin.cn/?target=https%3A%2F%2Fstylus-lang.com%2F "https://stylus-lang.com/") 。

在下面的例子中，我们将使用 Less。

1. 安装依赖
```shell
npm i -D less less-loader
```

2. 修改 Webpack 配置，添加 `.less` 处理规则：
```js
module.exports = {
    module: {
        rules: [{
            // 可以同时处理 css 和 less
            test: /\.(css|less)$/, 
            use: [
                'style-loader',
                'css-loader',
                // less-loader 用于将 Less 代码转换为 CSS 代码
                'less-loader'
            ]
        }]
    }
}
```

打包后，CSS 和 Less 都被打包到 `main.css` 文件中

Sass、Stylus，它们接入 Webpack 的方式非常相似：
1. 安装依赖
```shell
npm i -D sass sass-loader
npm i -D stylus stylus-loader
```

2. 修改 Webpack 配置，添加处理规则：
```js
module.exports = {

  module: {
    rules: [
      {
        // Sass
        test: /\.s[ac]ss$/,
        use: [
          "style-loader", 
          "css-loader", 
          "sass-loader"
        ],
      },
      {
        // Stylus
        test: /\.styl$/, 
        use: [ 
	      "style-loader", 
	      "css-loader", 
	      "stylus-loader" 
	    ],
      }
    ],
  }
};
```

#### 3 PostCSS

预处理器之于 CSS，就像 TypeScript 与 JavaScript 的关系；而 PostCSS 之于 CSS，则更像 Babel 与 JavaScript。PostCSS 最大的优势在于其简单、易用、丰富的插件生态，基本上已经能够覆盖样式开发的方方面面。实践中，经常使用的插件有：

- [autoprefixer](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fpostcss%2Fautoprefixer "https://github.com/postcss/autoprefixer")：基于 [Can I Use](https://link.juejin.cn/?target=https%3A%2F%2Fcaniuse.com%2F "https://caniuse.com/") 网站上的数据，自动添加浏览器前缀
- [postcss-preset-env](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fjonathantneal%2Fpostcss-preset-env "https://github.com/jonathantneal/postcss-preset-env")：一款将最新 CSS 语言特性转译为兼容性更佳的低版本代码的插件
- [postcss-less](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fshellscape%2Fpostcss-less "https://github.com/shellscape/postcss-less")：兼容 Less 语法的 PostCSS 插件，类似的还有：[postcss-sass](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2FAleshaOleg%2Fpostcss-sass "https://github.com/AleshaOleg/postcss-sass")、[poststylus](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fmadeleineostoja%2Fpoststylus "https://github.com/madeleineostoja/poststylus")
- [stylelint](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fstylelint%2Fstylelint "https://github.com/stylelint/stylelint")：一个现代 CSS 代码风格检查器，能够帮助识别样式代码中的异常或风格问题

PostCSS 并没有定义一门新的语言，而是与 `@babel/core` 类似，只是实现了一套将 CSS 源码解析为 AST 结构，并传入 PostCSS 插件做处理的流程框架，具体功能都由插件实现。

1. 安装依赖
```shell
# 这个时候的 PostCSS 还只是个空壳，下一步还需要使用适当的 PostCSS 插件进行具体的功能处理
npm i -D postcss postcss-loader 

# 安装 [`autoprefixer`](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fpostcss%2Fautoprefixer "https://github.com/postcss/autoprefixer") 插件自动添加浏览器前缀
npm i -D autoprefixer
```

2. 添加 Webpack 配置
```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          "style-loader", 
          "css-loader", 
          // "postcss-loader" 基础用法，并未配置实际的 postcss 规则
          { loader: "postcss-loader", 
            options: { 
              postcssOptions: { 
                // 添加 autoprefixer 插件 
                plugins: [require("autoprefixer")], 
              }, 
            }, 
          },
          'less-loader', // 预处理器
        ],
      },
    ],
  }
};
```

之后，再次运行 Webpack 即可为 CSS 代码自动添加浏览器前缀

```css
/* before */
::placeholder {
    color: gray;
}

/* after */
::-moz-placeholder {  
  color: gray;  
}  
::placeholder {  
  color: gray;  
}
```

此外，还可以选择将 PostCSS 相关配置抽离保存到 `postcss.config.js` 文件：
```js
// postcss.config.js
module.exports = {
  plugins: [
    require("autoprefixer")
  ],
};


// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          "style-loader", 
          "css-loader", 
          "postcss-loader",
          'less-loader', // 预处理器
        ],
      },
    ],
  }
};
```

