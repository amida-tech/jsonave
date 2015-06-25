"use strict";

var chai = require('chai');

var parser = require('../lib/parser.js');

var expect = chai.expect;

describe('parser error conditions', function () {
    it('$...book[*].category', function () {
        var fn = parser.normalize.bind(null, '$...book[*].category');
        expect(fn).to.throw(Error);
    });

    it('$..book[*].', function () {
        var fn = parser.normalize.bind(null, '$..book[*].');
        expect(fn).to.throw(Error);
    });

    xit('$..book[!].category', function () {
        var fn = parser.normalize.bind(null, '$..book[!].category');
        expect(fn).to.throw(Error);
    });

    it('$..book[1*2].category', function () {
        var fn = parser.normalize.bind(null, '$..book[1*2].category');
        expect(fn).to.throw(Error);
    });

    it('$..book[1,*2].category', function () {
        var fn = parser.normalize.bind(null, '$..book[1,*2].category');
        expect(fn).to.throw(Error);
    });

    it('$..book[].category', function () {
        var fn = parser.normalize.bind(null, '$..book[].category');
        expect(fn).to.throw(Error);
    });

    it('$..book[(@.other].category', function () {
        var fn = parser.normalize.bind(null, '$..book[(@.other].category');
        expect(fn).to.throw(Error);
    });

    it('$..book[?(@.other].category', function () {
        var fn = parser.normalize.bind(null, '$..book[?(@.other].category');
        expect(fn).to.throw(Error);
    });

    it('$..book[?engine].category', function () {
        var fn = parser.normalize.bind(null, '$..book[?engine].category');
        expect(fn).to.throw(Error);
    });

    it('$..book[engine,', function () {
        var fn = parser.normalize.bind(null, '$..book[engine,');
        expect(fn).to.throw(Error);
    });
});
