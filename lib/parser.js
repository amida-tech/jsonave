'use strict';

var util = require('util');

var re4Integer = '-?(?:0|[1-9][0-9]*)';

var re = exports.re = {
    identifier: new RegExp('^[a-zA-Z_\\$]+[a-zA-Z0-9_]*'),
    integer: new RegExp(re4Integer),
    range: new RegExp(util.format('^(%s)?\\:(%s)?(?:\\:(%s)?)?', re4Integer, re4Integer, re4Integer)),
    q_string: new RegExp('^\'(?:\\\\[\'bfnrt/\\\\]|\\\\u[a-fA-F0-9]{4}|[^\'\\\\])*\''),
    qq_string: new RegExp('^\"(?:\\\\[\"bfnrt/\\\\]|\\\\u[a-fA-F0-9]{4}|[^\"\\\\])*\"')
};

var types = {
    ROOT: {
        type: 'root'
    },
    WILDCARD: {
        type: 'wildcard'
    },
    RECURSIVE_DESCENT: {
        type: 'recursive_descent'
    },
    PARENT: {
        type: 'parent'
    }
};

var propertyUpdate = {
    identifier: function (properties, reExecResult) {
        properties.push(reExecResult[0]);
    },
    integer: function (properties, reExecResult) {
        var i = parseInt(reExecResult[0], 10);
        properties.push(i);
    },
    q_string: function (properties, reExecResult) {
        var r = reExecResult[0];
        properties.push(r.substring(1, r.length - 1));
    },
    qq_string: function (properties, reExecResult) {
        var r = reExecResult[0];
        properties.push(r.substring(1, r.length - 1));
    },
    range: function (properties, reExecResult) {
        var start = (reExecResult[1] && parseInt(reExecResult[1], 10)) || 0;
        var end = (reExecResult[2] && parseInt(reExecResult[2], 10)) || null;
        var step = (reExecResult[3] && parseInt(reExecResult[3], 10)) || 1;
        properties.push({
            start: start,
            end: end,
            step: step
        });
    }
};

var expandSubscriptProperties = exports.expandSubscriptProperties = function expandSubscriptProperties(subscript, properties) {
    var reKeys = ['range', 'identifier', 'integer', 'q_string', 'qq_string'];
    var n = reKeys.length;
    for (var i = 0; i < n; ++i) {
        var key = reKeys[i];
        var r = re[key];
        var result = r.exec(subscript);
        if (result) {
            propertyUpdate[key](properties, result);
            var nResult = result[0].length;
            if (nResult === subscript.length) {
                return true;
            }
            if (subscript[nResult] !== ',') {
                var msg = util.format('Invalid character "%s" in %s.', subscript[nResult], subscript);
                throw new Error(msg);
            }
            subscript = subscript.substring(nResult + 1);
            return expandSubscriptProperties(subscript, properties);
        }
    }
    return false;
};

var subscriptHandlers = {
    '$': {
        verify: function (subscript) {
            return (subscript.length > 1) && (subscript.charAt(1) === '.');
        },
        node: function (subscript) {
            return {
                type: 'subpath',
                parameter: subscript
            };
        }
    },
    '?': {
        verify: function (subscript) {
            var n = subscript.length;
            if ((n < 2) || (subscript.charAt(1) !== '(')) {
                throw new Error('Subscript start with "?" but the second character is not "("');
            }
            if (subscript.charAt(n - 1) !== ')') {
                throw new Error('Subscript starts with "?(" but does not end with ")".');
            }
            return true;
        },
        node: function (subscript) {
            var n = subscript.length;
            return {
                type: 'filter_script',
                parameter: subscript.substring(2, n - 1)
            };
        }
    },
    '(': {
        verify: function (subscript) {
            var n = subscript.length;
            if (subscript.charAt(n - 1) !== ')') {
                throw new Error('Subscript starts with "(" but does not end with ")".');
            }
            return true;
        },
        node: function (subscript) {
            var n = subscript.length;
            return {
                type: 'script',
                parameter: subscript.substring(1, n - 1)
            };
        }
    },
    '*': {
        verify: function (subscript) {
            return subscript.length === 1;
        },
        node: function (subscript) {
            return types.WILDCARD;
        }
    }
};

var subscriptToNode = function (subscript) {
    if (subscript.length === 0) {
        throw new Error('Empty subscript in path.');
    }

    var c = subscript.charAt(0);
    var handler = subscriptHandlers[c];
    if (handler && handler.verify(subscript)) {
        return handler.node(subscript);
    }

    var properties = [];
    var result = expandSubscriptProperties(subscript, properties);
    if (result) {
        var single = (properties.length === 1) && (typeof properties[0] !== 'object');
        return {
            type: single ? 'property' : 'properties',
            parameter: single ? properties[0] : properties
        };
    }

    throw new Error('Invalid subscript: ' + subscript);
};

var updateNodesWithProperty = function (property, nodes) {
    var n = property.length;
    if (property.substring(n - 2, n) === '()') {
        nodes.push({
            type: 'fn',
            parameter: property.substring(0, n - 2)
        });
        return;
    }
    nodes.push({
        type: 'property',
        parameter: property
    });
};

var findMatchingSquareBracket = function (path, index) {
    var length = path.length;
    var openBrackets = 1;
    while (index < length) {
        var c = path.charAt(index);
        if (c === '[') {
            ++openBrackets;
            ++index;
        } else if (c === ']') {
            --openBrackets;
            if (openBrackets === 0) {
                return index;
            }
            ++index;
        } else {
            ++index;
        }
    }
    throw new Error('Closing square brackets is not found');
};

var propertyHandlers = {
    '.': {
        verify: function (accum) {
            if (accum.index + 1 === accum.length) {
                throw new Error('Incomplete path.');
            }
            if ((accum.expr.charAt(accum.index + 1) === '.') && (accum.expr.charAt(accum.index + 2) === '.')) {
                throw new Error('Invalid syntax "...".');
            }
            return true;
        },
        update: function (accum) {
            accum.clearBuffer();
            ++accum.index;
            accum.lastIndex = accum.index;
            if (accum.expr.charAt(accum.index) === '.') {
                accum.pushNode(types.RECURSIVE_DESCENT);
            }
        }
    },
    '[': {
        verify: function (accum) {
            return true;
        },
        update: function (accum) {
            accum.clearBuffer();
            ++accum.index;
            accum.lastIndex = accum.index;
            accum.index = findMatchingSquareBracket(accum.expr, accum.index);
            var subExprInside = accum.expr.substring(accum.lastIndex, accum.index);
            var scriptResult = subscriptToNode(subExprInside);
            accum.pushNode(scriptResult);
        }
    },
    '*': {
        verify: function (accum) {
            return accum.lastIndex === accum.index;
        },
        update: function (accum) {
            accum.pushNode(types.WILDCARD);
        }
    },
    '$': {
        verify: function (accum) {
            return (accum.index === 0) && (accum.expr.charAt(1) === '.');
        },
        update: function (accum) {
            accum.pushNode(types.ROOT);
        }
    },
    '^': {
        verify: function (accum) {
            return true;
        },
        update: function (accum) {
            accum.clearBuffer();
            accum.pushNode(types.PARENT);
        }
    }
};

var nodeAccumulator = (function () {
    var prototype = {
        pushNode: function (node) {
            this.exprList.push(node);
            ++this.index;
            this.lastIndex = this.index;
        },
        clearBuffer: function () {
            if (this.lastIndex < this.index) {
                var subExpr = this.expr.substring(this.lastIndex, this.index);
                updateNodesWithProperty(subExpr, this.exprList);
            }
        }
    };

    return function (expr) {
        var result = Object.create(prototype);
        result.expr = expr;
        result.exprList = [];
        result.index = 0;
        result.length = expr.length;
        result.lastIndex = 0;
        return result;
    };
})();

exports.normalize = function (expr) {
    var accum = nodeAccumulator(expr);
    while (accum.index < accum.length) {
        var c = expr.charAt(accum.index);
        var handler = propertyHandlers[c];
        if (handler && handler.verify(accum)) {
            handler.update(accum);
        } else {
            ++accum.index;
        }
    }
    accum.clearBuffer();
    return accum.exprList;
};
