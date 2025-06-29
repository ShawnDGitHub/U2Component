<div align="center">
  <img src="https://github.com/ShawnDGitHub/imgPack/blob/main/img/icon_vertical_v1.0.png" alt="The logo of U2Component"/>
</div>
<div align="center">
  <img src="https://img.shields.io/badge/License-Apache--2.0_license-green" alt="The logo of U2Component"/>
  <img src="https://img.shields.io/badge/Design_System-Material_Deisgn_3-blue" alt="The logo of U2Component"/>
</div>

> U2Component offers components documented in M3 (it doesn't aim for M3 Expressive). The project is being refactored and will be published to npm soon.
## menu
- [Introduction](#Introduction)
- [Notice](#Notice)
- [Instructions](#Instructions)
  - [Icon (TODO))](#Icon (TODO))
  - [1. Import style](#1. Import style)
  - [2. Import component](#2. Import component)
- [Examples of using existing components](#Examples of using existing components)
  - [text field](#text field)
  - [select](#select)
  - [button](#button)
  - [segmented button](#segmented button)
- [Available components](#Available components)

## Introduction
U2Component is a component library based on **web component**. You can change the color of all components at once by replacing the CSS file "token.css", all component colors and fonts use design tokens.
## Notice
1. Please make sure that you use this component library for development on **mainstream browsers**.
2. Make sure you set ```font-size: 1rem``` on  html. Some styles use rem and em units.
## Instructions
### Icon (TODO)
The previous icon library used material-symbols, which has now been removed and is being redesigned and will be supported in the future.
> These processes below will no longer be needed in the future.

### 1. Import style
The style file contains various tokens, such as **light and dark themes**.
```html
<link rel="stylesheet" type="text/css" href="../style/theme.css">
```
### 2. Import component
Just import it into the HTML file (there are many parameters that can be adjusted):
```html
<script src="../components/TextField.js" type="module"></script>
```
[ -> top](#menu)
## Examples of using existing components
### text field

<div align="center">
  <img src="https://github.com/ShawnDGitHub/imgPack/blob/main/img/u2_example-text-field.png" alt="examples of text field"/>
</div>

Basic use. it will auto add a placeholder attribute to itself.
```html
  <u2-field variant="filled"></u2-field>
  <u2-field variant="outlined"></u2-field>
```
There are two types of text field: filled and outlined. **variant attribute is required**.
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
parameter:
(*) means required

1. **variant**(\*) : 
The style type of the text input box. In Material 3, this component has two style variants: filled and outlined.
2. **value** : 
Set default input.
3. **placeholder** : 
The placeholder text to be displayed in the initial state when the user has not input anything.
4. **label** :
A label may float to top when user focus on text field. **You can't set both of label and placeholder**.
5. **width** : 
*The default unit is px, and percentage units are not supported*. You can specify the width of the component, and the width of the component will no longer fill the width of the parent element. (*TextField has a maximum width of 112 px in M3 Doc*, but I designed a property to help you remove this limitation.)
6. **fullWidth** : 
Here it comes. The component will fill the container width.
7. **type** : 
Set ```type="password"``` to let input be invisible.
8. **disabled** : 
Set ```disabled``` to make it uninputable.

[ -> top](#menu)

### select

<div align="center">
  <img src="https://github.com/ShawnDGitHub/imgPack/blob/main/img/u2_example-select.png" alt="examples of select"/>
</div>

Same as the native web select, put option element in it.
```html
  <u2-select
      variant="filled"
      label="type selector">
      <option value="1">inner option 1</option>
      <option value="2">inner option 2</option>
  </u2-select>
```
parameter:
(\*) means required
1. **variant**(\*) : 
This component has two style variants: filled and outlined.
2. **label**(\*)
3. **disabled**

### button

<div align="center">
  <img src="https://github.com/ShawnDGitHub/imgPack/blob/main/img/u2_example-buttons.png" alt="examples of buttons"/>
</div>

```html
  <u2-button>text button</u2-button>
  <u2-button variant="filled">filled button</u2-button>
  <u2-button variant="outlined">outlined button</u2-button>
  <u2-button disabled>disabled state</u2-button>
```
parameter:
(\*) means required
1. **variant** : 
This component has three style variants: text, filled and outlined. *If you don't set this attribute, it will fallback to default text type*.
2. **disabled**

### segmented button

<div align="center">
  <img src="https://github.com/ShawnDGitHub/imgPack/blob/main/img/u2_example-segmented-button.png" alt="example of segmented button"/>
</div>

```html
  <segmented-button>
      <u2-button>option 1</u2-button>
      <u2-button>option 2</u2-button>
      <u2-button>option 3</u2-button>
  </segmented-button>
```
no parameter is needed.

[ -> top](#menu)

## Available components
| name          | state                  | the name when using      |
| ----------------- | -------------------------- | -------------- |
| text field         | stable                      | u2-field    |
| select         | stable(may change)                 | u2-Select    |
| filled button  | stable                       | u2-button variant="filled"  |
| outlined button    | stable                       | u2-button variant="outlined"      |
| text button       | stable                       | u2-button       |
| segmented button   | stable                     | segmented-button  |
