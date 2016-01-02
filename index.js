'use strict';
var postcss = require('postcss');
var assets = require('./assets');
var fs = require('fs');
module.exports = postcss.plugin('postcss-direction-support', function (opts) {
    // options initials
    opts = opts || {};

    var options = {};
    options.direction        = opts.dir || 'rtl';
    options.selector         = opts.selector || '';
    options.external         = opts.external || false;
    options.externalFileName = opts.filename || opts.direction;
    options.externalFilePath = opts.filePath || './';

    if (options.selector === '') {
        options.selector = opts.selector || '[dir="' + options.direction + '"]';
    }
    // options
    // override direction
    var convertables = [
        // paddings
        'padding', // [ok]
        'padding-left', // [ok]
        'padding-right', // [ok]
        // margins
        'margin', // [ok]
        'margin-left', // [ok]
        'margin-right', // [ok]
        // position
        'right', // [ok]
        'left', // [ok]
        // border
        'border-right',
        'border-left',
        // text align
        'text-align', // [ok]
        // floats and clear
        'float', // [ok]
        'clear' // [ok]
    ];

    return function (css) {
        'use strict';
        // create new root
        var Root = postcss.root();
        var Rules = [];
        var RulesSelectors = [];
        var targetRoot;

        css.walkDecls(function (decl) {
            var target = decl.parent;
            var rule = decl.parent.selector;
            var prop = decl.prop;
            var value = decl.value;
            // check if property is convertable
            if(convertables.indexOf(prop) !== -1) {
                // build properties
                if(RulesSelectors.indexOf(rule) === -1) {
                    // push properties to Rule
                    RulesSelectors.push(rule);
                    Rules.push({
                        selector: rule,
                        decl:     [],
                        target:   target
                    });
                }
                if(decl.parent.parent.name !== 'keyframes') {
                    Rules[RulesSelectors.indexOf(rule)].decl.push({
                        prop:  prop,
                        value: value
                    });
                }
            }
        });
        //
        // console.log(Rules)
        Rules.forEach(function (rule) {
            if(rule.decl.length > 0) {
                // define Selector object
                // append Direction to Selector
                rule.selector = rule.selector.replace('\n', '');
                rule.selector = rule.selector.replace(
                    ',',
                    ',\n' + options.selector + ' '
                );
                // Define Root and Append Selector
                var selector = {
                    selector: options.selector + ' ' + rule.selector
                };
                // if selector has atRule as parent
                if(rule.target.parent.type === 'atrule') {
                    // get boolean if selector has same Parent atRule
                    var atRuleMatches = {
                        name:   targetRoot.name === rule.target.parent.name,
                        params: targetRoot.params === rule.target.parent.params
                    };
                    // if selectors deosnt share same parent, create new atRule
                    if (!atRuleMatches.name && !atRuleMatches.params) {
                        var atRule = postcss.atRule({
                            name:   rule.target.parent.name,
                            params: rule.target.parent.params
                        });
                        // append newly created atRule to end of Root
                        Root.append(atRule);
                    }
                    // update Target Root with the atRule Root
                    targetRoot = Root.last;
                } else { // if not atRule
                    // set target to Main Root
                    targetRoot = Root;
                }
                // check if opposite direction are set
                var directionArray = {
                    RL:   [],
                    M_RL: [],
                    P_RL: [],
                    B_RL: []
                };
                rule.decl.forEach(function (decl, i) {
                    var match = assets.fn.match(decl.prop);
                    var target;
                    // var margin-right = decl.prop.match(/^margin-right$/);
                    if(!assets.fn.match(decl.value).skip) {
                        if(match.RL) {
                            // if right/left
                            if(match.RL.index === 0) {
                                target = directionArray.RL;
                            }
                            // if padding
                            if(match.padding) {
                                target = directionArray.P_RL;
                            }
                            // if margin
                            if(match.margin) {
                                target = directionArray.M_RL;
                            }
                            // if border
                            if(match.border) {
                                target = directionArray.B_RL;
                            }
                            target.push({
                                index: i,
                                prop:  decl.prop,
                                value: decl.value
                            });
                        }
                    }
                });
                for (var prop in directionArray) {
                    var value = directionArray[prop];
                    if(value.length === 2) {
                        if(value[0].value === value[1].value) {
                            rule.decl[value[0].index].value = 'skip';
                            rule.decl[value[1].index].value = 'skip';
                        }
                    } else if(value.length === 1) {
                        // check if it has no other alternatives,
                        // create auto or null for alternative
                        var target = rule.decl[value[0].index];
                        var originalProp = assets.process(
                            target.prop,
                            target.value
                        );
                        var match = assets.fn.match(originalProp.prop);
                        if(match.RL) {
                            if(match.RL.index === 0 ||
                                match.margin ||
                                match.padding
                            ) {
                                rule.decl.push({
                                    prop:  originalProp.prop,
                                    value: 'auto'
                                });
                            }
                            if(match.border) {
                                originalProp.value = '0';
                                rule.decl.push({
                                    prop:  originalProp.prop,
                                    value: originalProp.value
                                });
                            }
                        }
                    }
                }
                // Add Properties to Rule
                var skippedItems = [];
                var itemDecls = [];
                rule.decl.forEach(function (decl, i) {
                    // convert prop and value
                    var assetProccess = assets.process(decl.prop, decl.value);
                    decl.prop = assetProccess.prop;
                    decl.value = assetProccess.value;
                    //
                    if(!assetProccess.skip) {
                        itemDecls.push({
                            prop:  decl.prop,
                            value: decl.value
                        });
                    } else {
                        skippedItems.push(i);
                    }
                });

                if(skippedItems.length !== rule.decl.length) {
                    // append Selector to previously Defined Root
                    targetRoot.append(selector);
                    itemDecls.forEach(function (decl) {
                        targetRoot.last.append(decl);
                    });
                }
            }
        });
        //
        css.replaceValues(' !skip-direction', {
            fast: 'skip-direction'
        }, function () {
            return '';
        });
        if(opts.external) {
            fs.writeFileSync(
                options.externalFilePath + options.externalFileName + '.css',
                Root.toString()
            );
            console.log(options.externalFilePath + options.externalFileName);
        } else {
            css.append(Root);
        }
    };
});
