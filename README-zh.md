<div align="center">
  <img src="https://github.com/ShawnDGitHub/imgPack/blob/main/img/icon_vertical_v1.0.png" alt="U2Component 的图表"/>
</div>
<div align="center">
  <img src="https://img.shields.io/badge/License-Apache--2.0_license-green" alt="License"/>
  <img src="https://img.shields.io/badge/Design_System-Material_Deisgn_3-blue" alt="设计系统受到 Material Design 3 启发"/>
  <img src="https://img.shields.io/badge/stars-1-orange" alt="star 数目"/>
</div>

> U2Component 是一个受 Material Design 3 设计系统启发的跨框架组件库，基于 Web Component。该项目正在重构中。

## 导航
- [说明](#说明)
- [注意](#注意)
- [使用引导](#使用引导)
  - [主题](#主题)
  - [Import](#Import)
- [可用组件](#可用组件)
- [文档](#文档)
  - [text field](#text-field)
  - [select](#select)
  - [button](#button)
  - [segmented button](#segmented-button)
  - [form](#form)
  - [form-item](#form-item)

## 说明
U2Component 是一个基于 **Web Component** 的组件库。可以通过替换 CSS 文件 “token.css” 一次性更改所有组件的颜色，所有组件的颜色和字体均使用 design tokens。
## 注意
1. 请确保在 **主流浏览器** 使用此组件库。
2. 确保在 html 上设置了 ```font-size: 1rem```。某些样式使用了 rem 和 em 单位。
## 使用引导
### 主题
**生成 tokens**
/style 文件夹中的 css 文件由 **Figma 插件** [Material Theme Builder](https://www.figma.com/community/plugin/1034969338659738588/material-theme-builder) 生成。选择 “Export" - “Web(CSS)”，替换本项目 /style 中的 token.css 文件即可。

我正在设计一个库，可以根据图片生成 U2Component 主题所需的 tokens，保持关注。

**图标 (TODO)**
之前的图标库使用了 material-symbols，目前图标功能已经被移除，后续会支持，当然可能会是其他的图标库。



> 将来的 npm 包将不再需要以下这些流程（仅限框架中使用时）。

### Import
**1. 导入基础样式**
样式文件包含各种 token，例如**浅色和深色主题**。

```html
<link rel="stylesheet" type="text/css" href="../style/theme.css">
```
**2. 导入具体的组件**
只需将其导入 HTML 文件即可（有许多参数可以调整）：

```html
<script src="../components/TextField.js" type="module"></script>
```
[ -> top](#目录)

## 可用组件
| 名称          | 状态                  | 使用时的标签名     |
| :---------------: | :------------------------- | :------------- |
| text field         | 稳定                      | u2-field    |
| select         | 可能变动                | u2-Select    |
| filled button  | 稳定                       | u2-button variant="filled"  |
| outlined button    | 稳定                       | u2-button variant="outlined"      |
| text button       | 稳定                       | u2-button       |
| segmented button   | 可能变动                  | segmented-button  |
| form   | 可能变动                  | u2-form  |
| form item   | 可能变动                  | u2-form-item  |

## 文档
### text-field

<div align="center">
  <img src="https://github.com/ShawnDGitHub/imgPack/blob/main/img/u2_example-text-field.png" alt="text field 示例"/>
</div>

基本用法。没有设置 placeholder 时会自动添加该属性。.
```html
  <u2-field variant="filled"></u2-field>
  <u2-field variant="outlined"></u2-field>
```
这里有两种变体：填充 (filled) 和轮廓 (outlined). **variant 属性是必须设置的**.
```html
  <u2-field
      variant="filled"
      label="username"
      autocomplete="name"
      width="240">
  </u2-field>
  <u2-field
      variant="outlined"
      placeholder="verify code"
      type="password">
  </u2-field>
```
参数：
(\*) 表示必须设置

1. **variant**(\*) : 
文本输入框的样式类型。在 Material 3 中，此组件有两种样式变体：填充 (filled) 和轮廓 (outlined)。
2. **value** : 
设置输入框内容。
3. **placeholder** : 
当用户未输入任何内容时，初始状态下显示的占位符文本。
4. **label** :
当用户聚焦（点击） text field 时，标签会浮动。**目前不能同时设置 label 和 placeholder**。
5. **width** : 
*默认单位为 px，不支持百分比单位*。可以指定组件的宽度，组件的宽度将不再填充父元素的宽度。（*在 M3 Doc 中，TextField 的最大宽度为 112 px*，但我设计了一个属性来帮助消除此限制。）
6. **fullWidth** : 
哈哈，这就是上面说到的，本组件会填充父亲组件的宽度。
7. **type** : 
设置 ```type="password"``` 可让输入的内容不可见。
8. **disabled** : 
设置 ```disabled``` 可让 text field 不可输入。

[ -> top](#目录)

### select

<div align="center">
  <img src="https://github.com/ShawnDGitHub/imgPack/blob/main/img/u2_example-select.png" alt="select 示例"/>
</div>

和网页原生的 Select 一样，用时将 option 标签作为其子元素。
```html
  <u2-select
      variant="filled"
      label="type selector">
      <option value="1">inner option 1</option>
      <option value="2">inner option 2</option>
  </u2-select>
```
参数：
(\*) 表示必须设置

1. **variant**(\*) : 
此组件有两种样式变体：填充 (filled) 和轮廓 (outlined)。
2. **label**(\*)
3. **disabled**

### button

<div align="center">
  <img src="https://github.com/ShawnDGitHub/imgPack/blob/main/img/u2_example-buttons.png" alt="buttons 示例"/>
</div>

```html
  <u2-button>text button</u2-button>
  <u2-button variant="filled">filled button</u2-button>
  <u2-button variant="outlined">outlined button</u2-button>
  <u2-button disabled>disabled state</u2-button>
```
参数：
(\*) 表示必须设置

1. **variant** : 
此组件有三种样式变体：文本、填充和轮廓。* 如果未设置此属性，它将回退到默认文本类型*。
2. **disabled**

### segmented-button

<div align="center">
  <img src="https://github.com/ShawnDGitHub/imgPack/blob/main/img/u2_example-segmented-button.png" alt="segmented button 示例"/>
</div>

```html
  <segmented-button>
      <u2-button>option 1</u2-button>
      <u2-button>option 2</u2-button>
      <u2-button>option 3</u2-button>
  </segmented-button>
```
没有任何参数。**仅支持 text button**。

[ -> top](#目录)

### form
表单验证组件。

<div align="center">
  <img src="https://github.com/ShawnDGitHub/imgPack/blob/main/img/u2_example-validation.png" alt="表单验证 示例"/>
</div>

```html
  <u2-form>
      <u2-form-item prop="age">
          <u2-field
              variant="filled"
              label="age"
              fullWidth>
          </u2-field>
      </u2-form-item>
  </u2-form>
```
为表单设置规则时，内部元素 form item 必须具有 prop 属性。
```javascript
const FORM = document.getElementsByTagName("U2-FORM")[0];
const rules = {
    age: [
        {
            required: true,
            trigger: "change",
        },
    ]
}
FORM.rules = rules;
```
**rules 的配置内容和 Element Plus 的一样**。

### form-item
见 form 的代码示例。 **必须放在 u2-form 中使用**。

[ -> top](#目录)
