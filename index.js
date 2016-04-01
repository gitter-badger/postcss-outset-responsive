'use strict';
//# require postcss
const postcss = require('postcss');

/**
 * @module postcss-direction-support
 * @param {object} Options - postcss plugin options
 * @author younis jad <younis.m.jad@gmail.com>
 * @exports postcss-direction-support
 * @return {object} postcss-direction-support
 */
module.exports = postcss.plugin('postcss-direction-support', function (opts) {
    //# options initials
    opts = opts || {};
    const options = {};
    //# set options
    options.type = opts.type || 'class'; //# selector type
    options.seprator = opts.seprator || ':'; //# selector seperator
    options.grid = opts.grid || {  //# grid and columns option
        selectors: {
            column: 'col', //# column selector
            grid: 'grid', //# grid selector
            wrap: 'wrap' //# wrap selector
        },
        columns: 12, //# number of columns
        gap: '0.5rem', //# default grid gap
        calc: false //# use of css calc() "IE 9+ support"
    }
    //# responsive helpers:
    //# selector and properties to be used in responsive override
    options.cssHelpers = opts.cssHelpers || [
        { 'display': ['block', 'inline-block', 'inline', 'none', 'inherit'] },
        { 'text-align': ['left', 'right', 'center', 'start', 'end', 'inherit'] },
        { 'float': ['left', 'right', 'none', 'inherit'] },
        { 'clear': ['left', 'right', 'none', 'inherit'] }
    ];
    //# media queries
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
        {'print': 'print'}
    ];
    /*
    # @function createGrid
    # @descriotion implements grid, and columns selectors
    # @ @param {object} Root - postcss object
    # @ @param {object} opts - plugin options
    # @ @param {object} media - media query object
    */
    const createGrid = function(Root, opts, media) {
        //# loop through columns
        for(let i = 1; i < opts.columns +1; i++) {
            let selector; //# create empty selector variable
            let isMedia = typeof media !== 'undefined'; //# check if it's in media query
            let mediaSelector = '';
            if(isMedia) { //# if detects media query
                mediaSelector = media + options.seprator; //# create selector, and override empty media selector
            }
            if(options.type === 'class') { //# if css selector type is {class}
                //# create selector
                //# @example: [class="screen:col:12"]
                //# @example: [class="col:12"]
                selector = '[class~="' + (media !== '' ? mediaSelector : '') 
                                       + opts.selectors.column + options.seprator + i + '"]';
            }
            if(options.type === 'attribute') { //# if css selector type is {attribute}
                //# create selector
                //# @example: [col="screen:12"]
                //# @example: [col="col:12"]
                selector = '[col~="' + (media !== '' ? mediaSelector : '') 
                                     + i + '"]';
            }
            if(options.type === 'media') { //# if css selector type is {media}
                //# create selector
                //# @example: [screen="col:12"]
                //# @example: [default="col:12"]
                selector = '[' + (typeof media !== 'undefined' ? media : 'default') + '~="col' + options.seprator + i + '"]';
            }
            if(typeof media === 'undefined') { //# if css selector type is undefined
                //# append selector to main root
                Root.append({selector: selector});
                Root.last.append({prop: 'width', 'value': (100/options.grid.columns)*i + '%'});
            } else { //# if detects media selector
                if(Root.last.type === 'atrule') { //# check if media is a media query atrule
                    //# append selector to media query
                    Root.last.append({selector: selector});
                    Root.last.last.append({prop: 'width', 'value': (100/options.grid.columns)*i + '%'});
                }
            }
        }
    }
    /*
    # @function responsiveMedia
    # @descriotion adds default selector to show item, specific to media-query
    # @ @param {object} Root - postcss object
    # @ @param {object} media - media query object
    */
    const responsiveMedia = function(Root, media) {
        if(Root.last.type === 'atrule') { //# check if media is a media query atrule
            //# hides the default element
            //# append selector to media query
            Root.last.append({selector: '[media-type]'});
            Root.last.last.append({prop: 'display', 'value': 'none !important'});
            //# shows the element in current media
            //# append selector to media query
            Root.last.append({selector: '[media-type=' + media + ']'});
            Root.last.last.append({prop: 'display', 'value': 'block !important'});
        }
    }
    /*
    # @function loopDecl
    # @descriotion loops through css declarations, and appends selectors to @Root
    # @ @param {object} Root - postcss object
    # @ @param {object} media - media query object
    */
    const loopDecl = function(Root, media) {
        //# check if media is provided, and set empty string if not
        media = media ? media : '';
        //# loop through cssHelpers
        for(let i in options.cssHelpers) {
            //# create a const with the declarations
            const that = options.cssHelpers[i];
            //# loop through declarations
            for(let key in that) {
                //# loop through properties in declarations
                for(let prop in that[key]) {
                    let selector;
                    if(options.type === 'class') { //# if css selector type is {class}
                        //# create selector
                        //# @example: [class="screen:col:12"]
                        //# @example: [class="col:12"]
                        selector = '[class~="' + (media !== '' ? media + options.seprator : '')
                                               + key + options.seprator + that[key][prop] + '"]';
                    }
                    if(options.type === 'attribute') { //# if css selector type is {attribute}
                        //# create selector
                        //# @example: [col="screen:12"]
                        //# @example: [col="col:12"]
                        selector = '[' + key + '~="' + (media !== '' ? media + options.seprator : '') + that[key][prop] + '"]';   
                    }
                    if(options.type === 'media') { //# if css selector type is {media}
                        //# create selector
                        //# @example: [screen="col:12"]
                        //# @example: [default="col:12"]
                        selector = '[' + (media !== '' ? media : 'default') + '~="' + key + options.seprator + that[key][prop] + '"]';   
                    }
                    if(media === '') {
                        Root.append({selector: selector});
                        Root.last.append({prop: key, 'value': that[key][prop]});
                    } else { //# if detects media selector
                        if(Root.last.type === 'atrule') { //# check if media is a media query atrule
                            //# append selector to media query
                            Root.last.append({selector: selector});
                            Root.last.last.append({prop: key, 'value': that[key][prop]});
                        }
                    }
                }
            }
        }
    };
    /*
    # @function loopMedia
    # @descriotion loops through media queries, and appends each to @Root
    # @ @param {object} Root - postcss object
    # @ @param {object} media - media query object
    */
    const loopMedia = function(Root, media) {
        //# loop through media queries parent
        for(let i in media) {
            //# loop through media queries children if any
            for(let key in media[i]) {
                //# define value and mediaRoot emelents
                let value = media[i][key];
                let MediaRoot = postcss.parse('@media ' + value + ' {}');
                //# build Media Queries
                responsiveMedia(MediaRoot, key)
                //# build css Declarations and properties
                loopDecl(MediaRoot, key)
                //# build css grid
                createGrid(MediaRoot, options.grid, key)
                //# append this Media to postcss Root
                Root.append(MediaRoot)
            }
        }
    }
    /*
    # @function buildGeneral
    # @descriotion build general css selectors
    # @return {object} new postcss Root
    */
    const buildGeneral = function() {
        //# create new postcss root
        const subRoot = postcss.root();
        //# create object with empty Selectors
        const localSelectors = {
            col: '',
            grid: '',
            clearfix: ''
        }
        if(options.type === 'class') { //# if css selector type is {class}
            //# create selector
            //# @example: [class*="col"]
            localSelectors.col = '[class*=' + options.grid.selectors.column + ']'
            //# @example: .grid
            localSelectors.grid = '.' + options.grid.selectors.grid
            //# @example: .clearfix
            localSelectors.clearfix = '.' + options.grid.selectors.clearfix
            //# @example: .wrap
            localSelectors.wrap = '.' + options.grid.selectors.wrap
        }
        if(options.type === 'attribute') { //# if css selector type is {attribute}
            //# create selector
            //# @example: [col]
            localSelectors.col = '[' + options.grid.selectors.column + ']'
            //# @example: [grid]
            localSelectors.grid = '[' + options.grid.selectors.grid + ']'
            //# @example: [clearfix]
            localSelectors.clearfix = '[' + options.grid.selectors.clearfix + ']'
            //# @example: [wrap]
            localSelectors.wrap = '[' + options.grid.selectors.wrap + ']'
        }
        if(options.type === 'media') { //# if css selector type is {media}
            //# create selector
            //# @example: [default="col"]
            localSelectors.col = '[default*="' + options.grid.selectors.column + '"]'
            //# @example: [default="grid"]
            localSelectors.grid = '[default*="' + options.grid.selectors.grid + '"]'
            //# @example: [default="clearfix"]
            localSelectors.clearfix = '[default*="' + options.grid.selectors.clearfix + '"]'
            //# @example: [default="wrap"]
            localSelectors.wrap = '[default*="' + options.grid.selectors.wrap + '"]'
        }
        //# create and append columns selector
        subRoot.append({selector: localSelectors.col})
        subRoot.last.append({prop: 'float', value: 'left'});
        subRoot.last.append({prop: 'width', value: '100%'});
        //# create and append grid
        subRoot.append({selector: localSelectors.grid})
        subRoot.last.append({prop: 'margin', value: options.grid.gap + ' -' + options.grid.gap});
        //# create and append clearfix
        subRoot.append({selector: localSelectors.grid + ':before, ' + localSelectors.grid + ':after'})
        subRoot.last.append({prop: 'display', value: 'table'});
        subRoot.last.append({prop: 'clear', value: 'both'});
        //# create and append wrap
        subRoot.append({selector: localSelectors.wrap})
        subRoot.last.append({prop: 'margin-right', value: 'auto'});
        subRoot.last.append({prop: 'margin-left', value: 'auto'});
        subRoot.last.append({prop: 'float', value: 'none'});
        //# create and append box-sizing
        subRoot.append({selector: '*'})
        subRoot.last.append({prop: 'box-sizing', value: 'border-box'});
        //# return postcss Root element
        return subRoot;
    }
    return function (css) {
        'use strict';
        //# create new Root;
        let Root = postcss.root();
        //# write general selectors here
        Root.append(buildGeneral());
        //# loop declarations and append defaults to css Root;
        loopDecl(Root);
        createGrid(Root, options.grid);
        //# loop media
        loopMedia(Root, options.media);
        css.append(Root);
    };
});
