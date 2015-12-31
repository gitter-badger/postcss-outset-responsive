# PostCSS Direction Support [![Build Status][ci-img]][ci]

[PostCSS] plugin PostCSS plugin to add rtl support to your stylesheet, by overriding css attributes with [dir] and [lang] flags.

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/unijad/postcss-direction-support.svg
[ci]:      https://travis-ci.org/unijad/postcss-direction-support

```css
.foo {
    /* Input example */
}
```

```css
.foo {
  /* Output example */
}
```

## Usage

```js
postcss([ require('postcss-direction-support') ])
```

See [PostCSS] docs for examples for your environment.
