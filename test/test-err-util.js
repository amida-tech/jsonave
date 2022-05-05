"use strict";

var util = require('../lib/err-util');

describe('error utility', function () {
  it('no parameters', function () {
    var fn = util.throwErr.bind(null, 'test0');
    expect(fn).toThrowError(Error);
  });

  it('one parameter', function () {
    var fn = util.throwErr.bind(null, 'test1', 'p0');
    expect(fn).toThrowError(Error);
  });

  it('two parameters', function () {
    var fn = util.throwErr.bind(null, 'test2', 'p0', 'p1');
    expect(fn).toThrowError(Error);
  });

  it('unknown', function () {
    var fn = util.throwErr.bind(null, 'xxxxx');
    expect(fn).toThrowError(Error);
  });
});
