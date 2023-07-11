<div align="center">
  <img src="https://github.com/ShawnDGitHub/imgPack/blob/main/img/icon_vertical_v1.0.png" alt="The logo of U2Component"/>
</div>
<div align="center">
  <img src="https://img.shields.io/badge/License-Apache--2.0_license-green" alt="The logo of U2Component"/>
  <img src="https://img.shields.io/badge/Design_System-Material_Deisgn_3-blue" alt="The logo of U2Component"/>
</div>

A web components project Inspired by material design 3.
U2Component 是一个受到 Material Design 3 ( 后文简称质感 3 ) 启发的 Web Component 组件库，提供了质感 3 风格的组件和衍生样式组件。

## 快速链接
[不同主题颜色文件](https://github.com/ShawnDGitHub/U2Component/tree/main/CSS)
[组件](https://github.com/ShawnDGitHub/U2Component/tree/main/HTML/components)


## 目录
- [简介](#简介)
- [保持最新](#保持最新)
- [准备使用的条件](#准备使用的条件)
  - [图标 ( Material Symbols )](#图标--material-symbols-)
    - [HTML 引入](#html-引入)
    - [npm 安装](#npm-安装)
  - [颜色](#颜色)
  - [JavaScript](#javascript)
  - [总结使用条件](#总结使用条件)
- [开始使用](#开始使用)
- [可用组件](#可用组件)

## 简介

U2Component 是一个适应性强的组件库。你能够通过替换 CSS 文件立马改变所有组件的颜色，并且它们风格统一，这得益于 [Design Token](https://m3.material.io/foundations/design-tokens/overview) ( 设计令牌 ) 这个概念，所有组件的颜色、字体都使用了设计令牌。

关于设计令牌的例子，查看本篇博客：https://codingmway.com/U2Component%20README


## 保持最新

要注意的是，该项目还在初期阶段，我会保证持续的更新，欢迎你的反馈。这也意味着未声明稳定 ( stable ) 的组件可能会有代码的变动，需要你及时关注 Github 上的提交内容。


## 准备使用的条件

U2Component 现阶段未考虑 IE 浏览器等非主流浏览器的适配，请确保你在主流的浏览器上采用该组件库来开发。

### 图标 ( Material Symbols )

U2Component 依赖于 [Material Symbols ( 质感符号 )](https://fonts.google.com/icons)，这是一组可变字形的图标字体。Google Fonts 的介绍：

> Material Symbols 是我们最新的图标，将超过 3,004 个字形整合到一个字体文件中，并具有多种设计变体。 符号提供三种样式和四种可调节的可变字体样式（填充、粗细、等级和尺寸【optical size】 ）。

#### HTML 引入

在 HTML 文件中引入即可（其中有很多参数可调整）：

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
```

注意 Material+Symbols+Outlined 的 `Outlined `这个部分，其可以替换为 Rounded 或 Sharp，这将改变引入的图标从边线变种图标变为i为圆润变种或尖锐变种。

由于质感符号还有很多参数可以调整，我建议访问官网自行调整参数并复制引入链接。

#### npm 安装

```javascript
npm install material-symbols
```

需要注意的是，这种方式安装将会使得三种变种图标的字体文件全部安装，且其中图标数量比起官网少了一部分。

### 颜色

因为依赖于质感３的颜色应用规范，请确保你在自己应用中提供了组件需要的样式令牌。即使是你不知道如何获取样式令牌，也**不用担心**，在本项目的 CSS 文件夹中已经准备了多种颜色的主题需要的样式令牌，你可以选择一种主题的文件直接放入你的开发资源文件夹中，在 HTML 文件中引入 theme.css 即可。

```html
<link rel="stylesheet" type="text/css" href="css/theme.css">
```

**Theme.css 内容**

```css
@import url(tokens.css);
@import url(colors.module.css);
@import url(typography.module.css);
@import url(theme.light.css) (prefers-color-scheme: light);
@import url(theme.dark.css) (prefers-color-scheme: dark);
```

以上是 U2Component 所依赖的样式文件，看见了吗，token.css 包含了亮/暗色模式所需要的样式令牌，而 theme.dark.css 指定了暗色模式下的内容，无需再考虑暗色模式的适配问题。


### JavaScript

Web Component 是一种为 Web 提供具有多种特性的标准组件的模型，允许单个 HTML 元素的封装和组件之间的操作性。

这里主要强调 JS 文件的引入。你需要在 HTML 中加入如下格式的内容：

```html
<script src="webComponents/TextButton.js" type="module"></script>
```

webComponents 是一个文件夹，最重要的是引入每个组件需要的 JS 文件。例如，这里引入了 TextButton ( 文字按钮 )。

组件所需要的样式文件是和组件 JS 文件是同名的，**确保**组件对应的同名样式文件和组件 JS 文件在同一个目录下。这是因为 JS 文件指定了样式文件的位置：

```javascript
 this.shadowRoot.innerHTML = `<style>@import "${new URL("TextButton.css", import.meta.url)}";</style><div><slot></slot></div>`;
```

### 总结使用条件

1. 引入 图标
2. 引入 theme.css
3. 引入组件 JS 文件


## 开始使用

每个组件都有不同的属性，请参照对应组件的文档。

这里给出 TextField ( 文字输入框 ) 的使用范例：

```javascript
<text-field 
 variant="filled" placeholder="用户名"
 width="300"
 leading-icon="person"
 icon-variant="rounded"
 :value="username" (*)
 ref="usernameTextField">  (**)
</text-field>
```

这和你使用其他组件库的方式是相同的，你需要在 HTML 标签中指定需要的属性，例如：

1. 样式变种 - ***variant\***。

   文本输入框的样式类型，在质感3中，该组件有 filled、outlined 两种样式变种。

2. 占位符 - ***placeholder\***。

   用户未输入的初始状态下要展示的占位文字，在聚焦文本输入框后，placeholder 会变为浮动指示文字。

3. 固定宽度 - ***width\***。默认补充单位 px，不支持百分比单位。

   你可以指定该组件的宽度，该组件的宽度将不再填充父元素宽度。（TextField 有一个最大宽度 112 px，但我设计了一个属性方便你解除这个限制，详细参考 TextField 文档。）

4. 前置图标 - ***leading-icon\***。必须和 icon-variant 同时出现。

   TextField 的前置图标。你可以设置 TextField 的前置图标，这能提升用户的输入体验。

5. 图标变种 - ***icon-variant\***。

   [Material Symbols](https://fonts.google.com/icons) 拥有三类图标变种，分别是 outlined、rounded 和 sharp (  边线图标、圆润图标以及尖锐图标 )。传入 icon-variant 属性来设置图标变种。

6. 注意到（*）和（**）了吗？U2Component 可以在 Vue 环境下完美使用。

   你可以通过 `this.$refs.usernameTextField.setAttribute("value", xxxx);` 来访问该对象并设定 TextField 中的内容，也可以通过 `v-bind` 动态的绑定 attribute。

该组件更多属性和规范请参考文档。

## 可用组件

目前可用的组件如下：

| 组件名称          | 开发状态                   | 别名           |
| ----------------- | -------------------------- | -------------- |
| TextField         | 稳定                       | 文字输入框     |
| Modal Date Picker | 开发中,有 Vue 组件稳定版本 | 模态日期选择器 |
| OutlinedButton    | 稳定                       | 边框按钮       |
| TextButton        | 稳定                       | 文字按钮       |
| IconButton        | 稳定                       | 图标按钮       |
| SegmentedButton   | 开发中                     | 组合按钮       |
