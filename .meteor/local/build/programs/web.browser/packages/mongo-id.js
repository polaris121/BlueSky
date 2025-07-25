//////////////////////////////////////////////////////////////////////////
//                                                                      //
// This is a generated file. You can view the original                  //
// source in your browser if your browser supports source maps.         //
// Source maps are supported by all recent versions of Chrome, Safari,  //
// and Firefox, and by Internet Explorer 11.                            //
//                                                                      //
//////////////////////////////////////////////////////////////////////////


Package["core-runtime"].queue("mongo-id",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EJSON = Package.ejson.EJSON;
var Random = Package.random.Random;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var MongoID;

var require = meteorInstall({"node_modules":{"meteor":{"mongo-id":{"id.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                           //
// packages/mongo-id/id.js                                                                   //
//                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////
                                                                                             //
module.export({
  MongoID: () => MongoID
});
let EJSON;
module.link("meteor/ejson", {
  EJSON(v) {
    EJSON = v;
  }
}, 0);
let Random;
module.link("meteor/random", {
  Random(v) {
    Random = v;
  }
}, 1);
const MongoID = {};
MongoID._looksLikeObjectID = str => str.length === 24 && /^[0-9a-f]*$/.test(str);
MongoID.ObjectID = class ObjectID {
  constructor(hexString) {
    //random-based impl of Mongo ObjectID
    if (hexString) {
      hexString = hexString.toLowerCase();
      if (!MongoID._looksLikeObjectID(hexString)) {
        throw new Error('Invalid hexadecimal string for creating an ObjectID');
      }
      // meant to work with _.isEqual(), which relies on structural equality
      this._str = hexString;
    } else {
      this._str = Random.hexString(24);
    }
  }
  equals(other) {
    return other instanceof MongoID.ObjectID && this.valueOf() === other.valueOf();
  }
  toString() {
    return "ObjectID(\"".concat(this._str, "\")");
  }
  clone() {
    return new MongoID.ObjectID(this._str);
  }
  typeName() {
    return 'oid';
  }
  getTimestamp() {
    return Number.parseInt(this._str.substr(0, 8), 16);
  }
  valueOf() {
    return this._str;
  }
  toJSONValue() {
    return this.valueOf();
  }
  toHexString() {
    return this.valueOf();
  }
};
EJSON.addType('oid', str => new MongoID.ObjectID(str));
MongoID.idStringify = id => {
  if (id instanceof MongoID.ObjectID) {
    return id.valueOf();
  } else if (typeof id === 'string') {
    var firstChar = id.charAt(0);
    if (id === '') {
      return id;
    } else if (firstChar === '-' ||
    // escape previously dashed strings
    firstChar === '~' ||
    // escape escaped numbers, true, false
    MongoID._looksLikeObjectID(id) ||
    // escape object-id-form strings
    firstChar === '{') {
      // escape object-form strings, for maybe implementing later
      return "-".concat(id);
    } else {
      return id; // other strings go through unchanged.
    }
  } else if (id === undefined) {
    return '-';
  } else if (typeof id === 'object' && id !== null) {
    throw new Error('Meteor does not currently support objects other than ObjectID as ids');
  } else {
    // Numbers, true, false, null
    return "~".concat(JSON.stringify(id));
  }
};
MongoID.idParse = id => {
  var firstChar = id.charAt(0);
  if (id === '') {
    return id;
  } else if (id === '-') {
    return undefined;
  } else if (firstChar === '-') {
    return id.substr(1);
  } else if (firstChar === '~') {
    return JSON.parse(id.substr(1));
  } else if (MongoID._looksLikeObjectID(id)) {
    return new MongoID.ObjectID(id);
  } else {
    return id;
  }
};
///////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      MongoID: MongoID
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/mongo-id/id.js"
  ],
  mainModulePath: "/node_modules/meteor/mongo-id/id.js"
}});
