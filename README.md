# Outset - Responsive

[![Join the chat at https://gitter.im/unijad/postcss-outset-responsive](https://badges.gitter.im/unijad/postcss-outset-responsive.svg)](https://gitter.im/unijad/postcss-outset-responsive?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Outset - Responsive is an Essential css helpers to fully control responsive html elements.

## install

using npm

``` terminal
npm install postcss-outset-responsive --save
```

## Usage

``` javascript
postcss([ require('postcss-outset-responsive') ])
```

See [POSTCSS](https://github.com/postcss/postcss) docs for examples for your environment.

## Options

Call plugin function to set options:

``` javascript
var outsetResponsive = require('postcss-outset-responsive')
postcss([ 
    outsetResponsive({
        type: 'class', //# selector type
        seprator: ':', //# selector seperator
        grid: {  //# grid and columns option
            selectors: {
                column: 'col', //# column selector
                grid: 'grid', //# grid selector
                wrap: 'wrap' //# wrap selector
            },
            columns: 12, //# number of columns
            gap: '0.5rem', //# default grid gap
            calc: false //# use of css calc() "IE 9+ support"
        }
    })
])
```

#### type (string)

to use this plugin you have three optional types of selector combinations 

available combinations (<b>Class</b>, <b>Media</b>, <b>attribute</b>)

<b>type: Class</b>

``` html
<!-- apply general style -->
<section class="#{property}(:)#{attribute}"></section>
<!-- and to target media -->
<section class="#{media}(:)#{property}(:)#{attribute}"></section>
```

example

``` html
<section class="wrap col:4 display:col:4 medium:col:6 small:col:12">
    <h3 class="float:left medium:float:none mobile:text-align:center">Responsive Elements is Easy<h3>
<section>
```

<b>type: media</b>

``` html
<section #{media}="#{property}(:)#{attribute}"></section>
```

example

``` html
<section default="wrap" display="col:4" medium="col:6" small="col:12">
    <h3 default="float:left" medium="float:none" small="text-align:center">Responsive Elements is Easy<h3>
<section>
```

<b>type: attribute</b>

``` html
<!-- apply general style -->
<section #{attribute}="#{attribute}"></section>
<!-- and to target media -->
<section #{attribute}="#{media}(:)#{attribute}"></section>
```

example

``` html
<section wrap col="col:4 medium:6 small:12">
    <h3 text-align="left medium:none small:center">Responsive Elements is Easy<h3>
<section>
```