//////////////////////////////////////////////////////////////////////////
//                                                                      //
// This is a generated file. You can view the original                  //
// source in your browser if your browser supports source maps.         //
// Source maps are supported by all recent versions of Chrome, Safari,  //
// and Firefox, and by Internet Explorer 11.                            //
//                                                                      //
//////////////////////////////////////////////////////////////////////////


Package["core-runtime"].queue("allow-deny",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var LocalCollection = Package.minimongo.LocalCollection;
var Minimongo = Package.minimongo.Minimongo;
var check = Package.check.check;
var Match = Package.check.Match;
var EJSON = Package.ejson.EJSON;
var DDP = Package['ddp-client'].DDP;
var meteorInstall = Package.modules.meteorInstall;
var meteorBabelHelpers = Package.modules.meteorBabelHelpers;
var Promise = Package.promise.Promise;
var Symbol = Package['ecmascript-runtime-client'].Symbol;
var Map = Package['ecmascript-runtime-client'].Map;
var Set = Package['ecmascript-runtime-client'].Set;

/* Package-scope variables */
var AllowDeny;

var require = meteorInstall({"node_modules":{"meteor":{"allow-deny":{"allow-deny.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/allow-deny/allow-deny.js                                                                                 //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
var _regeneratorRuntime;
module.link("@babel/runtime/regenerator", {
  default: function (v) {
    _regeneratorRuntime = v;
  }
}, 0);
var _objectSpread;
module.link("@babel/runtime/helpers/objectSpread2", {
  default: function (v) {
    _objectSpread = v;
  }
}, 1);
var _createForOfIteratorHelperLoose;
module.link("@babel/runtime/helpers/createForOfIteratorHelperLoose", {
  default: function (v) {
    _createForOfIteratorHelperLoose = v;
  }
}, 2);
///
/// Remote methods and access control.
///

var hasOwn = Object.prototype.hasOwnProperty;

// Restrict default mutators on collection. allow() and deny() take the
// same options:
//
// options.insertAsync {Function(userId, doc)}
//   return true to allow/deny adding this document
//
// options.updateAsync {Function(userId, docs, fields, modifier)}
//   return true to allow/deny updating these documents.
//   `fields` is passed as an array of fields that are to be modified
//
// options.removeAsync {Function(userId, docs)}
//   return true to allow/deny removing these documents
//
// options.fetch {Array}
//   Fields to fetch for these validators. If any call to allow or deny
//   does not have this option then all fields are loaded.
//
// allow and deny can be called multiple times. The validators are
// evaluated as follows:
// - If neither deny() nor allow() has been called on the collection,
//   then the request is allowed if and only if the "insecure" smart
//   package is in use.
// - Otherwise, if any deny() function returns true, the request is denied.
// - Otherwise, if any allow() function returns true, the request is allowed.
// - Otherwise, the request is denied.
//
// Meteor may call your deny() and allow() functions in any order, and may not
// call all of them if it is able to make a decision without calling them all
// (so don't include side effects).

AllowDeny = {
  CollectionPrototype: {}
};

// In the `mongo` package, we will extend Mongo.Collection.prototype with these
// methods
var CollectionPrototype = AllowDeny.CollectionPrototype;

/**
 * @summary Allow users to write directly to this collection from client code, subject to limitations you define.
 * @locus Server
 * @method allow
 * @memberOf Mongo.Collection
 * @instance
 * @param {Object} options
 * @param {Function} options.insert,update,remove Functions that look at a proposed modification to the database and return true if it should be allowed.
 * @param {String[]} options.fetch Optional performance enhancement. Limits the fields that will be fetched from the database for inspection by your `update` and `remove` functions.
 * @param {Function} options.transform Overrides `transform` on the  [`Collection`](#collections).  Pass `null` to disable transformation.
 */
CollectionPrototype.allow = function (options) {
  addValidator(this, 'allow', options);
};

/**
 * @summary Override `allow` rules.
 * @locus Server
 * @method deny
 * @memberOf Mongo.Collection
 * @instance
 * @param {Object} options
 * @param {Function} options.insert,update,remove Functions that look at a proposed modification to the database and return true if it should be denied, even if an [allow](#allow) rule says otherwise.
 * @param {String[]} options.fetch Optional performance enhancement. Limits the fields that will be fetched from the database for inspection by your `update` and `remove` functions.
 * @param {Function} options.transform Overrides `transform` on the  [`Collection`](#collections).  Pass `null` to disable transformation.
 */
CollectionPrototype.deny = function (options) {
  addValidator(this, 'deny', options);
};
CollectionPrototype._defineMutationMethods = function (options) {
  var self = this;
  options = options || {};

  // set to true once we call any allow or deny methods. If true, use
  // allow/deny semantics. If false, use insecure mode semantics.
  self._restricted = false;

  // Insecure mode (default to allowing writes). Defaults to 'undefined' which
  // means insecure iff the insecure package is loaded. This property can be
  // overriden by tests or packages wishing to change insecure mode behavior of
  // their collections.
  self._insecure = undefined;
  self._validators = {
    insert: {
      allow: [],
      deny: []
    },
    update: {
      allow: [],
      deny: []
    },
    remove: {
      allow: [],
      deny: []
    },
    insertAsync: {
      allow: [],
      deny: []
    },
    updateAsync: {
      allow: [],
      deny: []
    },
    removeAsync: {
      allow: [],
      deny: []
    },
    upsertAsync: {
      allow: [],
      deny: []
    },
    // dummy arrays; can't set these!
    fetch: [],
    fetchAllFields: false
  };
  if (!self._name) return; // anonymous collection

  // XXX Think about method namespacing. Maybe methods should be
  // "Meteor:Mongo:insertAsync/NAME"?
  self._prefix = '/' + self._name + '/';

  // Mutation Methods
  // Minimongo on the server gets no stubs; instead, by default
  // it wait()s until its result is ready, yielding.
  // This matches the behavior of macromongo on the server better.
  // XXX see #MeteorServerNull
  if (self._connection && (self._connection === Meteor.server || Meteor.isClient)) {
    var m = {};
    ['insertAsync', 'updateAsync', 'removeAsync', 'insert', 'update', 'remove'].forEach(function (method) {
      var methodName = self._prefix + method;
      if (options.useExisting) {
        var handlerPropName = Meteor.isClient ? '_methodHandlers' : 'method_handlers';
        // Do not try to create additional methods if this has already been called.
        // (Otherwise the .methods() call below will throw an error.)
        if (self._connection[handlerPropName] && typeof self._connection[handlerPropName][methodName] === 'function') return;
      }
      var isInsert = function (name) {
        return name.includes('insert');
      };
      m[methodName] = function /* ... */
      () {
        // All the methods do their own validation, instead of using check().
        check(arguments, [Match.Any]);
        var args = Array.from(arguments);
        try {
          // For an insert/insertAsync, if the client didn't specify an _id, generate one
          // now; because this uses DDP.randomStream, it will be consistent with
          // what the client generated. We generate it now rather than later so
          // that if (eg) an allow/deny rule does an insert/insertAsync to the same
          // collection (not that it really should), the generated _id will
          // still be the first use of the stream and will be consistent.
          //
          // However, we don't actually stick the _id onto the document yet,
          // because we want allow/deny rules to be able to differentiate
          // between arbitrary client-specified _id fields and merely
          // client-controlled-via-randomSeed fields.
          var generatedId = null;
          if (isInsert(method) && !hasOwn.call(args[0], '_id')) {
            generatedId = self._makeNewID();
          }
          if (this.isSimulation) {
            // In a client simulation, you can do any mutation (even with a
            // complex selector).
            if (generatedId !== null) {
              args[0]._id = generatedId;
            }
            return self._collection[method].apply(self._collection, args);
          }

          // This is the server receiving a method call from the client.

          // We don't allow arbitrary selectors in mutations from the client: only
          // single-ID selectors.
          if (!isInsert(method)) throwIfSelectorIsNotId(args[0], method);
          var syncMethodName = method.replace('Async', '');
          var syncValidatedMethodName = '_validated' + method.charAt(0).toUpperCase() + syncMethodName.slice(1);
          // it forces to use async validated behavior
          var validatedMethodName = syncValidatedMethodName + 'Async';
          if (self._restricted) {
            // short circuit if there is no way it will pass.
            if (self._validators[syncMethodName].allow.length === 0) {
              throw new Meteor.Error(403, 'Access denied. No allow validators set on restricted ' + "collection for method '" + method + "'.");
            }
            args.unshift(this.userId);
            isInsert(method) && args.push(generatedId);
            return self[validatedMethodName].apply(self, args);
          } else if (self._isInsecure()) {
            if (generatedId !== null) args[0]._id = generatedId;
            // In insecure mode we use the server _collection methods, and these sync methods
            // do not exist in the server anymore, so we have this mapper to call the async methods
            // instead.
            var syncMethodsMapper = {
              insert: "insertAsync",
              update: "updateAsync",
              remove: "removeAsync"
            };

            // In insecure mode, allow any mutation (with a simple selector).
            // XXX This is kind of bogus.  Instead of blindly passing whatever
            //     we get from the network to this function, we should actually
            //     know the correct arguments for the function and pass just
            //     them.  For example, if you have an extraneous extra null
            //     argument and this is Mongo on the server, the .wrapAsync'd
            //     functions like update will get confused and pass the
            //     "fut.resolver()" in the wrong slot, where _update will never
            //     invoke it. Bam, broken DDP connection.  Probably should just
            //     take this whole method and write it three times, invoking
            //     helpers for the common code.
            return self._collection[syncMethodsMapper[method] || method].apply(self._collection, args);
          } else {
            // In secure mode, if we haven't called allow or deny, then nothing
            // is permitted.
            throw new Meteor.Error(403, 'Access denied');
          }
        } catch (e) {
          if (e.name === 'MongoError' ||
          // for old versions of MongoDB (probably not necessary but it's here just in case)
          e.name === 'BulkWriteError' ||
          // for newer versions of MongoDB (https://docs.mongodb.com/drivers/node/current/whats-new/#bulkwriteerror---mongobulkwriteerror)
          e.name === 'MongoBulkWriteError' || e.name === 'MinimongoError') {
            throw new Meteor.Error(409, e.toString());
          } else {
            throw e;
          }
        }
      };
    });
    self._connection.methods(m);
  }
};
CollectionPrototype._updateFetch = function (fields) {
  var self = this;
  if (!self._validators.fetchAllFields) {
    if (fields) {
      var union = Object.create(null);
      var add = function (names) {
        return names && names.forEach(function (name) {
          return union[name] = 1;
        });
      };
      add(self._validators.fetch);
      add(fields);
      self._validators.fetch = Object.keys(union);
    } else {
      self._validators.fetchAllFields = true;
      // clear fetch just to make sure we don't accidentally read it
      self._validators.fetch = null;
    }
  }
};
CollectionPrototype._isInsecure = function () {
  var self = this;
  if (self._insecure === undefined) return !!Package.insecure;
  return self._insecure;
};
function asyncSome(array, predicate) {
  var _iterator, _step, item;
  return _regeneratorRuntime.async(function (_context) {
    while (1) switch (_context.prev = _context.next) {
      case 0:
        _iterator = _createForOfIteratorHelperLoose(array);
      case 1:
        if ((_step = _iterator()).done) {
          _context.next = 4;
          break;
        }
        item = _step.value;
        _context.next = 2;
        return _regeneratorRuntime.awrap(predicate(item));
      case 2:
        if (!_context.sent) {
          _context.next = 3;
          break;
        }
        return _context.abrupt("return", true);
      case 3:
        _context.next = 1;
        break;
      case 4:
        return _context.abrupt("return", false);
      case 5:
      case "end":
        return _context.stop();
    }
  }, null, null, null, Promise);
}
function asyncEvery(array, predicate) {
  var _iterator2, _step2, item;
  return _regeneratorRuntime.async(function (_context2) {
    while (1) switch (_context2.prev = _context2.next) {
      case 0:
        _iterator2 = _createForOfIteratorHelperLoose(array);
      case 1:
        if ((_step2 = _iterator2()).done) {
          _context2.next = 4;
          break;
        }
        item = _step2.value;
        _context2.next = 2;
        return _regeneratorRuntime.awrap(predicate(item));
      case 2:
        if (_context2.sent) {
          _context2.next = 3;
          break;
        }
        return _context2.abrupt("return", false);
      case 3:
        _context2.next = 1;
        break;
      case 4:
        return _context2.abrupt("return", true);
      case 5:
      case "end":
        return _context2.stop();
    }
  }, null, null, null, Promise);
}
CollectionPrototype._validatedInsertAsync = function () {
  function _callee3(userId, doc, generatedId) {
    var self;
    return _regeneratorRuntime.async(function (_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          self = this; // call user validators.
          // Any deny returns true means denied.
          _context5.next = 1;
          return _regeneratorRuntime.awrap(asyncSome(self._validators.insert.deny, function () {
            function _callee(validator) {
              var result, _t;
              return _regeneratorRuntime.async(function (_context3) {
                while (1) switch (_context3.prev = _context3.next) {
                  case 0:
                    result = validator(userId, docToValidate(validator, doc, generatedId));
                    if (!Meteor._isPromise(result)) {
                      _context3.next = 2;
                      break;
                    }
                    _context3.next = 1;
                    return _regeneratorRuntime.awrap(result);
                  case 1:
                    _t = _context3.sent;
                    _context3.next = 3;
                    break;
                  case 2:
                    _t = result;
                  case 3:
                    return _context3.abrupt("return", _t);
                  case 4:
                  case "end":
                    return _context3.stop();
                }
              }, null, null, null, Promise);
            }
            return _callee;
          }()));
        case 1:
          if (!_context5.sent) {
            _context5.next = 2;
            break;
          }
          throw new Meteor.Error(403, "Access denied");
        case 2:
          _context5.next = 3;
          return _regeneratorRuntime.awrap(asyncEvery(self._validators.insert.allow, function () {
            function _callee2(validator) {
              var result, _t2;
              return _regeneratorRuntime.async(function (_context4) {
                while (1) switch (_context4.prev = _context4.next) {
                  case 0:
                    result = validator(userId, docToValidate(validator, doc, generatedId));
                    if (!Meteor._isPromise(result)) {
                      _context4.next = 2;
                      break;
                    }
                    _context4.next = 1;
                    return _regeneratorRuntime.awrap(result);
                  case 1:
                    _t2 = _context4.sent;
                    _context4.next = 3;
                    break;
                  case 2:
                    _t2 = result;
                  case 3:
                    return _context4.abrupt("return", !_t2);
                  case 4:
                  case "end":
                    return _context4.stop();
                }
              }, null, null, null, Promise);
            }
            return _callee2;
          }()));
        case 3:
          if (!_context5.sent) {
            _context5.next = 4;
            break;
          }
          throw new Meteor.Error(403, "Access denied");
        case 4:
          // If we generated an ID above, insertAsync it now: after the validation, but
          // before actually inserting.
          if (generatedId !== null) doc._id = generatedId;
          return _context5.abrupt("return", self._collection.insertAsync.call(self._collection, doc));
        case 5:
        case "end":
          return _context5.stop();
      }
    }, null, this, null, Promise);
  }
  return _callee3;
}();

// Simulate a mongo `update` operation while validating that the access
// control rules set by calls to `allow/deny` are satisfied. If all
// pass, rewrite the mongo operation to use $in to set the list of
// document ids to change ##ValidatedChange
CollectionPrototype._validatedUpdateAsync = function () {
  function _callee6(userId, selector, mutator, options) {
    var self, noReplaceError, mutatorKeys, modifiedFields, fields, findOptions, doc;
    return _regeneratorRuntime.async(function (_context8) {
      while (1) switch (_context8.prev = _context8.next) {
        case 0:
          self = this;
          check(mutator, Object);
          options = Object.assign(Object.create(null), options);
          if (LocalCollection._selectorIsIdPerhapsAsObject(selector)) {
            _context8.next = 1;
            break;
          }
          throw new Error("validated update should be of a single ID");
        case 1:
          if (!options.upsert) {
            _context8.next = 2;
            break;
          }
          throw new Meteor.Error(403, "Access denied. Upserts not " + "allowed in a restricted collection.");
        case 2:
          noReplaceError = "Access denied. In a restricted collection you can only" + " update documents, not replace them. Use a Mongo update operator, such " + "as '$set'.";
          mutatorKeys = Object.keys(mutator); // compute modified fields
          modifiedFields = {};
          if (!(mutatorKeys.length === 0)) {
            _context8.next = 3;
            break;
          }
          throw new Meteor.Error(403, noReplaceError);
        case 3:
          mutatorKeys.forEach(function (op) {
            var params = mutator[op];
            if (op.charAt(0) !== '$') {
              throw new Meteor.Error(403, noReplaceError);
            } else if (!hasOwn.call(ALLOWED_UPDATE_OPERATIONS, op)) {
              throw new Meteor.Error(403, "Access denied. Operator " + op + " not allowed in a restricted collection.");
            } else {
              Object.keys(params).forEach(function (field) {
                // treat dotted fields as if they are replacing their
                // top-level part
                if (field.indexOf('.') !== -1) field = field.substring(0, field.indexOf('.'));

                // record the field we are trying to change
                modifiedFields[field] = true;
              });
            }
          });
          fields = Object.keys(modifiedFields);
          findOptions = {
            transform: null
          };
          if (!self._validators.fetchAllFields) {
            findOptions.fields = {};
            self._validators.fetch.forEach(function (fieldName) {
              findOptions.fields[fieldName] = 1;
            });
          }
          _context8.next = 4;
          return _regeneratorRuntime.awrap(self._collection.findOneAsync(selector, findOptions));
        case 4:
          doc = _context8.sent;
          if (doc) {
            _context8.next = 5;
            break;
          }
          return _context8.abrupt("return", 0);
        case 5:
          _context8.next = 6;
          return _regeneratorRuntime.awrap(asyncSome(self._validators.update.deny, function () {
            function _callee4(validator) {
              var factoriedDoc, result, _t3;
              return _regeneratorRuntime.async(function (_context6) {
                while (1) switch (_context6.prev = _context6.next) {
                  case 0:
                    factoriedDoc = transformDoc(validator, doc);
                    result = validator(userId, factoriedDoc, fields, mutator);
                    if (!Meteor._isPromise(result)) {
                      _context6.next = 2;
                      break;
                    }
                    _context6.next = 1;
                    return _regeneratorRuntime.awrap(result);
                  case 1:
                    _t3 = _context6.sent;
                    _context6.next = 3;
                    break;
                  case 2:
                    _t3 = result;
                  case 3:
                    return _context6.abrupt("return", _t3);
                  case 4:
                  case "end":
                    return _context6.stop();
                }
              }, null, null, null, Promise);
            }
            return _callee4;
          }()));
        case 6:
          if (!_context8.sent) {
            _context8.next = 7;
            break;
          }
          throw new Meteor.Error(403, "Access denied");
        case 7:
          _context8.next = 8;
          return _regeneratorRuntime.awrap(asyncEvery(self._validators.update.allow, function () {
            function _callee5(validator) {
              var factoriedDoc, result, _t4;
              return _regeneratorRuntime.async(function (_context7) {
                while (1) switch (_context7.prev = _context7.next) {
                  case 0:
                    factoriedDoc = transformDoc(validator, doc);
                    result = validator(userId, factoriedDoc, fields, mutator);
                    if (!Meteor._isPromise(result)) {
                      _context7.next = 2;
                      break;
                    }
                    _context7.next = 1;
                    return _regeneratorRuntime.awrap(result);
                  case 1:
                    _t4 = _context7.sent;
                    _context7.next = 3;
                    break;
                  case 2:
                    _t4 = result;
                  case 3:
                    return _context7.abrupt("return", !_t4);
                  case 4:
                  case "end":
                    return _context7.stop();
                }
              }, null, null, null, Promise);
            }
            return _callee5;
          }()));
        case 8:
          if (!_context8.sent) {
            _context8.next = 9;
            break;
          }
          throw new Meteor.Error(403, "Access denied");
        case 9:
          options._forbidReplace = true;

          // Back when we supported arbitrary client-provided selectors, we actually
          // rewrote the selector to include an _id clause before passing to Mongo to
          // avoid races, but since selector is guaranteed to already just be an ID, we
          // don't have to any more.
          return _context8.abrupt("return", self._collection.updateAsync.call(self._collection, selector, mutator, options));
        case 10:
        case "end":
          return _context8.stop();
      }
    }, null, this, null, Promise);
  }
  return _callee6;
}();

// Only allow these operations in validated updates. Specifically
// whitelist operations, rather than blacklist, so new complex
// operations that are added aren't automatically allowed. A complex
// operation is one that does more than just modify its target
// field. For now this contains all update operations except '$rename'.
// http://docs.mongodb.org/manual/reference/operators/#update
var ALLOWED_UPDATE_OPERATIONS = {
  $inc: 1,
  $set: 1,
  $unset: 1,
  $addToSet: 1,
  $pop: 1,
  $pullAll: 1,
  $pull: 1,
  $pushAll: 1,
  $push: 1,
  $bit: 1
};

// Simulate a mongo `remove` operation while validating access control
// rules. See #ValidatedChange
CollectionPrototype._validatedRemoveAsync = function () {
  function _callee9(userId, selector) {
    var self, findOptions, doc;
    return _regeneratorRuntime.async(function (_context1) {
      while (1) switch (_context1.prev = _context1.next) {
        case 0:
          self = this;
          findOptions = {
            transform: null
          };
          if (!self._validators.fetchAllFields) {
            findOptions.fields = {};
            self._validators.fetch.forEach(function (fieldName) {
              findOptions.fields[fieldName] = 1;
            });
          }
          _context1.next = 1;
          return _regeneratorRuntime.awrap(self._collection.findOneAsync(selector, findOptions));
        case 1:
          doc = _context1.sent;
          if (doc) {
            _context1.next = 2;
            break;
          }
          return _context1.abrupt("return", 0);
        case 2:
          _context1.next = 3;
          return _regeneratorRuntime.awrap(asyncSome(self._validators.remove.deny, function () {
            function _callee7(validator) {
              var result, _t5;
              return _regeneratorRuntime.async(function (_context9) {
                while (1) switch (_context9.prev = _context9.next) {
                  case 0:
                    result = validator(userId, transformDoc(validator, doc));
                    if (!Meteor._isPromise(result)) {
                      _context9.next = 2;
                      break;
                    }
                    _context9.next = 1;
                    return _regeneratorRuntime.awrap(result);
                  case 1:
                    _t5 = _context9.sent;
                    _context9.next = 3;
                    break;
                  case 2:
                    _t5 = result;
                  case 3:
                    return _context9.abrupt("return", _t5);
                  case 4:
                  case "end":
                    return _context9.stop();
                }
              }, null, null, null, Promise);
            }
            return _callee7;
          }()));
        case 3:
          if (!_context1.sent) {
            _context1.next = 4;
            break;
          }
          throw new Meteor.Error(403, "Access denied");
        case 4:
          _context1.next = 5;
          return _regeneratorRuntime.awrap(asyncEvery(self._validators.remove.allow, function () {
            function _callee8(validator) {
              var result, _t6;
              return _regeneratorRuntime.async(function (_context0) {
                while (1) switch (_context0.prev = _context0.next) {
                  case 0:
                    result = validator(userId, transformDoc(validator, doc));
                    if (!Meteor._isPromise(result)) {
                      _context0.next = 2;
                      break;
                    }
                    _context0.next = 1;
                    return _regeneratorRuntime.awrap(result);
                  case 1:
                    _t6 = _context0.sent;
                    _context0.next = 3;
                    break;
                  case 2:
                    _t6 = result;
                  case 3:
                    return _context0.abrupt("return", !_t6);
                  case 4:
                  case "end":
                    return _context0.stop();
                }
              }, null, null, null, Promise);
            }
            return _callee8;
          }()));
        case 5:
          if (!_context1.sent) {
            _context1.next = 6;
            break;
          }
          throw new Meteor.Error(403, "Access denied");
        case 6:
          return _context1.abrupt("return", self._collection.removeAsync.call(self._collection, selector));
        case 7:
        case "end":
          return _context1.stop();
      }
    }, null, this, null, Promise);
  }
  return _callee9;
}();
CollectionPrototype._callMutatorMethodAsync = function () {
  function _callMutatorMethodAsync(name, args) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    // For two out of three mutator methods, the first argument is a selector
    var firstArgIsSelector = name === "updateAsync" || name === "removeAsync";
    if (firstArgIsSelector && !alreadyInSimulation()) {
      // If we're about to actually send an RPC, we should throw an error if
      // this is a non-ID selector, because the mutation methods only allow
      // single-ID selectors. (If we don't throw here, we'll see flicker.)
      throwIfSelectorIsNotId(args[0], name);
    }
    var mutatorMethodName = this._prefix + name;
    return this._connection.applyAsync(mutatorMethodName, args, _objectSpread({
      returnStubValue: this.resolverType === 'stub' || this.resolverType == null,
      // StubStream is only used for testing where you don't care about the server
      returnServerResultPromise: !this._connection._stream._isStub && this.resolverType !== 'stub'
    }, options));
  }
  return _callMutatorMethodAsync;
}();
CollectionPrototype._callMutatorMethod = function () {
  function _callMutatorMethod(name, args, callback) {
    if (Meteor.isClient && !callback && !alreadyInSimulation()) {
      // Client can't block, so it can't report errors by exception,
      // only by callback. If they forget the callback, give them a
      // default one that logs the error, so they aren't totally
      // baffled if their writes don't work because their database is
      // down.
      // Don't give a default callback in simulation, because inside stubs we
      // want to return the results from the local collection immediately and
      // not force a callback.
      callback = function (err) {
        if (err) Meteor._debug(name + " failed", err);
      };
    }

    // For two out of three mutator methods, the first argument is a selector
    var firstArgIsSelector = name === "update" || name === "remove";
    if (firstArgIsSelector && !alreadyInSimulation()) {
      // If we're about to actually send an RPC, we should throw an error if
      // this is a non-ID selector, because the mutation methods only allow
      // single-ID selectors. (If we don't throw here, we'll see flicker.)
      throwIfSelectorIsNotId(args[0], name);
    }
    var mutatorMethodName = this._prefix + name;
    return this._connection.apply(mutatorMethodName, args, {
      returnStubValue: true
    }, callback);
  }
  return _callMutatorMethod;
}();
function transformDoc(validator, doc) {
  if (validator.transform) return validator.transform(doc);
  return doc;
}
function docToValidate(validator, doc, generatedId) {
  var ret = doc;
  if (validator.transform) {
    ret = EJSON.clone(doc);
    // If you set a server-side transform on your collection, then you don't get
    // to tell the difference between "client specified the ID" and "server
    // generated the ID", because transforms expect to get _id.  If you want to
    // do that check, you can do it with a specific
    // `C.allow({insertAsync: f, transform: null})` validator.
    if (generatedId !== null) {
      ret._id = generatedId;
    }
    ret = validator.transform(ret);
  }
  return ret;
}
function addValidator(collection, allowOrDeny, options) {
  // validate keys
  var validKeysRegEx = /^(?:insertAsync|updateAsync|removeAsync|insert|update|remove|fetch|transform)$/;
  Object.keys(options).forEach(function (key) {
    if (!validKeysRegEx.test(key)) throw new Error(allowOrDeny + ": Invalid key: " + key);

    // TODO deprecated async config on future versions
    var isAsyncKey = key.includes('Async');
    if (isAsyncKey) {
      var syncKey = key.replace('Async', '');
      Meteor.deprecate(allowOrDeny + (": The \"" + key + "\" key is deprecated. Use \"" + syncKey + "\" instead."));
    }
  });
  collection._restricted = true;
  ['insertAsync', 'updateAsync', 'removeAsync', 'insert', 'update', 'remove'].forEach(function (name) {
    if (hasOwn.call(options, name)) {
      if (!(options[name] instanceof Function)) {
        throw new Error(allowOrDeny + ': Value for `' + name + '` must be a function');
      }

      // If the transform is specified at all (including as 'null') in this
      // call, then take that; otherwise, take the transform from the
      // collection.
      if (options.transform === undefined) {
        options[name].transform = collection._transform; // already wrapped
      } else {
        options[name].transform = LocalCollection.wrapTransform(options.transform);
      }
      var isAsyncName = name.includes('Async');
      var validatorSyncName = isAsyncName ? name.replace('Async', '') : name;
      collection._validators[validatorSyncName][allowOrDeny].push(options[name]);
    }
  });

  // Only updateAsync the fetch fields if we're passed things that affect
  // fetching. This way allow({}) and allow({insertAsync: f}) don't result in
  // setting fetchAllFields
  if (options.updateAsync || options.removeAsync || options.fetch) {
    if (options.fetch && !(options.fetch instanceof Array)) {
      throw new Error(allowOrDeny + ": Value for `fetch` must be an array");
    }
    collection._updateFetch(options.fetch);
  }
}
function throwIfSelectorIsNotId(selector, methodName) {
  if (!LocalCollection._selectorIsIdPerhapsAsObject(selector)) {
    throw new Meteor.Error(403, "Not permitted. Untrusted code may only " + methodName + " documents by ID.");
  }
}
;

// Determine if we are in a DDP method simulation
function alreadyInSimulation() {
  var CurrentInvocation = DDP._CurrentMethodInvocation ||
  // For backwards compatibility, as explained in this issue:
  // https://github.com/meteor/meteor/issues/8947
  DDP._CurrentInvocation;
  var enclosing = CurrentInvocation.get();
  return enclosing && enclosing.isSimulation;
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      AllowDeny: AllowDeny
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/allow-deny/allow-deny.js"
  ]
}});
