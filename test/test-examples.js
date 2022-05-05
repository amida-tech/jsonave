"use strict";

var jsonave = require('../index');

describe('readme examples', function () {
  it('function - 0', function () {
    var example = require('./examples/store.json');

    var options = {
      sandbox: {
        round: function (obj) {
          return Math.round(obj);
        }
      }
    };
    var jp = jsonave.instance('$.store..price.round()', options);
    var result = jp(example);
    //console.log(result); // [ 9, 13, 9, 23, 20 ]
    expect(result).toEqual([9, 13, 9, 23, 20]);
  });

  it('function - 1', function () {
    var example = require('./examples/store.json');

    var round = function (obj) {
      return Math.round(obj);
    };

    var jp = jsonave.instance('$.store..price.round()');
    var result = jp(example, {
      round: round
    });
    //console.log(result); // [ 9, 13, 9, 23, 20 ]
    expect(result).toEqual([9, 13, 9, 23, 20]);
  });
});
