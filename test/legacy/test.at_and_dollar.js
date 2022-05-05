"use strict";

var jsonPath = require('../../index').expression;

var t1 = {
  simpleString: "simpleString",
  "@": "@asPropertyName",
  "a$a": "$inPropertyName",
  "$": {
    "@": "withboth",
  },
  a: {
    b: {
      c: "food"
    }
  }
};

describe('@ and $ test', function () {
  it('undefined, null', function () {
    expect(jsonPath({
      json: undefined,
      path: 'foo'
    })).toBeUndefined();
    expect(jsonPath({
      json: null,
      path: 'foo'
    })).toBeNull();
    expect(jsonPath({
      json: {},
      path: 'foo'
    })[0]).toEqual(undefined);
    expect(jsonPath({
      json: {
        a: 'b'
      },
      path: 'foo'
    })[0]).toEqual(undefined);
    expect(jsonPath({
      json: {
        a: 'b'
      },
      path: 'foo'
    })[100]).toEqual(undefined);
  });

  it('actual', function () {
    expect(jsonPath({
      json: t1,
      path: '\$'
    })[0]).toEqual(t1['$']);
    expect(jsonPath({
      json: t1,
      path: '$'
    })[0]).toEqual(t1['$']);
    expect(jsonPath({
      json: t1,
      path: 'a$a'
    })[0]).toEqual(t1['a$a']);
    expect(jsonPath({
      json: t1,
      path: '\@'
    })[0]).toEqual(t1['@']);
    expect(jsonPath({
      json: t1,
      path: '@'
    })[0]).toEqual(t1['@']);
    expect(jsonPath({
      json: t1,
      path: '$.$.@'
    })[0]).toEqual(t1['$']['@']);
    expect(jsonPath({
      json: t1,
      path: '\@'
    })[1]).toBeUndefined();
  });
});
