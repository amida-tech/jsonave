"use strict";

var util = require('util');
var _ = require('lodash');

var jsonpath = require('../index');

var store = require('./examples/store.json');

describe('jsonpath store example path option', function () {
  var options = {
    resultType: 'path',
    sandbox: {
      round: function (obj) {
        return Math.round(obj);
      }
    }
  };

  it('$.store.book[*].author', function () {
    var jp = jsonpath.instance('$.store.book[*].author', options);
    var actual = jp(store);
    var expected = _.range(store.store.book.length).map(function (n) {
      return util.format("$['store']['book'][%s]['author']", n);
    });
    expect(actual).toEqual(expected);
  });

  it('$..author', function () {
    var jp = jsonpath.instance('$..author', options);
    var actual = jp(store);
    var expected = _.range(store.store.book.length).map(function (n) {
      return util.format("$['store']['book'][%s]['author']", n);
    });
    expect(actual).toEqual(expected);
  });

  it('$.store.*', function () {
    var jp = jsonpath.instance('$.store.*', options);
    var actual = jp(store);
    var expected = Object.keys(store.store).map(function (s) {
      return util.format("$['store']['%s']", s);
    });
    expect(actual).toEqual(expected);
  });

  it('$.store..price', function () {
    var jp = jsonpath.instance('$.store..price', options);
    var actual = jp(store);
    var expected = _.range(store.store.book.length).map(function (n) {
      return util.format("$['store']['book'][%s]['price']", n);
    });
    expected.push("$['store']['bicycle']['price']");
    expect(actual).toEqual(expected);
  });

  it('$..book[2]', function () {
    var jp = jsonpath.instance('$..book[2]', options);
    var actual = jp(store);
    var expected = ["$['store']['book'][2]"];
    expect(actual).toEqual(expected);
  });

  it('$..book[(@.length-1)]', function () {
    var jp = jsonpath.instance('$..book[(@.length-1)]', options);
    var actual = jp(store);
    var expected = ["$['store']['book'][3]"];
    expect(actual).toEqual(expected);
  });

  it('$..book[-1:]', function () {
    var jp = jsonpath.instance('$..book[-1:]', options);
    var actual = jp(store);
    var expected = ["$['store']['book'][3]"];
    expect(actual).toEqual(expected);
  });

  it('$..book[1,2]', function () {
    var jp = jsonpath.instance('$..book[1,2]', options);
    var actual = jp(store);
    var expected = [1, 2].map(function (n) {
      return util.format("$['store']['book'][%s]", n);
    });
    expect(actual).toEqual(expected);
  });

  it('$..book[:2]', function () {
    var jp = jsonpath.instance('$..book[:2]', options);
    var actual = jp(store);
    var expected = [0, 1].map(function (n) {
      return util.format("$['store']['book'][%s]", n);
    });
    expect(actual).toEqual(expected);
  });

  it('$..book[*][category,author]', function () {
    var jp = jsonpath.instance('$..book[*][category,author]', options);
    var actual = jp(store);
    var expected = _.range(store.store.book.length).reduce(function (r, n) {
      r.push(util.format("$['store']['book'][%s]['category']", n));
      r.push(util.format("$['store']['book'][%s]['author']", n));
      return r;
    }, []);
    expect(actual).toEqual(expected);
  });

  it('$..book[?(@.isbn)]', function () {
    var jp = jsonpath.instance('$..book[?(@.isbn)]', options);
    var actual = jp(store);
    var expected = [2, 3].map(function (n) {
      return util.format("$['store']['book'][%s]", n);
    });
    expect(actual).toEqual(expected);
  });

  it('$..[?(@.price>19)]^', function () {
    var jp = jsonpath.instance('$..[?(@.price>19)]^', options);
    var actual = jp(store);
    var expected = [
      "$['store']",
      "$['store']['book']"
    ];
    expect(actual).toEqual(expected);
  });

  it('$..*', function () {
    var jp = jsonpath.instance('$..*', options);
    var actual = jp(store);
    var expected = [
      "$['store']",
      "$['store']['book']",
      "$['store']['bicycle']",
      "$['store']['book'][0]",
      "$['store']['book'][1]",
      "$['store']['book'][2]",
      "$['store']['book'][3]",
      "$['store']['book'][0]['category']",
      "$['store']['book'][0]['author']",
      "$['store']['book'][0]['title']",
      "$['store']['book'][0]['price']",
      "$['store']['book'][1]['category']",
      "$['store']['book'][1]['author']",
      "$['store']['book'][1]['title']",
      "$['store']['book'][1]['price']",
      "$['store']['book'][2]['category']",
      "$['store']['book'][2]['author']",
      "$['store']['book'][2]['title']",
      "$['store']['book'][2]['isbn']",
      "$['store']['book'][2]['price']",
      "$['store']['book'][3]['category']",
      "$['store']['book'][3]['author']",
      "$['store']['book'][3]['title']",
      "$['store']['book'][3]['isbn']",
      "$['store']['book'][3]['price']",
      "$['store']['bicycle']['color']",
      "$['store']['bicycle']['price']"
    ];
    expect(actual).toEqual(expected);
  });

  it('$.store.book[?(@path !== "$[\'store\'][\'book\'][0]")]', function () {
    var jp = jsonpath.instance('$.store.book[?(@path !== "$[\'store\'][\'book\'][0]")]', options);
    var actual = jp(store);
    var expected = [1, 2, 3].map(function (n) {
      return util.format("$['store']['book'][%s]", n);
    });
    expect(actual).toEqual(expected);
  });

  it('$.store..price.round()', function () {
    var jp = jsonpath.instance('$.store..price.round()', options);
    var actual = jp(store);
    var expected = _.range(store.store.book.length).map(function (n) {
      return util.format("$['store']['book'][%s]['price'].round()", n);
    });
    expected.push("$['store']['bicycle']['price'].round()");
    expect(actual).toEqual(expected);
  });
});
