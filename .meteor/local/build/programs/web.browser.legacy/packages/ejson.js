//////////////////////////////////////////////////////////////////////////
//                                                                      //
// This is a generated file. You can view the original                  //
// source in your browser if your browser supports source maps.         //
// Source maps are supported by all recent versions of Chrome, Safari,  //
// and Firefox, and by Internet Explorer 11.                            //
//                                                                      //
//////////////////////////////////////////////////////////////////////////


Package["core-runtime"].queue("ejson",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var Base64 = Package.base64.Base64;
var meteorInstall = Package.modules.meteorInstall;
var meteorBabelHelpers = Package.modules.meteorBabelHelpers;
var Promise = Package.promise.Promise;
var Symbol = Package['ecmascript-runtime-client'].Symbol;
var Map = Package['ecmascript-runtime-client'].Map;
var Set = Package['ecmascript-runtime-client'].Set;

/* Package-scope variables */
var EJSON;

var require = meteorInstall({"node_modules":{"meteor":{"ejson":{"ejson.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// packages/ejson/ejson.js                                                                                     //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
module.export({
  EJSON: function () {
    return EJSON;
  }
});
var isFunction, isObject, keysOf, lengthOf, hasOwn, convertMapToObject, isArguments, isInfOrNaN, handleError;
module.link("./utils", {
  isFunction: function (v) {
    isFunction = v;
  },
  isObject: function (v) {
    isObject = v;
  },
  keysOf: function (v) {
    keysOf = v;
  },
  lengthOf: function (v) {
    lengthOf = v;
  },
  hasOwn: function (v) {
    hasOwn = v;
  },
  convertMapToObject: function (v) {
    convertMapToObject = v;
  },
  isArguments: function (v) {
    isArguments = v;
  },
  isInfOrNaN: function (v) {
    isInfOrNaN = v;
  },
  handleError: function (v) {
    handleError = v;
  }
}, 0);
var canonicalStringify;
module.link("./stringify", {
  "default": function (v) {
    canonicalStringify = v;
  }
}, 1);
/**
 * @namespace
 * @summary Namespace for EJSON functions
 */
var EJSON = {};

// Custom type interface definition
/**
 * @class CustomType
 * @instanceName customType
 * @memberOf EJSON
 * @summary The interface that a class must satisfy to be able to become an
 * EJSON custom type via EJSON.addType.
 */

/**
 * @function typeName
 * @memberOf EJSON.CustomType
 * @summary Return the tag used to identify this type.  This must match the
 *          tag used to register this type with
 *          [`EJSON.addType`](#ejson_add_type).
 * @locus Anywhere
 * @instance
 */

/**
 * @function toJSONValue
 * @memberOf EJSON.CustomType
 * @summary Serialize this instance into a JSON-compatible value.
 * @locus Anywhere
 * @instance
 */

/**
 * @function clone
 * @memberOf EJSON.CustomType
 * @summary Return a value `r` such that `this.equals(r)` is true, and
 *          modifications to `r` do not affect `this` and vice versa.
 * @locus Anywhere
 * @instance
 */

/**
 * @function equals
 * @memberOf EJSON.CustomType
 * @summary Return `true` if `other` has a value equal to `this`; `false`
 *          otherwise.
 * @locus Anywhere
 * @param {Object} other Another object to compare this to.
 * @instance
 */

var customTypes = new Map();

// Add a custom type, using a method of your choice to get to and
// from a basic JSON-able representation.  The factory argument
// is a function of JSON-able --> your object
// The type you add must have:
// - A toJSONValue() method, so that Meteor can serialize it
// - a typeName() method, to show how to look it up in our type table.
// It is okay if these methods are monkey-patched on.
// EJSON.clone will use toJSONValue and the given factory to produce
// a clone, but you may specify a method clone() that will be
// used instead.
// Similarly, EJSON.equals will use toJSONValue to make comparisons,
// but you may provide a method equals() instead.
/**
 * @summary Add a custom datatype to EJSON.
 * @locus Anywhere
 * @param {String} name A tag for your custom type; must be unique among
 *                      custom data types defined in your project, and must
 *                      match the result of your type's `typeName` method.
 * @param {Function} factory A function that deserializes a JSON-compatible
 *                           value into an instance of your type.  This should
 *                           match the serialization performed by your
 *                           type's `toJSONValue` method.
 */
EJSON.addType = function (name, factory) {
  if (customTypes.has(name)) {
    throw new Error("Type " + name + " already present");
  }
  customTypes.set(name, factory);
};
var builtinConverters = [{
  // Date
  matchJSONValue: function (obj) {
    return hasOwn(obj, '$date') && lengthOf(obj) === 1;
  },
  matchObject: function (obj) {
    return obj instanceof Date;
  },
  toJSONValue: function (obj) {
    return {
      $date: obj.getTime()
    };
  },
  fromJSONValue: function (obj) {
    return new Date(obj.$date);
  }
}, {
  // RegExp
  matchJSONValue: function (obj) {
    return hasOwn(obj, '$regexp') && hasOwn(obj, '$flags') && lengthOf(obj) === 2;
  },
  matchObject: function (obj) {
    return obj instanceof RegExp;
  },
  toJSONValue: function (regexp) {
    return {
      $regexp: regexp.source,
      $flags: regexp.flags
    };
  },
  fromJSONValue: function (obj) {
    // Replaces duplicate / invalid flags.
    return new RegExp(obj.$regexp, obj.$flags
    // Cut off flags at 50 chars to avoid abusing RegExp for DOS.
    .slice(0, 50).replace(/[^gimuy]/g, '').replace(/(.)(?=.*\1)/g, ''));
  }
}, {
  // NaN, Inf, -Inf. (These are the only objects with typeof !== 'object'
  // which we match.)
  matchJSONValue: function (obj) {
    return hasOwn(obj, '$InfNaN') && lengthOf(obj) === 1;
  },
  matchObject: isInfOrNaN,
  toJSONValue: function (obj) {
    var sign;
    if (Number.isNaN(obj)) {
      sign = 0;
    } else if (obj === Infinity) {
      sign = 1;
    } else {
      sign = -1;
    }
    return {
      $InfNaN: sign
    };
  },
  fromJSONValue: function (obj) {
    return obj.$InfNaN / 0;
  }
}, {
  // Binary
  matchJSONValue: function (obj) {
    return hasOwn(obj, '$binary') && lengthOf(obj) === 1;
  },
  matchObject: function (obj) {
    return typeof Uint8Array !== 'undefined' && obj instanceof Uint8Array || obj && hasOwn(obj, '$Uint8ArrayPolyfill');
  },
  toJSONValue: function (obj) {
    return {
      $binary: Base64.encode(obj)
    };
  },
  fromJSONValue: function (obj) {
    return Base64.decode(obj.$binary);
  }
}, {
  // Escaping one level
  matchJSONValue: function (obj) {
    return hasOwn(obj, '$escape') && lengthOf(obj) === 1;
  },
  matchObject: function (obj) {
    var match = false;
    if (obj) {
      var keyCount = lengthOf(obj);
      if (keyCount === 1 || keyCount === 2) {
        match = builtinConverters.some(function (converter) {
          return converter.matchJSONValue(obj);
        });
      }
    }
    return match;
  },
  toJSONValue: function (obj) {
    var newObj = {};
    keysOf(obj).forEach(function (key) {
      newObj[key] = EJSON.toJSONValue(obj[key]);
    });
    return {
      $escape: newObj
    };
  },
  fromJSONValue: function (obj) {
    var newObj = {};
    keysOf(obj.$escape).forEach(function (key) {
      newObj[key] = EJSON.fromJSONValue(obj.$escape[key]);
    });
    return newObj;
  }
}, {
  // Custom
  matchJSONValue: function (obj) {
    return hasOwn(obj, '$type') && hasOwn(obj, '$value') && lengthOf(obj) === 2;
  },
  matchObject: function (obj) {
    return EJSON._isCustomType(obj);
  },
  toJSONValue: function (obj) {
    var jsonValue = Meteor._noYieldsAllowed(function () {
      return obj.toJSONValue();
    });
    return {
      $type: obj.typeName(),
      $value: jsonValue
    };
  },
  fromJSONValue: function (obj) {
    var typeName = obj.$type;
    if (!customTypes.has(typeName)) {
      throw new Error("Custom EJSON type " + typeName + " is not defined");
    }
    var converter = customTypes.get(typeName);
    return Meteor._noYieldsAllowed(function () {
      return converter(obj.$value);
    });
  }
}];
EJSON._isCustomType = function (obj) {
  return obj && isFunction(obj.toJSONValue) && isFunction(obj.typeName) && customTypes.has(obj.typeName());
};
EJSON._getTypes = function () {
  var isOriginal = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  return isOriginal ? customTypes : convertMapToObject(customTypes);
};
EJSON._getConverters = function () {
  return builtinConverters;
};

// Either return the JSON-compatible version of the argument, or undefined (if
// the item isn't itself replaceable, but maybe some fields in it are)
var toJSONValueHelper = function (item) {
  for (var i = 0; i < builtinConverters.length; i++) {
    var converter = builtinConverters[i];
    if (converter.matchObject(item)) {
      return converter.toJSONValue(item);
    }
  }
  return undefined;
};

// for both arrays and objects, in-place modification.
var adjustTypesToJSONValue = function (obj) {
  // Is it an atom that we need to adjust?
  if (obj === null) {
    return null;
  }
  var maybeChanged = toJSONValueHelper(obj);
  if (maybeChanged !== undefined) {
    return maybeChanged;
  }

  // Other atoms are unchanged.
  if (!isObject(obj)) {
    return obj;
  }

  // Iterate over array or object structure.
  keysOf(obj).forEach(function (key) {
    var value = obj[key];
    if (!isObject(value) && value !== undefined && !isInfOrNaN(value)) {
      return; // continue
    }
    var changed = toJSONValueHelper(value);
    if (changed) {
      obj[key] = changed;
      return; // on to the next key
    }
    // if we get here, value is an object but not adjustable
    // at this level.  recurse.
    adjustTypesToJSONValue(value);
  });
  return obj;
};
EJSON._adjustTypesToJSONValue = adjustTypesToJSONValue;

/**
 * @summary Serialize an EJSON-compatible value into its plain JSON
 *          representation.
 * @locus Anywhere
 * @param {EJSON} val A value to serialize to plain JSON.
 */
EJSON.toJSONValue = function (item) {
  var changed = toJSONValueHelper(item);
  if (changed !== undefined) {
    return changed;
  }
  var newItem = item;
  if (isObject(item)) {
    newItem = EJSON.clone(item);
    adjustTypesToJSONValue(newItem);
  }
  return newItem;
};

// Either return the argument changed to have the non-json
// rep of itself (the Object version) or the argument itself.
// DOES NOT RECURSE.  For actually getting the fully-changed value, use
// EJSON.fromJSONValue
var fromJSONValueHelper = function (value) {
  if (isObject(value) && value !== null) {
    var keys = keysOf(value);
    if (keys.length <= 2 && keys.every(function (k) {
      return typeof k === 'string' && k.substr(0, 1) === '$';
    })) {
      for (var i = 0; i < builtinConverters.length; i++) {
        var converter = builtinConverters[i];
        if (converter.matchJSONValue(value)) {
          return converter.fromJSONValue(value);
        }
      }
    }
  }
  return value;
};

// for both arrays and objects. Tries its best to just
// use the object you hand it, but may return something
// different if the object you hand it itself needs changing.
var adjustTypesFromJSONValue = function (obj) {
  if (obj === null) {
    return null;
  }
  var maybeChanged = fromJSONValueHelper(obj);
  if (maybeChanged !== obj) {
    return maybeChanged;
  }

  // Other atoms are unchanged.
  if (!isObject(obj)) {
    return obj;
  }
  keysOf(obj).forEach(function (key) {
    var value = obj[key];
    if (isObject(value)) {
      var changed = fromJSONValueHelper(value);
      if (value !== changed) {
        obj[key] = changed;
        return;
      }
      // if we get here, value is an object but not adjustable
      // at this level.  recurse.
      adjustTypesFromJSONValue(value);
    }
  });
  return obj;
};
EJSON._adjustTypesFromJSONValue = adjustTypesFromJSONValue;

/**
 * @summary Deserialize an EJSON value from its plain JSON representation.
 * @locus Anywhere
 * @param {JSONCompatible} val A value to deserialize into EJSON.
 */
EJSON.fromJSONValue = function (item) {
  var changed = fromJSONValueHelper(item);
  if (changed === item && isObject(item)) {
    changed = EJSON.clone(item);
    adjustTypesFromJSONValue(changed);
  }
  return changed;
};

/**
 * @summary Serialize a value to a string. For EJSON values, the serialization
 *          fully represents the value. For non-EJSON values, serializes the
 *          same way as `JSON.stringify`.
 * @locus Anywhere
 * @param {EJSON} val A value to stringify.
 * @param {Object} [options]
 * @param {Boolean | Integer | String} [options.indent] Indents objects and
 * arrays for easy readability.  When `true`, indents by 2 spaces; when an
 * integer, indents by that number of spaces; and when a string, uses the
 * string as the indentation pattern.
 * @param {Boolean} [options.canonical] When `true`, stringifies keys in an
 *                                    object in sorted order.
 */
EJSON.stringify = handleError(function (item, options) {
  var serialized;
  var json = EJSON.toJSONValue(item);
  if (options && (options.canonical || options.indent)) {
    serialized = canonicalStringify(json, options);
  } else {
    serialized = JSON.stringify(json);
  }
  return serialized;
});

/**
 * @summary Parse a string into an EJSON value. Throws an error if the string
 *          is not valid EJSON.
 * @locus Anywhere
 * @param {String} str A string to parse into an EJSON value.
 */
EJSON.parse = function (item) {
  if (typeof item !== 'string') {
    throw new Error('EJSON.parse argument should be a string');
  }
  return EJSON.fromJSONValue(JSON.parse(item));
};

/**
 * @summary Returns true if `x` is a buffer of binary data, as returned from
 *          [`EJSON.newBinary`](#ejson_new_binary).
 * @param {Object} x The variable to check.
 * @locus Anywhere
 */
EJSON.isBinary = function (obj) {
  return !!(typeof Uint8Array !== 'undefined' && obj instanceof Uint8Array || obj && obj.$Uint8ArrayPolyfill);
};

/**
 * @summary Return true if `a` and `b` are equal to each other.  Return false
 *          otherwise.  Uses the `equals` method on `a` if present, otherwise
 *          performs a deep comparison.
 * @locus Anywhere
 * @param {EJSON} a
 * @param {EJSON} b
 * @param {Object} [options]
 * @param {Boolean} options.keyOrderSensitive Compare in key sensitive order,
 * if supported by the JavaScript implementation.  For example, `{a: 1, b: 2}`
 * is equal to `{b: 2, a: 1}` only when `keyOrderSensitive` is `false`.  The
 * default is `false`.
 */
EJSON.equals = function (a, b, options) {
  var i;
  var keyOrderSensitive = !!(options && options.keyOrderSensitive);
  if (a === b) {
    return true;
  }

  // This differs from the IEEE spec for NaN equality, b/c we don't want
  // anything ever with a NaN to be poisoned from becoming equal to anything.
  if (Number.isNaN(a) && Number.isNaN(b)) {
    return true;
  }

  // if either one is falsy, they'd have to be === to be equal
  if (!a || !b) {
    return false;
  }
  if (!(isObject(a) && isObject(b))) {
    return false;
  }
  if (a instanceof Date && b instanceof Date) {
    return a.valueOf() === b.valueOf();
  }
  if (EJSON.isBinary(a) && EJSON.isBinary(b)) {
    if (a.length !== b.length) {
      return false;
    }
    for (i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }
  if (isFunction(a.equals)) {
    return a.equals(b, options);
  }
  if (isFunction(b.equals)) {
    return b.equals(a, options);
  }

  // Array.isArray works across iframes while instanceof won't
  var aIsArray = Array.isArray(a);
  var bIsArray = Array.isArray(b);

  // if not both or none are array they are not equal
  if (aIsArray !== bIsArray) {
    return false;
  }
  if (aIsArray && bIsArray) {
    if (a.length !== b.length) {
      return false;
    }
    for (i = 0; i < a.length; i++) {
      if (!EJSON.equals(a[i], b[i], options)) {
        return false;
      }
    }
    return true;
  }

  // fallback for custom types that don't implement their own equals
  switch (EJSON._isCustomType(a) + EJSON._isCustomType(b)) {
    case 1:
      return false;
    case 2:
      return EJSON.equals(EJSON.toJSONValue(a), EJSON.toJSONValue(b));
    default: // Do nothing
  }

  // fall back to structural equality of objects
  var ret;
  var aKeys = keysOf(a);
  var bKeys = keysOf(b);
  if (keyOrderSensitive) {
    i = 0;
    ret = aKeys.every(function (key) {
      if (i >= bKeys.length) {
        return false;
      }
      if (key !== bKeys[i]) {
        return false;
      }
      if (!EJSON.equals(a[key], b[bKeys[i]], options)) {
        return false;
      }
      i++;
      return true;
    });
  } else {
    i = 0;
    ret = aKeys.every(function (key) {
      if (!hasOwn(b, key)) {
        return false;
      }
      if (!EJSON.equals(a[key], b[key], options)) {
        return false;
      }
      i++;
      return true;
    });
  }
  return ret && i === bKeys.length;
};

/**
 * @summary Return a deep copy of `val`.
 * @locus Anywhere
 * @param {EJSON} val A value to copy.
 */
EJSON.clone = function (v) {
  var ret;
  if (!isObject(v)) {
    return v;
  }
  if (v === null) {
    return null; // null has typeof "object"
  }
  if (v instanceof Date) {
    return new Date(v.getTime());
  }

  // RegExps are not really EJSON elements (eg we don't define a serialization
  // for them), but they're immutable anyway, so we can support them in clone.
  if (v instanceof RegExp) {
    return v;
  }
  if (EJSON.isBinary(v)) {
    ret = EJSON.newBinary(v.length);
    for (var i = 0; i < v.length; i++) {
      ret[i] = v[i];
    }
    return ret;
  }
  if (Array.isArray(v)) {
    return v.map(EJSON.clone);
  }
  if (isArguments(v)) {
    return Array.from(v).map(EJSON.clone);
  }

  // handle general user-defined typed Objects if they have a clone method
  if (isFunction(v.clone)) {
    return v.clone();
  }

  // handle other custom types
  if (EJSON._isCustomType(v)) {
    return EJSON.fromJSONValue(EJSON.clone(EJSON.toJSONValue(v)), true);
  }

  // handle other objects
  ret = {};
  keysOf(v).forEach(function (key) {
    ret[key] = EJSON.clone(v[key]);
  });
  return ret;
};

/**
 * @summary Allocate a new buffer of binary data that EJSON can serialize.
 * @locus Anywhere
 * @param {Number} size The number of bytes of binary data to allocate.
 */
// EJSON.newBinary is the public documented API for this functionality,
// but the implementation is in the 'base64' package to avoid
// introducing a circular dependency. (If the implementation were here,
// then 'base64' would have to use EJSON.newBinary, and 'ejson' would
// also have to use 'base64'.)
EJSON.newBinary = Base64.newBinary;
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"stringify.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// packages/ejson/stringify.js                                                                                 //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
var _typeof;
module.link("@babel/runtime/helpers/typeof", {
  default: function (v) {
    _typeof = v;
  }
}, 0);
// Based on json2.js from https://github.com/douglascrockford/JSON-js
//
//    json2.js
//    2012-10-08
//
//    Public Domain.
//
//    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

function quote(string) {
  return JSON.stringify(string);
}
var str = function (key, holder, singleIndent, outerIndent, canonical) {
  var value = holder[key];

  // What happens next depends on the value's type.
  switch (_typeof(value)) {
    case 'string':
      return quote(value);
    case 'number':
      // JSON numbers must be finite. Encode non-finite numbers as null.
      return isFinite(value) ? String(value) : 'null';
    case 'boolean':
      return String(value);
    // If the type is 'object', we might be dealing with an object or an array or
    // null.
    case 'object':
      {
        // Due to a specification blunder in ECMAScript, typeof null is 'object',
        // so watch out for that case.
        if (!value) {
          return 'null';
        }
        // Make an array to hold the partial results of stringifying this object
        // value.
        var innerIndent = outerIndent + singleIndent;
        var partial = [];
        var v;

        // Is the value an array?
        if (Array.isArray(value) || {}.hasOwnProperty.call(value, 'callee')) {
          // The value is an array. Stringify every element. Use null as a
          // placeholder for non-JSON values.
          var length = value.length;
          for (var i = 0; i < length; i += 1) {
            partial[i] = str(i, value, singleIndent, innerIndent, canonical) || 'null';
          }

          // Join all of the elements together, separated with commas, and wrap
          // them in brackets.
          if (partial.length === 0) {
            v = '[]';
          } else if (innerIndent) {
            v = '[\n' + innerIndent + partial.join(',\n' + innerIndent) + '\n' + outerIndent + ']';
          } else {
            v = '[' + partial.join(',') + ']';
          }
          return v;
        }

        // Iterate through all of the keys in the object.
        var keys = Object.keys(value);
        if (canonical) {
          keys = keys.sort();
        }
        keys.forEach(function (k) {
          v = str(k, value, singleIndent, innerIndent, canonical);
          if (v) {
            partial.push(quote(k) + (innerIndent ? ': ' : ':') + v);
          }
        });

        // Join all of the member texts together, separated with commas,
        // and wrap them in braces.
        if (partial.length === 0) {
          v = '{}';
        } else if (innerIndent) {
          v = '{\n' + innerIndent + partial.join(',\n' + innerIndent) + '\n' + outerIndent + '}';
        } else {
          v = '{' + partial.join(',') + '}';
        }
        return v;
      }
    default: // Do nothing
  }
};

// If the JSON object does not yet have a stringify method, give it one.
var canonicalStringify = function (value, options) {
  // Make a fake root object containing our value under the key of ''.
  // Return the result of stringifying the value.
  var allOptions = Object.assign({
    indent: '',
    canonical: false
  }, options);
  if (allOptions.indent === true) {
    allOptions.indent = '  ';
  } else if (typeof allOptions.indent === 'number') {
    var newIndent = '';
    for (var i = 0; i < allOptions.indent; i++) {
      newIndent += ' ';
    }
    allOptions.indent = newIndent;
  }
  return str('', {
    '': value
  }, allOptions.indent, '', allOptions.canonical);
};
module.exportDefault(canonicalStringify);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"utils.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// packages/ejson/utils.js                                                                                     //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
var _slicedToArray;
module.link("@babel/runtime/helpers/slicedToArray", {
  default: function (v) {
    _slicedToArray = v;
  }
}, 0);
var _typeof;
module.link("@babel/runtime/helpers/typeof", {
  default: function (v) {
    _typeof = v;
  }
}, 1);
module.export({
  isFunction: function () {
    return isFunction;
  },
  isObject: function () {
    return isObject;
  },
  keysOf: function () {
    return keysOf;
  },
  lengthOf: function () {
    return lengthOf;
  },
  hasOwn: function () {
    return hasOwn;
  },
  convertMapToObject: function () {
    return convertMapToObject;
  },
  isArguments: function () {
    return isArguments;
  },
  isInfOrNaN: function () {
    return isInfOrNaN;
  },
  checkError: function () {
    return checkError;
  },
  handleError: function () {
    return handleError;
  }
});
var isFunction = function (fn) {
  return typeof fn === 'function';
};
var isObject = function (fn) {
  return _typeof(fn) === 'object';
};
var keysOf = function (obj) {
  return Object.keys(obj);
};
var lengthOf = function (obj) {
  return Object.keys(obj).length;
};
var hasOwn = function (obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};
var convertMapToObject = function (map) {
  return Array.from(map).reduce(function (acc, _ref) {
    var _ref2 = _slicedToArray(_ref, 2),
      key = _ref2[0],
      value = _ref2[1];
    // reassign to not create new object
    acc[key] = value;
    return acc;
  }, {});
};
var isArguments = function (obj) {
  return obj != null && hasOwn(obj, 'callee');
};
var isInfOrNaN = function (obj) {
  return Number.isNaN(obj) || obj === Infinity || obj === -Infinity;
};
var checkError = {
  maxStack: function (msgError) {
    return new RegExp('Maximum call stack size exceeded', 'g').test(msgError);
  }
};
var handleError = function (fn) {
  return function () {
    try {
      return fn.apply(this, arguments);
    } catch (error) {
      var isMaxStack = checkError.maxStack(error.message);
      if (isMaxStack) {
        throw new Error('Converting circular structure to JSON');
      }
      throw error;
    }
  };
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      EJSON: EJSON
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/ejson/ejson.js"
  ],
  mainModulePath: "/node_modules/meteor/ejson/ejson.js"
}});
