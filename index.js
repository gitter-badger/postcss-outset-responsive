'use strict';
let postcss = require('postcss');

module.exports = postcss.plugin('postcss-direction-support', function (opts) {
    // options initials
    opts = opts || {};

    let options = {};
    // types: class, attribute, media
    options.type            = opts.type || 'class';
    options.seprator        = opts.seprator || ':';
    options.grid = opts.grid || {
        selectors: {
            column: 'col',
            grid: 'grid',
            wrap: 'wrap'
        },
        columns: 12,
        gap: '0.5rem',
        calc: false

    }
    options.cssHelpers = opts.cssHelpers || [
        { 'display': ['block', 'inline-block', 'inline', 'none', 'inherit'] },
        { 'text-align': ['left', 'right', 'center', 'start', 'end', 'inherit'] },
        { 'float': ['left', 'right', 'none', 'inherit'] },
        { 'clear': ['left', 'right', 'none', 'inherit'] },
    ];
    options.media = opts.media || [
        {'screen': '(min-width: 1367px)'},
        {'display': '(min-width: 1025px) and (max-width: 1366px)'},
        {'tablet': '(min-width: 480px) and (max-width: 1024px)'},
        {'tablet-portrait': '(min-width: 480px) and (max-width: 1024px) and (orientation: portrait)'},
        {'tablet-landscape': '(min-width: 480px) and (max-width: 1024px) and (orientation: landscape)'},
        {'tablet-retina': '(min-width: 480px) and (max-width: 1024px) and (-webkit-min-device-pixel-ratio: 2)'},
        {'tablet-none-retina': '(min-width: 480px) and (max-width: 1024px) and (-webkit-max-device-pixel-ratio: 1)'},
        {'mobile': '(max-width: 480px)'},
        {'mobile-landscape': '(max-width: 480px) and (orientation: portrait)'},
        {'mobile-portrait': '(max-width: 480px) and (orientation: landscape)'},
        {'mobile-retina': '(max-width: 480px) and (-webkit-min-device-pixel-ratio: 2)'},
        {'mobile-none-retina': '(max-width: 480px) and (-webkit-max-device-pixel-ratio: 1)'},
        {'print': 'print'},
    ];


    let createGrid = function(Root, opts, media) {
        for(let i = 1; i < opts.columns +1; i++) {
            let selector;
            var isMedia = typeof media !== 'undefined';
            if(isMedia) {
                var mediaSelector = media + options.seprator;
            } else {
                var mediaSelector = '';
            }
            if(options.type === 'class') {
                selector = '[class~="' + (media !== '' ? mediaSelector : '') 
                                       + opts.selectors.column + options.seprator + i + '"]';
            }
            if(options.type === 'attribute') {
                selector = '[col~="' + (media !== '' ? mediaSelector : '') 
                                     + i + '"]';
            }
            if(options.type === 'media') {
                selector = '[' + (typeof media !== 'undefined' ? media : 'default') + '~="col' + options.seprator + i + '"]';
            }
            if(typeof media === 'undefined') {
                Root.append({selector: selector});
                Root.last.append({prop: 'width', 'value': (100/12)*i + '%'});
            } else {
                if(Root.last.type === 'atrule') {
                    Root.last.append({selector: selector});
                    Root.last.last.append({prop: 'width', 'value': (100/12)*i + '%'});
                }
            }
        }
    }

    let responsivePicutre = function(Root, media) {
        if(Root.last.type === 'atrule') {
            Root.last.append({selector: '[media-type]'});
            Root.last.last.append({prop: 'display', 'value': 'none !important'});

            Root.last.append({selector: '[media-type=' + media + ']'});
            Root.last.last.append({prop: 'display', 'value': 'block !important'});
        }
    }

    let loopDecl = function(Root, media) {
        media = media ? media : '';
        for(let i in options.cssHelpers) {
            const that = options.cssHelpers[i];
            for(let key in that) {
                for(let prop in that[key]) {
                    let selector;
                    if(options.type === 'class') {
                        selector = '[class~="' + (media !== '' ? media + options.seprator : '')
                                               + key + options.seprator + that[key][prop] + '"]';
                    }
                    if(options.type === 'attribute') {
                        selector = '[' + key + '~="' + (media !== '' ? media + options.seprator : '') + that[key][prop] + '"]';   
                    }
                    if(options.type === 'media') {
                        selector = '[' + (media !== '' ? media : 'default') + '~="' + key + options.seprator + that[key][prop] + '"]';   
                    }
                    if(media === '') {
                        Root.append({selector: selector});
                        Root.last.append({prop: key, 'value': that[key][prop]});
                    } else {
                        if(Root.last.type === 'atrule') {
                            Root.last.append({selector: selector});
                            Root.last.last.append({prop: key, 'value': that[key][prop]});
                        }
                    }
                }
            }
        }
    };

    let loopMedia = function(Root, media) {
        for(let i in media) {
            for(let key in media[i]) {
                let value = media[i][key];
                let MediaRoot = postcss.parse('@media ' + value + ' {}');
                
                responsivePicutre(MediaRoot, key)
                loopDecl(MediaRoot, key)
                createGrid(MediaRoot, options.grid, key)

                Root.append(MediaRoot)
            }
        }
    }

    let buildGeneral = function() {
        var subRoot = postcss.root();
        var localSelectors = {
            col: '',
            grid: '',
            clearfix: ''
        }
        if(options.type === 'class') {
            localSelectors.col = '[class*=' + options.grid.selectors.column + ']'
            localSelectors.grid = '.' + options.grid.selectors.grid
            localSelectors.clearfix = '.' + options.grid.selectors.clearfix
            localSelectors.wrap = '.' + options.grid.selectors.wrap
        }
        if(options.type === 'attribute') {
            localSelectors.col = '[' + options.grid.selectors.column + ']'
            localSelectors.grid = '[' + options.grid.selectors.grid + ']'
            localSelectors.clearfix = '[' + options.grid.selectors.clearfix + ']'
            localSelectors.wrap = '[' + options.grid.selectors.wrap + ']'
        }
        if(options.type === 'media') {
            localSelectors.col = '[default*="' + options.grid.selectors.column + '"]'
            localSelectors.grid = '[default*="' + options.grid.selectors.grid + '"]'
            localSelectors.clearfix = '[default*="' + options.grid.selectors.clearfix + '"]'
            localSelectors.wrap = '[default*="' + options.grid.selectors.wrap + '"]'
        }
        // column
        subRoot.append({selector: localSelectors.col})
        subRoot.last.append({prop: 'float', value: 'left'});
        subRoot.last.append({prop: 'width', value: '100%'});
        // grid
        subRoot.append({selector: localSelectors.grid})
        subRoot.last.append({prop: 'margin', value: options.grid.gap + ' -' + options.grid.gap});
        // clearfix
        subRoot.append({selector: localSelectors.grid + ':before, ' + localSelectors.grid + ':after'})
        subRoot.last.append({prop: 'display', value: 'table'});
        subRoot.last.append({prop: 'clear', value: 'both'});
        // wrap
        subRoot.append({selector: localSelectors.wrap})
        subRoot.last.append({prop: 'margin-right', value: 'auto'});
        subRoot.last.append({prop: 'margin-left', value: 'auto'});
        subRoot.last.append({prop: 'float', value: 'none'});
        // box-sizing
        subRoot.append({selector: '*'})
        subRoot.last.append({prop: 'box-sizing', value: 'border-box'});

        return subRoot;
    }

    return function (css) {
        'use strict';
        // create new Root;
        let Root = postcss.root();
        // write general selectors here
        Root.append(buildGeneral());
        // loop declarations and append defaults to css Root;
        loopDecl(Root);
        createGrid(Root, options.grid);
        // loop media
        loopMedia(Root, options.media);
        css.append(Root);
    };
});
