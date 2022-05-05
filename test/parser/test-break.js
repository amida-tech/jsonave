"use strict";

var util = require('util');

var parser = require('../../lib/parser.js');
var errUtil = require('../../lib/err-util');

describe('parser error conditions', function () {
  it('$...book[*].category', function () {
    var msg = errUtil.codes['parser.path....'];
    var fn = parser.normalize.bind(null, '$...book[*].category');
    expect(fn).toThrowError(Error);
  });

  it('$..book[*].', function () {
    var msg = errUtil.codes['parser.path.incomplete'];
    var fn = parser.normalize.bind(null, '$..book[*].');
    expect(fn).toThrowError(Error);
  });

  it('$..book[a,!].category', function () {
    var rawMsg = errUtil.codes['parser.subscript.invalidsub'];
    var msg = util.format(rawMsg, 'a,!');
    var fn = parser.normalize.bind(null, '$..book[a,!].category');
    expect(fn).toThrowError(Error);
  });

  it('$..book[!].category', function () {
    var rawMsg = errUtil.codes['parser.subscript.invalidsub'];
    var msg = util.format(rawMsg, '!');
    var fn = parser.normalize.bind(null, '$..book[!].category');
    expect(fn).toThrowError(Error);
  });

  it('$..book[1*2].category', function () {
    var rawMsg = errUtil.codes['parser.subscript.invalidchar'];
    var msg = util.format(rawMsg, '*', '1*2');
    var fn = parser.normalize.bind(null, '$..book[1*2].category');
    expect(fn).toThrowError(Error);
  });

  it('$..book[1,*2].category', function () {
    var rawMsg = errUtil.codes['parser.subscript.invalidchar'];
    var msg = util.format(rawMsg, '2', '*2');
    var fn = parser.normalize.bind(null, '$..book[1,*2].category');
    expect(fn).toThrowError(Error);
  });

  it('$..book[].category', function () {
    var msg = errUtil.codes['parser.subscript.empty'];
    var fn = parser.normalize.bind(null, '$..book[].category');
    expect(fn).toThrowError(Error);
  });

  it('$..book[(@.other].category', function () {
    var msg = errUtil.codes['parser.subscript.unmatched('];
    var fn = parser.normalize.bind(null, '$..book[(@.other].category');
    expect(fn).toThrowError(Error);
  });

  it('$..book[?(@.other].category', function () {
    var msg = errUtil.codes['parser.subscript.unmatched?('];
    var fn = parser.normalize.bind(null, '$..book[?(@.other].category');
    expect(fn).toThrowError(Error);
  });

  it('$..book[?engine].category', function () {
    var msg = errUtil.codes['parser.subscript.unmatched?'];
    var fn = parser.normalize.bind(null, '$..book[?engine].category');
    expect(fn).toThrowError(Error);
  });

  it('$..book[engine,', function () {
    var msg = errUtil.codes['parser.subscript.unmatched]'];
    var fn = parser.normalize.bind(null, '$..book[engine,');
    expect(fn).toThrowError(Error);
  });

  it('$.prop["]nested', function () {
    var msg = errUtil.codes['parser.subscript.unmatched"'];
    var fn = parser.normalize.bind(null, '$.prop["]nested');
    expect(fn).toThrowError(Error);
  });

  it('$.prop[\'nes]ted', function () {
    var msg = errUtil.codes['parser.subscript.unmatched\''];
    var fn = parser.normalize.bind(null, '$.prop[\'nes]ted');
    expect(fn).toThrowError(Error);
  });
});
