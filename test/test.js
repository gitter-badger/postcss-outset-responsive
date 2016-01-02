var postcss = require('postcss');
var expect  = require('chai').expect;

var plugin = require('../');

var test = function (input, output, opts, done) {
    postcss([ plugin(opts) ]).process(input).then(function (result) {
        expect(result.css).to.eql(output);
        expect(result.warnings()).to.be.empty;
        done();
    }).catch(function (error) {
        done(error);
    });
};

describe('postcss-direction-support', function () {

    /* Write tests here */

    it('reverse float:right', function (done) {
        test(
            'a {float: right}',
            'a {float: right}\n[dir="rtl"] a {float: left}',
            { },
        done);
    });

    it('reverse float:left', function (done) {
        test(
            'a {float: left}',
            'a {float: left}\n[dir="rtl"] a {float: right}',
            { },
        done);
    });

    it('reverse clear:right', function (done) {
        test(
            'a {clear: right}',
            'a {clear: right}\n[dir="rtl"] a {clear: left}',
            { },
        done);
    });

    it('reverse clear:left', function (done) {
        test(
            'a {clear: left}',
            'a {clear: left}\n[dir="rtl"] a {clear: right}',
            { },
        done);
    });

    it('reverse text-align:left', function (done) {
        test(
            'a {text-align: left}',
            'a {text-align: left}\n[dir="rtl"] a {text-align: right}',
            { },
        done);
    });

    it('reverse text-align:right', function (done) {
        test(
            'a {text-align: right}',
            'a {text-align: right}\n[dir="rtl"] a {text-align: left}',
            { },
        done);
    });

    it('reverse right', function (done) {
        test(
            'a {right: 10px}',
            'a {right: 10px}\n[dir="rtl"] a {left: 10px;right: auto}',
            { },
        done);
    });

    it('reverse left', function (done) {
        test(
            'a {left: 10px}',
            'a {left: 10px}\n[dir="rtl"] a {right: 10px;left: auto}',
            { },
        done);
    });

    it('reverse left,left equal', function (done) {
        test(
            'a {left: 10px; right: 10px}',
            'a {left: 10px; right: 10px}',
            { },
        done);
    });

    it('reverse left,right notequal', function (done) {
        test(
            'a {left: 10px; right: 100px}',
            'a {left: 10px; right: 100px}\n[dir="rtl"] ' +
            'a {right: 10px;left: 100px}',
            { },
        done);
    });

    it('reverse padding', function (done) {
        test(
            'a {padding: 10px 5px 10px 2px}',
            'a {padding: 10px 5px 10px 2px}\n[dir="rtl"] ' +
            'a {padding: 10px 2px 10px 5px}',
            { },
        done);
    });

    it('reverse padding-right', function (done) {
        test(
            'a {padding-right: 10px}',
            'a {padding-right: 10px}\n[dir="rtl"] ' +
            'a {padding-left: 10px;padding-right: auto}',
            { },
        done);
    });

    it('reverse padding-left', function (done) {
        test(
            'a {padding-left: 10px}',
            'a {padding-left: 10px}\n[dir="rtl"] ' +
            'a {padding-right: 10px;padding-left: auto}',
            { },
        done);
    });

    it('reverse padding-left,padding-right equal', function (done) {
        test(
            'a {padding-left: 10px;padding-right: 10px}',
            'a {padding-left: 10px;padding-right: 10px}',
            { },
        done);
    });

    it('reverse padding-left,padding-right notequal', function (done) {
        test(
            'a {padding-left: 10px;padding-right: 100px}',
            'a {padding-left: 10px;padding-right: 100px}\n[dir="rtl"] ' +
            'a {padding-right: 10px;padding-left: 100px}',
            { },
        done);
    });

    it('reverse margin', function (done) {
        test(
            'a {margin: 10px 5px 10px 2px}',
            'a {margin: 10px 5px 10px 2px}\n[dir="rtl"] ' +
            'a {margin: 10px 2px 10px 5px}',
            { },
        done);
    });

    it('reverse margin-right', function (done) {
        test(
            'a {margin-right: 10px}',
            'a {margin-right: 10px}\n[dir="rtl"] ' +
            'a {margin-left: 10px;margin-right: auto}',
            { },
        done);
    });

    it('reverse margin-left', function (done) {
        test(
            'a {margin-left: 10px}',
            'a {margin-left: 10px}\n[dir="rtl"] ' +
            'a {margin-right: 10px;margin-left: auto}',
            { },
        done);
    });

    it('reverse margin-left,margin-right equal', function (done) {
        test(
            'a {margin-left: 10px;margin-right: 10px}',
            'a {margin-left: 10px;margin-right: 10px}',
            { },
        done);
    });

    it('reverse margin-left,margin-right notequal', function (done) {
        test(
            'a {margin-left: 10px;margin-right: 100px}',
            'a {margin-left: 10px;margin-right: 100px}\n[dir="rtl"] ' +
            'a {margin-right: 10px;margin-left: 100px}',
            { },
        done);
    });

    it('skip margin-left', function (done) {
        test(
            'a {margin-left: 10px !skip-direction}',
            'a {margin-left: 10px}',
            { },
        done);
    });

    it('skip margin-right special with margin-left', function (done) {
        test(
            'a {margin-right: 1px !skip-direction;margin-left: 10px}',
            'a {margin-right: 1px;margin-left: 10px}\n[dir="rtl"] ' +
            'a {margin-right: 10px;margin-left: auto}',
            { },
        done);
    });

    it('skip margin-right', function (done) {
        test(
            'a {margin-right: 10px !skip-direction}',
            'a {margin-right: 10px}',
            { },
        done);
    });

    it('skip margin-left special with margin-right', function (done) {
        test(
            'a {margin-left: 1px !skip-direction;margin-right: 10px}',
            'a {margin-left: 1px;margin-right: 10px}\n[dir="rtl"] ' +
            'a {margin-left: 10px;margin-right: auto}',
            { },
        done);
    });

    it('skip padding-left', function (done) {
        test(
            'a {padding-left: 10px !skip-direction}',
            'a {padding-left: 10px}',
            { },
        done);
    });

    it('skip padding-right special with padding-left', function (done) {
        test(
            'a {padding-right: 1px !skip-direction;padding-left: 10px}',
            'a {padding-right: 1px;padding-left: 10px}\n[dir="rtl"] ' +
            'a {padding-right: 10px;padding-left: auto}',
            { },
        done);
    });

    it('skip padding-right', function (done) {
        test(
            'a {padding-right: 10px !skip-direction}',
            'a {padding-right: 10px}',
            { },
        done);
    });

    it('skip padding-left special with padding-right', function (done) {
        test(
            'a {padding-left: 1px !skip-direction;padding-right: 10px}',
            'a {padding-left: 1px;padding-right: 10px}\n[dir="rtl"] ' +
            'a {padding-left: 10px;padding-right: auto}',
            { },
        done);
    });

});
