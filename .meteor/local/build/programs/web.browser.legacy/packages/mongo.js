//////////////////////////////////////////////////////////////////////////
//                                                                      //
// This is a generated file. You can view the original                  //
// source in your browser if your browser supports source maps.         //
// Source maps are supported by all recent versions of Chrome, Safari,  //
// and Firefox, and by Internet Explorer 11.                            //
//                                                                      //
//////////////////////////////////////////////////////////////////////////


Package["core-runtime"].queue("mongo",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var AllowDeny = Package['allow-deny'].AllowDeny;
var Random = Package.random.Random;
var EJSON = Package.ejson.EJSON;
var LocalCollection = Package.minimongo.LocalCollection;
var Minimongo = Package.minimongo.Minimongo;
var DDP = Package['ddp-client'].DDP;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var DiffSequence = Package['diff-sequence'].DiffSequence;
var MongoID = Package['mongo-id'].MongoID;
var check = Package.check.check;
var Match = Package.check.Match;
var Log = Package.logging.Log;
var meteorInstall = Package.modules.meteorInstall;
var meteorBabelHelpers = Package.modules.meteorBabelHelpers;
var Promise = Package.promise.Promise;
var Symbol = Package['ecmascript-runtime-client'].Symbol;
var Map = Package['ecmascript-runtime-client'].Map;
var Set = Package['ecmascript-runtime-client'].Set;

/* Package-scope variables */
var Mongo;

var require = meteorInstall({"node_modules":{"meteor":{"mongo":{"local_collection_driver.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/mongo/local_collection_driver.js                                                                          //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.export({
  LocalCollectionDriver: function () {
    return LocalCollectionDriver;
  }
});
var LocalCollectionDriver = new (/*#__PURE__*/function () {
  function LocalCollectionDriver() {
    this.noConnCollections = Object.create(null);
  }
  var _proto = LocalCollectionDriver.prototype;
  _proto.open = function () {
    function open(name, conn) {
      if (!name) {
        return new LocalCollection();
      }
      if (!conn) {
        return ensureCollection(name, this.noConnCollections);
      }
      if (!conn._mongo_livedata_collections) {
        conn._mongo_livedata_collections = Object.create(null);
      }

      // XXX is there a way to keep track of a connection's collections without
      // dangling it off the connection object?
      return ensureCollection(name, conn._mongo_livedata_collections);
    }
    return open;
  }();
  return LocalCollectionDriver;
}())();
function ensureCollection(name, collections) {
  return name in collections ? collections[name] : collections[name] = new LocalCollection(name);
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"collection":{"collection.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/mongo/collection/collection.js                                                                            //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
!function (module1) {
  var _regeneratorRuntime;
  module1.link("@babel/runtime/regenerator", {
    default: function (v) {
      _regeneratorRuntime = v;
    }
  }, 0);
  var _objectSpread;
  module1.link("@babel/runtime/helpers/objectSpread2", {
    default: function (v) {
      _objectSpread = v;
    }
  }, 1);
  var _slicedToArray;
  module1.link("@babel/runtime/helpers/slicedToArray", {
    default: function (v) {
      _slicedToArray = v;
    }
  }, 2);
  var normalizeProjection;
  module1.link("../mongo_utils", {
    normalizeProjection: function (v) {
      normalizeProjection = v;
    }
  }, 0);
  var AsyncMethods;
  module1.link("./methods_async", {
    AsyncMethods: function (v) {
      AsyncMethods = v;
    }
  }, 1);
  var SyncMethods;
  module1.link("./methods_sync", {
    SyncMethods: function (v) {
      SyncMethods = v;
    }
  }, 2);
  var IndexMethods;
  module1.link("./methods_index", {
    IndexMethods: function (v) {
      IndexMethods = v;
    }
  }, 3);
  var ID_GENERATORS, normalizeOptions, setupAutopublish, setupConnection, setupDriver, setupMutationMethods, validateCollectionName;
  module1.link("./collection_utils", {
    ID_GENERATORS: function (v) {
      ID_GENERATORS = v;
    },
    normalizeOptions: function (v) {
      normalizeOptions = v;
    },
    setupAutopublish: function (v) {
      setupAutopublish = v;
    },
    setupConnection: function (v) {
      setupConnection = v;
    },
    setupDriver: function (v) {
      setupDriver = v;
    },
    setupMutationMethods: function (v) {
      setupMutationMethods = v;
    },
    validateCollectionName: function (v) {
      validateCollectionName = v;
    }
  }, 4);
  var ReplicationMethods;
  module1.link("./methods_replication", {
    ReplicationMethods: function (v) {
      ReplicationMethods = v;
    }
  }, 5);
  var watchChangeStream;
  module1.link("./watch_change_stream", {
    watchChangeStream: function (v) {
      watchChangeStream = v;
    }
  }, 6);
  /**
   * @summary Namespace for MongoDB-related items
   * @namespace
   */
  Mongo = {};

  /**
   * @summary Constructor for a Collection
   * @locus Anywhere
   * @instancename collection
   * @class
   * @param {String} name The name of the collection.  If null, creates an unmanaged (unsynchronized) local collection.
   * @param {Object} [options]
   * @param {Object} options.connection The server connection that will manage this collection. Uses the default connection if not specified.  Pass the return value of calling [`DDP.connect`](#DDP-connect) to specify a different server. Pass `null` to specify no connection. Unmanaged (`name` is null) collections cannot specify a connection.
   * @param {String} options.idGeneration The method of generating the `_id` fields of new documents in this collection.  Possible values:
  
   - **`'STRING'`**: random strings
   - **`'MONGO'`**:  random [`Mongo.ObjectID`](#mongo_object_id) values
  
  The default id generation technique is `'STRING'`.
   * @param {Function} options.transform An optional transformation function. Documents will be passed through this function before being returned from `fetch` or `findOneAsync`, and before being passed to callbacks of `observe`, `map`, `forEach`, `allow`, and `deny`. Transforms are *not* applied for the callbacks of `observeChanges` or to cursors returned from publish functions.
   * @param {Boolean} options.defineMutationMethods Set to `false` to skip setting up the mutation methods that enable insert/update/remove from client code. Default `true`.
   */
  // Main Collection constructor
  Mongo.Collection = function () {
    function Collection(name, options) {
      var _ID_GENERATORS$option, _ID_GENERATORS;
      name = validateCollectionName(name);
      options = normalizeOptions(options);
      this._makeNewID = (_ID_GENERATORS$option = (_ID_GENERATORS = ID_GENERATORS)[options.idGeneration]) === null || _ID_GENERATORS$option === void 0 ? void 0 : _ID_GENERATORS$option.call(_ID_GENERATORS, name);
      this._transform = LocalCollection.wrapTransform(options.transform);
      this.resolverType = options.resolverType;
      this._connection = setupConnection(name, options);
      var driver = setupDriver(name, this._connection, options);
      this._driver = driver;
      this._collection = driver.open(name, this._connection);
      this._name = name;
      this._settingUpReplicationPromise = this._maybeSetUpReplication(name, options);
      setupMutationMethods(this, name, options);
      setupAutopublish(this, name, options);
      Mongo._collections.set(name, this);
    }
    return Collection;
  }();
  Object.assign(Mongo.Collection.prototype, {
    _getFindSelector: function (args) {
      if (args.length == 0) return {};else return args[0];
    },
    _getFindOptions: function (args) {
      var _ref = args || [],
        _ref2 = _slicedToArray(_ref, 2),
        options = _ref2[1];
      var newOptions = normalizeProjection(options);
      var self = this;
      if (args.length < 2) {
        return {
          transform: self._transform
        };
      } else {
        check(newOptions, Match.Optional(Match.ObjectIncluding({
          projection: Match.Optional(Match.OneOf(Object, undefined)),
          sort: Match.Optional(Match.OneOf(Object, Array, Function, undefined)),
          limit: Match.Optional(Match.OneOf(Number, undefined)),
          skip: Match.Optional(Match.OneOf(Number, undefined))
        })));
        return _objectSpread({
          transform: self._transform
        }, newOptions);
      }
    }
  });
  Object.assign(Mongo.Collection, {
    _publishCursor: function () {
      function _callee2(cursor, sub, collection) {
        var observeHandle;
        return _regeneratorRuntime.async(function (_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 1;
              return _regeneratorRuntime.awrap(cursor.observeChanges({
                added: function (id, fields) {
                  sub.added(collection, id, fields);
                },
                changed: function (id, fields) {
                  sub.changed(collection, id, fields);
                },
                removed: function (id) {
                  sub.removed(collection, id);
                }
              },
              // Publications don't mutate the documents
              // This is tested by the `livedata - publish callbacks clone` test
              {
                nonMutatingCallbacks: true
              }));
            case 1:
              observeHandle = _context2.sent;
              // We don't call sub.ready() here: it gets called in livedata_server, after
              // possibly calling _publishCursor on multiple returned cursors.

              // register stop callback (expects lambda w/ no args).
              sub.onStop(function () {
                function _callee() {
                  return _regeneratorRuntime.async(function (_context) {
                    while (1) switch (_context.prev = _context.next) {
                      case 0:
                        _context.next = 1;
                        return _regeneratorRuntime.awrap(observeHandle.stop());
                      case 1:
                        return _context.abrupt("return", _context.sent);
                      case 2:
                      case "end":
                        return _context.stop();
                    }
                  }, null, null, null, Promise);
                }
                return _callee;
              }());

              // return the observeHandle in case it needs to be stopped early
              return _context2.abrupt("return", observeHandle);
            case 2:
            case "end":
              return _context2.stop();
          }
        }, null, null, null, Promise);
      }
      return _callee2;
    }(),
    // protect against dangerous selectors.  falsey and {_id: falsey} are both
    // likely programmer error, and not what you want, particularly for destructive
    // operations. If a falsey _id is sent in, a new string _id will be
    // generated and returned; if a fallbackId is provided, it will be returned
    // instead.
    _rewriteSelector: function (selector) {
      var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        fallbackId = _ref3.fallbackId;
      // shorthand -- scalars match _id
      if (LocalCollection._selectorIsId(selector)) selector = {
        _id: selector
      };
      if (Array.isArray(selector)) {
        // This is consistent with the Mongo console itself; if we don't do this
        // check passing an empty array ends up selecting all items
        throw new Error("Mongo selector can't be an array.");
      }
      if (!selector || '_id' in selector && !selector._id) {
        // can't match anything
        return {
          _id: fallbackId || Random.id()
        };
      }
      return selector;
    }
  });
  Object.assign(Mongo.Collection.prototype, ReplicationMethods, SyncMethods, AsyncMethods, IndexMethods);
  Object.assign(Mongo.Collection.prototype, {
    // Determine if this collection is simply a minimongo representation of a real
    // database on another server
    _isRemoteCollection: function () {
      // XXX see #MeteorServerNull
      return this._connection && this._connection !== Meteor.server;
    },
    dropCollectionAsync: function () {
      function _callee3() {
        var self;
        return _regeneratorRuntime.async(function (_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              self = this;
              if (self._collection.dropCollectionAsync) {
                _context3.next = 1;
                break;
              }
              throw new Error('Can only call dropCollectionAsync on server collections');
            case 1:
              _context3.next = 2;
              return _regeneratorRuntime.awrap(self._collection.dropCollectionAsync());
            case 2:
            case "end":
              return _context3.stop();
          }
        }, null, this, null, Promise);
      }
      return _callee3;
    }(),
    createCappedCollectionAsync: function () {
      function _callee4(byteSize, maxDocuments) {
        var self;
        return _regeneratorRuntime.async(function (_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              self = this;
              _context4.next = 1;
              return _regeneratorRuntime.awrap(self._collection.createCappedCollectionAsync);
            case 1:
              if (_context4.sent) {
                _context4.next = 2;
                break;
              }
              throw new Error('Can only call createCappedCollectionAsync on server collections');
            case 2:
              _context4.next = 3;
              return _regeneratorRuntime.awrap(self._collection.createCappedCollectionAsync(byteSize, maxDocuments));
            case 3:
            case "end":
              return _context4.stop();
          }
        }, null, this, null, Promise);
      }
      return _callee4;
    }(),
    /**
     * @summary Returns the [`Collection`](http://mongodb.github.io/node-mongodb-native/3.0/api/Collection.html) object corresponding to this collection from the [npm `mongodb` driver module](https://www.npmjs.com/package/mongodb) which is wrapped by `Mongo.Collection`.
     * @locus Server
     * @memberof Mongo.Collection
     * @instance
     */
    rawCollection: function () {
      var self = this;
      if (!self._collection.rawCollection) {
        throw new Error('Can only call rawCollection on server collections');
      }
      return self._collection.rawCollection();
    },
    /**
     * @summary Returns the [`Db`](http://mongodb.github.io/node-mongodb-native/3.0/api/Db.html) object corresponding to this collection's database connection from the [npm `mongodb` driver module](https://www.npmjs.com/package/mongodb) which is wrapped by `Mongo.Collection`.
     * @locus Server
     * @memberof Mongo.Collection
     * @instance
     */
    rawDatabase: function () {
      var self = this;
      if (!(self._driver.mongo && self._driver.mongo.db)) {
        throw new Error('Can only call rawDatabase on server collections');
      }
      return self._driver.mongo.db;
    }
  });
  Object.assign(Mongo, {
    /**
     * @summary Retrieve a Meteor collection instance by name. Only collections defined with [`new Mongo.Collection(...)`](#collections) are available with this method. For plain MongoDB collections, you'll want to look at [`rawDatabase()`](#Mongo-Collection-rawDatabase).
     * @locus Anywhere
     * @memberof Mongo
     * @static
     * @param {string} name Name of your collection as it was defined with `new Mongo.Collection()`.
     * @returns {Mongo.Collection | undefined}
     */
    getCollection: function (name) {
      return this._collections.get(name);
    },
    /**
     * @summary A record of all defined Mongo.Collection instances, indexed by collection name.
     * @type {Map<string, Mongo.Collection>}
     * @memberof Mongo
     * @protected
     */
    _collections: new Map()
  });

  /**
   * @summary Create a Mongo-style `ObjectID`.  If you don't specify a `hexString`, the `ObjectID` will be generated randomly (not using MongoDB's ID construction rules).
   * @locus Anywhere
   * @class
   * @param {String} [hexString] Optional.  The 24-character hexadecimal contents of the ObjectID to create
   */
  Mongo.ObjectID = MongoID.ObjectID;

  /**
   * @summary To create a cursor, use find. To access the documents in a cursor, use forEach, map, or fetch.
   * @class
   * @instanceName cursor
   */
  Mongo.Cursor = LocalCollection.Cursor;

  /**
   * @deprecated in 0.9.1
   */
  Mongo.Collection.Cursor = Mongo.Cursor;

  /**
   * @deprecated in 0.9.1
   */
  Mongo.Collection.ObjectID = Mongo.ObjectID;

  /**
   * @deprecated in 0.9.1
   */
  Meteor.Collection = Mongo.Collection;

  // Allow deny stuff is now in the allow-deny package
  Object.assign(Mongo.Collection.prototype, AllowDeny.CollectionPrototype);

  // Só agora que Mongo.Collection existe, adicionamos o método ao prototype
  Object.assign(Mongo.Collection.prototype, {
    watchChangeStream: watchChangeStream
  });
}.call(this, module);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"collection_utils.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/mongo/collection/collection_utils.js                                                                      //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var _objectSpread;
module.link("@babel/runtime/helpers/objectSpread2", {
  default: function (v) {
    _objectSpread = v;
  }
}, 0);
module.export({
  ID_GENERATORS: function () {
    return ID_GENERATORS;
  },
  setupConnection: function () {
    return setupConnection;
  },
  setupDriver: function () {
    return setupDriver;
  },
  setupAutopublish: function () {
    return setupAutopublish;
  },
  setupMutationMethods: function () {
    return setupMutationMethods;
  },
  validateCollectionName: function () {
    return validateCollectionName;
  },
  normalizeOptions: function () {
    return normalizeOptions;
  }
});
var ID_GENERATORS = {
  MONGO: function (name) {
    return function () {
      var src = name ? DDP.randomStream('/collection/' + name) : Random.insecure;
      return new Mongo.ObjectID(src.hexString(24));
    };
  },
  STRING: function (name) {
    return function () {
      var src = name ? DDP.randomStream('/collection/' + name) : Random.insecure;
      return src.id();
    };
  }
};
function setupConnection(name, options) {
  if (!name || options.connection === null) return null;
  if (options.connection) return options.connection;
  return Meteor.isClient ? Meteor.connection : Meteor.server;
}
function setupDriver(name, connection, options) {
  if (options._driver) return options._driver;
  if (name && connection === Meteor.server && typeof MongoInternals !== 'undefined' && MongoInternals.defaultRemoteCollectionDriver) {
    return MongoInternals.defaultRemoteCollectionDriver();
  }
  var _require = require('../local_collection_driver.js'),
    LocalCollectionDriver = _require.LocalCollectionDriver;
  return LocalCollectionDriver;
}
function setupAutopublish(collection, name, options) {
  if (Package.autopublish && !options._preventAutopublish && collection._connection && collection._connection.publish) {
    collection._connection.publish(null, function () {
      return collection.find();
    }, {
      is_auto: true
    });
  }
}
function setupMutationMethods(collection, name, options) {
  if (options.defineMutationMethods === false) return;
  try {
    collection._defineMutationMethods({
      useExisting: options._suppressSameNameError === true
    });
  } catch (error) {
    if (error.message === "A method named '/" + name + "/insertAsync' is already defined") {
      throw new Error("There is already a collection named \"" + name + "\"");
    }
    throw error;
  }
}
function validateCollectionName(name) {
  if (!name && name !== null) {
    Meteor._debug('Warning: creating anonymous collection. It will not be ' + 'saved or synchronized over the network. (Pass null for ' + 'the collection name to turn off this warning.)');
    name = null;
  }
  if (name !== null && typeof name !== 'string') {
    throw new Error('First argument to new Mongo.Collection must be a string or null');
  }
  return name;
}
function normalizeOptions(options) {
  if (options && options.methods) {
    // Backwards compatibility hack with original signature
    options = {
      connection: options
    };
  }
  // Backwards compatibility: "connection" used to be called "manager".
  if (options && options.manager && !options.connection) {
    options.connection = options.manager;
  }
  return _objectSpread({
    connection: undefined,
    idGeneration: 'STRING',
    transform: null,
    _driver: undefined,
    _preventAutopublish: false
  }, options);
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods_async.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/mongo/collection/methods_async.js                                                                         //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
module.export({
  AsyncMethods: function () {
    return AsyncMethods;
  }
});
var AsyncMethods = {
  /**
   * @summary Finds the first document that matches the selector, as ordered by sort and skip options. Returns `undefined` if no matching document is found.
   * @locus Anywhere
   * @method findOneAsync
   * @memberof Mongo.Collection
   * @instance
   * @param {MongoSelector} [selector] A query describing the documents to find
   * @param {Object} [options]
   * @param {MongoSortSpecifier} options.sort Sort order (default: natural order)
   * @param {Number} options.skip Number of results to skip at the beginning
   * @param {MongoFieldSpecifier} options.fields Dictionary of fields to return or exclude.
   * @param {Boolean} options.reactive (Client only) Default true; pass false to disable reactivity
   * @param {Function} options.transform Overrides `transform` on the [`Collection`](#collections) for this cursor.  Pass `null` to disable transformation.
   * @param {String} options.readPreference (Server only) Specifies a custom MongoDB [`readPreference`](https://docs.mongodb.com/manual/core/read-preference) for fetching the document. Possible values are `primary`, `primaryPreferred`, `secondary`, `secondaryPreferred` and `nearest`.
   * @returns {Object}
   */
  findOneAsync: function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return this._collection.findOneAsync(this._getFindSelector(args), this._getFindOptions(args));
  },
  _insertAsync: function (doc) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    // Make sure we were passed a document to insert
    if (!doc) {
      throw new Error('insert requires an argument');
    }

    // Make a shallow clone of the document, preserving its prototype.
    doc = Object.create(Object.getPrototypeOf(doc), Object.getOwnPropertyDescriptors(doc));
    if ('_id' in doc) {
      if (!doc._id || !(typeof doc._id === 'string' || doc._id instanceof Mongo.ObjectID)) {
        throw new Error('Meteor requires document _id fields to be non-empty strings or ObjectIDs');
      }
    } else {
      var generateId = true;

      // Don't generate the id if we're the client and the 'outermost' call
      // This optimization saves us passing both the randomSeed and the id
      // Passing both is redundant.
      if (this._isRemoteCollection()) {
        var enclosing = DDP._CurrentMethodInvocation.get();
        if (!enclosing) {
          generateId = false;
        }
      }
      if (generateId) {
        doc._id = this._makeNewID();
      }
    }

    // On inserts, always return the id that we generated; on all other
    // operations, just return the result from the collection.
    var chooseReturnValueFromCollectionResult = function (result) {
      if (Meteor._isPromise(result)) return result;
      if (doc._id) {
        return doc._id;
      }

      // XXX what is this for??
      // It's some iteraction between the callback to _callMutatorMethod and
      // the return value conversion
      doc._id = result;
      return result;
    };
    if (this._isRemoteCollection()) {
      var promise = this._callMutatorMethodAsync('insertAsync', [doc], options);
      promise.then(chooseReturnValueFromCollectionResult);
      promise.stubPromise = promise.stubPromise.then(chooseReturnValueFromCollectionResult);
      promise.serverPromise = promise.serverPromise.then(chooseReturnValueFromCollectionResult);
      return promise;
    }

    // it's my collection.  descend into the collection object
    // and propagate any exception.
    return this._collection.insertAsync(doc).then(chooseReturnValueFromCollectionResult);
  },
  /**
   * @summary Insert a document in the collection.  Returns a promise that will return the document's unique _id when solved.
   * @locus Anywhere
   * @method  insert
   * @memberof Mongo.Collection
   * @instance
   * @param {Object} doc The document to insert. May not yet have an _id attribute, in which case Meteor will generate one for you.
   */
  insertAsync: function (doc, options) {
    return this._insertAsync(doc, options);
  },
  /**
   * @summary Modify one or more documents in the collection. Returns the number of matched documents.
   * @locus Anywhere
   * @method update
   * @memberof Mongo.Collection
   * @instance
   * @param {MongoSelector} selector Specifies which documents to modify
   * @param {MongoModifier} modifier Specifies how to modify the documents
   * @param {Object} [options]
   * @param {Boolean} options.multi True to modify all matching documents; false to only modify one of the matching documents (the default).
   * @param {Boolean} options.upsert True to insert a document if no matching documents are found.
   * @param {Array} options.arrayFilters Optional. Used in combination with MongoDB [filtered positional operator](https://docs.mongodb.com/manual/reference/operator/update/positional-filtered/) to specify which elements to modify in an array field.
   */
  updateAsync: function (selector, modifier) {
    // We've already popped off the callback, so we are left with an array
    // of one or zero items
    var options = _objectSpread({}, (arguments.length <= 2 ? undefined : arguments[2]) || null);
    var insertedId;
    if (options && options.upsert) {
      // set `insertedId` if absent.  `insertedId` is a Meteor extension.
      if (options.insertedId) {
        if (!(typeof options.insertedId === 'string' || options.insertedId instanceof Mongo.ObjectID)) throw new Error('insertedId must be string or ObjectID');
        insertedId = options.insertedId;
      } else if (!selector || !selector._id) {
        insertedId = this._makeNewID();
        options.generatedId = true;
        options.insertedId = insertedId;
      }
    }
    selector = Mongo.Collection._rewriteSelector(selector, {
      fallbackId: insertedId
    });
    if (this._isRemoteCollection()) {
      var args = [selector, modifier, options];
      return this._callMutatorMethodAsync('updateAsync', args, options);
    }

    // it's my collection.  descend into the collection object
    // and propagate any exception.
    // If the user provided a callback and the collection implements this
    // operation asynchronously, then queryRet will be undefined, and the
    // result will be returned through the callback instead.

    return this._collection.updateAsync(selector, modifier, options);
  },
  /**
   * @summary Asynchronously removes documents from the collection.
   * @locus Anywhere
   * @method remove
   * @memberof Mongo.Collection
   * @instance
   * @param {MongoSelector} selector Specifies which documents to remove
   */
  removeAsync: function (selector) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    selector = Mongo.Collection._rewriteSelector(selector);
    if (this._isRemoteCollection()) {
      return this._callMutatorMethodAsync('removeAsync', [selector], options);
    }

    // it's my collection.  descend into the collection1 object
    // and propagate any exception.
    return this._collection.removeAsync(selector);
  },
  /**
   * @summary Asynchronously modifies one or more documents in the collection, or insert one if no matching documents were found. Returns an object with keys `numberAffected` (the number of documents modified)  and `insertedId` (the unique _id of the document that was inserted, if any).
   * @locus Anywhere
   * @method upsert
   * @memberof Mongo.Collection
   * @instance
   * @param {MongoSelector} selector Specifies which documents to modify
   * @param {MongoModifier} modifier Specifies how to modify the documents
   * @param {Object} [options]
   * @param {Boolean} options.multi True to modify all matching documents; false to only modify one of the matching documents (the default).
   */
  upsertAsync: function () {
    function _callee(selector, modifier, options) {
      return _regeneratorRuntime.async(function (_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt("return", this.updateAsync(selector, modifier, _objectSpread(_objectSpread({}, options), {}, {
              _returnObject: true,
              upsert: true
            })));
          case 1:
          case "end":
            return _context.stop();
        }
      }, null, this, null, Promise);
    }
    return _callee;
  }(),
  /**
   * @summary Gets the number of documents matching the filter. For a fast count of the total documents in a collection see `estimatedDocumentCount`.
   * @locus Anywhere
   * @method countDocuments
   * @memberof Mongo.Collection
   * @instance
   * @param {MongoSelector} [selector] A query describing the documents to count
   * @param {Object} [options] All options are listed in [MongoDB documentation](https://mongodb.github.io/node-mongodb-native/4.11/interfaces/CountDocumentsOptions.html). Please note that not all of them are available on the client.
   * @returns {Promise<number>}
   */
  countDocuments: function () {
    var _this$_collection;
    return (_this$_collection = this._collection).countDocuments.apply(_this$_collection, arguments);
  },
  /**
   * @summary Gets an estimate of the count of documents in a collection using collection metadata. For an exact count of the documents in a collection see `countDocuments`.
   * @locus Anywhere
   * @method estimatedDocumentCount
   * @memberof Mongo.Collection
   * @instance
   * @param {Object} [options] All options are listed in [MongoDB documentation](https://mongodb.github.io/node-mongodb-native/4.11/interfaces/EstimatedDocumentCountOptions.html). Please note that not all of them are available on the client.
   * @returns {Promise<number>}
   */
  estimatedDocumentCount: function () {
    var _this$_collection2;
    return (_this$_collection2 = this._collection).estimatedDocumentCount.apply(_this$_collection2, arguments);
  }
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods_index.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/mongo/collection/methods_index.js                                                                         //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var _regeneratorRuntime;
module.link("@babel/runtime/regenerator", {
  default: function (v) {
    _regeneratorRuntime = v;
  }
}, 0);
module.export({
  IndexMethods: function () {
    return IndexMethods;
  }
});
var Log;
module.link("meteor/logging", {
  Log: function (v) {
    Log = v;
  }
}, 0);
var IndexMethods = {
  // We'll actually design an index API later. For now, we just pass through to
  // Mongo's, but make it synchronous.
  /**
   * @summary Asynchronously creates the specified index on the collection.
   * @locus server
   * @method ensureIndexAsync
   * @deprecated in 3.0
   * @memberof Mongo.Collection
   * @instance
   * @param {Object} index A document that contains the field and value pairs where the field is the index key and the value describes the type of index for that field. For an ascending index on a field, specify a value of `1`; for descending index, specify a value of `-1`. Use `text` for text indexes.
   * @param {Object} [options] All options are listed in [MongoDB documentation](https://docs.mongodb.com/manual/reference/method/db.collection.createIndex/#options)
   * @param {String} options.name Name of the index
   * @param {Boolean} options.unique Define that the index values must be unique, more at [MongoDB documentation](https://docs.mongodb.com/manual/core/index-unique/)
   * @param {Boolean} options.sparse Define that the index is sparse, more at [MongoDB documentation](https://docs.mongodb.com/manual/core/index-sparse/)
   */
  ensureIndexAsync: function () {
    function _callee(index, options) {
      var self;
      return _regeneratorRuntime.async(function (_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            self = this;
            if (!(!self._collection.ensureIndexAsync || !self._collection.createIndexAsync)) {
              _context.next = 1;
              break;
            }
            throw new Error('Can only call createIndexAsync on server collections');
          case 1:
            if (!self._collection.createIndexAsync) {
              _context.next = 3;
              break;
            }
            _context.next = 2;
            return _regeneratorRuntime.awrap(self._collection.createIndexAsync(index, options));
          case 2:
            _context.next = 4;
            break;
          case 3:
            Log.debug("ensureIndexAsync has been deprecated, please use the new 'createIndexAsync' instead" + (options !== null && options !== void 0 && options.name ? ", index name: " + options.name : ", index: " + JSON.stringify(index)));
            _context.next = 4;
            return _regeneratorRuntime.awrap(self._collection.ensureIndexAsync(index, options));
          case 4:
          case "end":
            return _context.stop();
        }
      }, null, this, null, Promise);
    }
    return _callee;
  }(),
  /**
   * @summary Asynchronously creates the specified index on the collection.
   * @locus server
   * @method createIndexAsync
   * @memberof Mongo.Collection
   * @instance
   * @param {Object} index A document that contains the field and value pairs where the field is the index key and the value describes the type of index for that field. For an ascending index on a field, specify a value of `1`; for descending index, specify a value of `-1`. Use `text` for text indexes.
   * @param {Object} [options] All options are listed in [MongoDB documentation](https://docs.mongodb.com/manual/reference/method/db.collection.createIndex/#options)
   * @param {String} options.name Name of the index
   * @param {Boolean} options.unique Define that the index values must be unique, more at [MongoDB documentation](https://docs.mongodb.com/manual/core/index-unique/)
   * @param {Boolean} options.sparse Define that the index is sparse, more at [MongoDB documentation](https://docs.mongodb.com/manual/core/index-sparse/)
   */
  createIndexAsync: function () {
    function _callee2(index, options) {
      var self, _Meteor$settings, _Meteor$settings$pack, _Meteor$settings$pack2, _t;
      return _regeneratorRuntime.async(function (_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            self = this;
            if (self._collection.createIndexAsync) {
              _context2.next = 1;
              break;
            }
            throw new Error('Can only call createIndexAsync on server collections');
          case 1:
            _context2.prev = 1;
            _context2.next = 2;
            return _regeneratorRuntime.awrap(self._collection.createIndexAsync(index, options));
          case 2:
            _context2.next = 7;
            break;
          case 3:
            _context2.prev = 3;
            _t = _context2["catch"](1);
            if (!(_t.message.includes('An equivalent index already exists with the same name but different options.') && (_Meteor$settings = Meteor.settings) !== null && _Meteor$settings !== void 0 && (_Meteor$settings$pack = _Meteor$settings.packages) !== null && _Meteor$settings$pack !== void 0 && (_Meteor$settings$pack2 = _Meteor$settings$pack.mongo) !== null && _Meteor$settings$pack2 !== void 0 && _Meteor$settings$pack2.reCreateIndexOnOptionMismatch)) {
              _context2.next = 6;
              break;
            }
            Log.info("Re-creating index " + index + " for " + self._name + " due to options mismatch.");
            _context2.next = 4;
            return _regeneratorRuntime.awrap(self._collection.dropIndexAsync(index));
          case 4:
            _context2.next = 5;
            return _regeneratorRuntime.awrap(self._collection.createIndexAsync(index, options));
          case 5:
            _context2.next = 7;
            break;
          case 6:
            console.error(_t);
            throw new Meteor.Error("An error occurred when creating an index for collection \"" + self._name + ": " + _t.message);
          case 7:
          case "end":
            return _context2.stop();
        }
      }, null, this, [[1, 3]], Promise);
    }
    return _callee2;
  }(),
  /**
   * @summary Asynchronously creates the specified index on the collection.
   * @locus server
   * @method createIndex
   * @memberof Mongo.Collection
   * @instance
   * @param {Object} index A document that contains the field and value pairs where the field is the index key and the value describes the type of index for that field. For an ascending index on a field, specify a value of `1`; for descending index, specify a value of `-1`. Use `text` for text indexes.
   * @param {Object} [options] All options are listed in [MongoDB documentation](https://docs.mongodb.com/manual/reference/method/db.collection.createIndex/#options)
   * @param {String} options.name Name of the index
   * @param {Boolean} options.unique Define that the index values must be unique, more at [MongoDB documentation](https://docs.mongodb.com/manual/core/index-unique/)
   * @param {Boolean} options.sparse Define that the index is sparse, more at [MongoDB documentation](https://docs.mongodb.com/manual/core/index-sparse/)
   */
  createIndex: function (index, options) {
    return this.createIndexAsync(index, options);
  },
  dropIndexAsync: function () {
    function _callee3(index) {
      var self;
      return _regeneratorRuntime.async(function (_context3) {
        while (1) switch (_context3.prev = _context3.next) {
          case 0:
            self = this;
            if (self._collection.dropIndexAsync) {
              _context3.next = 1;
              break;
            }
            throw new Error('Can only call dropIndexAsync on server collections');
          case 1:
            _context3.next = 2;
            return _regeneratorRuntime.awrap(self._collection.dropIndexAsync(index));
          case 2:
          case "end":
            return _context3.stop();
        }
      }, null, this, null, Promise);
    }
    return _callee3;
  }()
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods_replication.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/mongo/collection/methods_replication.js                                                                   //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
module.export({
  ReplicationMethods: function () {
    return ReplicationMethods;
  }
});
var ReplicationMethods = {
  _maybeSetUpReplication: function () {
    function _callee6(name) {
      var _registerStoreResult, _registerStoreResult$;
      var self, wrappedStoreCommon, wrappedStoreClient, wrappedStoreServer, registerStoreResult, message, logWarn;
      return _regeneratorRuntime.async(function (_context6) {
        while (1) switch (_context6.prev = _context6.next) {
          case 0:
            self = this;
            if (self._connection && self._connection.registerStoreClient && self._connection.registerStoreServer) {
              _context6.next = 1;
              break;
            }
            return _context6.abrupt("return");
          case 1:
            wrappedStoreCommon = {
              // Called around method stub invocations to capture the original versions
              // of modified documents.
              saveOriginals: function () {
                self._collection.saveOriginals();
              },
              retrieveOriginals: function () {
                return self._collection.retrieveOriginals();
              },
              // To be able to get back to the collection from the store.
              _getCollection: function () {
                return self;
              }
            };
            wrappedStoreClient = _objectSpread({
              // Called at the beginning of a batch of updates. batchSize is the number
              // of update calls to expect.
              //
              // XXX This interface is pretty janky. reset probably ought to go back to
              // being its own function, and callers shouldn't have to calculate
              // batchSize. The optimization of not calling pause/remove should be
              // delayed until later: the first call to update() should buffer its
              // message, and then we can either directly apply it at endUpdate time if
              // it was the only update, or do pauseObservers/apply/apply at the next
              // update() if there's another one.
              beginUpdate: function () {
                function _callee(batchSize, reset) {
                  return _regeneratorRuntime.async(function (_context) {
                    while (1) switch (_context.prev = _context.next) {
                      case 0:
                        // pause observers so users don't see flicker when updating several
                        // objects at once (including the post-reconnect reset-and-reapply
                        // stage), and so that a re-sorting of a query can take advantage of the
                        // full _diffQuery moved calculation instead of applying change one at a
                        // time.
                        if (batchSize > 1 || reset) self._collection.pauseObservers();
                        if (!reset) {
                          _context.next = 1;
                          break;
                        }
                        _context.next = 1;
                        return _regeneratorRuntime.awrap(self._collection.remove({}));
                      case 1:
                      case "end":
                        return _context.stop();
                    }
                  }, null, null, null, Promise);
                }
                return _callee;
              }(),
              // Apply an update.
              // XXX better specify this interface (not in terms of a wire message)?
              update: function (msg) {
                var mongoId = MongoID.idParse(msg.id);
                var doc = self._collection._docs.get(mongoId);

                //When the server's mergebox is disabled for a collection, the client must gracefully handle it when:
                // *We receive an added message for a document that is already there. Instead, it will be changed
                // *We reeive a change message for a document that is not there. Instead, it will be added
                // *We receive a removed messsage for a document that is not there. Instead, noting wil happen.

                //Code is derived from client-side code originally in peerlibrary:control-mergebox
                //https://github.com/peerlibrary/meteor-control-mergebox/blob/master/client.coffee

                //For more information, refer to discussion "Initial support for publication strategies in livedata server":
                //https://github.com/meteor/meteor/pull/11151
                if (Meteor.isClient) {
                  if (msg.msg === 'added' && doc) {
                    msg.msg = 'changed';
                  } else if (msg.msg === 'removed' && !doc) {
                    return;
                  } else if (msg.msg === 'changed' && !doc) {
                    msg.msg = 'added';
                    var _ref = msg.fields;
                    for (var field in meteorBabelHelpers.sanitizeForInObject(_ref)) {
                      var value = _ref[field];
                      if (value === void 0) {
                        delete msg.fields[field];
                      }
                    }
                  }
                }
                // Is this a "replace the whole doc" message coming from the quiescence
                // of method writes to an object? (Note that 'undefined' is a valid
                // value meaning "remove it".)
                if (msg.msg === 'replace') {
                  var replace = msg.replace;
                  if (!replace) {
                    if (doc) self._collection.remove(mongoId);
                  } else if (!doc) {
                    self._collection.insert(replace);
                  } else {
                    // XXX check that replace has no $ ops
                    self._collection.update(mongoId, replace);
                  }
                  return;
                } else if (msg.msg === 'added') {
                  if (doc) {
                    throw new Error('Expected not to find a document already present for an add');
                  }
                  self._collection.insert(_objectSpread({
                    _id: mongoId
                  }, msg.fields));
                } else if (msg.msg === 'removed') {
                  if (!doc) throw new Error('Expected to find a document already present for removed');
                  self._collection.remove(mongoId);
                } else if (msg.msg === 'changed') {
                  if (!doc) throw new Error('Expected to find a document to change');
                  var keys = Object.keys(msg.fields);
                  if (keys.length > 0) {
                    var modifier = {};
                    keys.forEach(function (key) {
                      var value = msg.fields[key];
                      if (EJSON.equals(doc[key], value)) {
                        return;
                      }
                      if (typeof value === 'undefined') {
                        if (!modifier.$unset) {
                          modifier.$unset = {};
                        }
                        modifier.$unset[key] = 1;
                      } else {
                        if (!modifier.$set) {
                          modifier.$set = {};
                        }
                        modifier.$set[key] = value;
                      }
                    });
                    if (Object.keys(modifier).length > 0) {
                      self._collection.update(mongoId, modifier);
                    }
                  }
                } else {
                  throw new Error("I don't know how to deal with this message");
                }
              },
              // Called at the end of a batch of updates.livedata_connection.js:1287
              endUpdate: function () {
                self._collection.resumeObserversClient();
              },
              // Used to preserve current versions of documents across a store reset.
              getDoc: function (id) {
                return self.findOne(id);
              }
            }, wrappedStoreCommon);
            wrappedStoreServer = _objectSpread({
              beginUpdate: function () {
                function _callee2(batchSize, reset) {
                  return _regeneratorRuntime.async(function (_context2) {
                    while (1) switch (_context2.prev = _context2.next) {
                      case 0:
                        if (batchSize > 1 || reset) self._collection.pauseObservers();
                        if (!reset) {
                          _context2.next = 1;
                          break;
                        }
                        _context2.next = 1;
                        return _regeneratorRuntime.awrap(self._collection.removeAsync({}));
                      case 1:
                      case "end":
                        return _context2.stop();
                    }
                  }, null, null, null, Promise);
                }
                return _callee2;
              }(),
              update: function () {
                function _callee3(msg) {
                  var mongoId, doc, replace, keys, modifier;
                  return _regeneratorRuntime.async(function (_context3) {
                    while (1) switch (_context3.prev = _context3.next) {
                      case 0:
                        mongoId = MongoID.idParse(msg.id);
                        doc = self._collection._docs.get(mongoId); // Is this a "replace the whole doc" message coming from the quiescence
                        // of method writes to an object? (Note that 'undefined' is a valid
                        // value meaning "remove it".)
                        if (!(msg.msg === 'replace')) {
                          _context3.next = 6;
                          break;
                        }
                        replace = msg.replace;
                        if (replace) {
                          _context3.next = 2;
                          break;
                        }
                        if (!doc) {
                          _context3.next = 1;
                          break;
                        }
                        _context3.next = 1;
                        return _regeneratorRuntime.awrap(self._collection.removeAsync(mongoId));
                      case 1:
                        _context3.next = 5;
                        break;
                      case 2:
                        if (doc) {
                          _context3.next = 4;
                          break;
                        }
                        _context3.next = 3;
                        return _regeneratorRuntime.awrap(self._collection.insertAsync(replace));
                      case 3:
                        _context3.next = 5;
                        break;
                      case 4:
                        _context3.next = 5;
                        return _regeneratorRuntime.awrap(self._collection.updateAsync(mongoId, replace));
                      case 5:
                        return _context3.abrupt("return");
                      case 6:
                        if (!(msg.msg === 'added')) {
                          _context3.next = 9;
                          break;
                        }
                        if (!doc) {
                          _context3.next = 7;
                          break;
                        }
                        throw new Error('Expected not to find a document already present for an add');
                      case 7:
                        _context3.next = 8;
                        return _regeneratorRuntime.awrap(self._collection.insertAsync(_objectSpread({
                          _id: mongoId
                        }, msg.fields)));
                      case 8:
                        _context3.next = 16;
                        break;
                      case 9:
                        if (!(msg.msg === 'removed')) {
                          _context3.next = 12;
                          break;
                        }
                        if (doc) {
                          _context3.next = 10;
                          break;
                        }
                        throw new Error('Expected to find a document already present for removed');
                      case 10:
                        _context3.next = 11;
                        return _regeneratorRuntime.awrap(self._collection.removeAsync(mongoId));
                      case 11:
                        _context3.next = 16;
                        break;
                      case 12:
                        if (!(msg.msg === 'changed')) {
                          _context3.next = 15;
                          break;
                        }
                        if (doc) {
                          _context3.next = 13;
                          break;
                        }
                        throw new Error('Expected to find a document to change');
                      case 13:
                        keys = Object.keys(msg.fields);
                        if (!(keys.length > 0)) {
                          _context3.next = 14;
                          break;
                        }
                        modifier = {};
                        keys.forEach(function (key) {
                          var value = msg.fields[key];
                          if (EJSON.equals(doc[key], value)) {
                            return;
                          }
                          if (typeof value === 'undefined') {
                            if (!modifier.$unset) {
                              modifier.$unset = {};
                            }
                            modifier.$unset[key] = 1;
                          } else {
                            if (!modifier.$set) {
                              modifier.$set = {};
                            }
                            modifier.$set[key] = value;
                          }
                        });
                        if (!(Object.keys(modifier).length > 0)) {
                          _context3.next = 14;
                          break;
                        }
                        _context3.next = 14;
                        return _regeneratorRuntime.awrap(self._collection.updateAsync(mongoId, modifier));
                      case 14:
                        _context3.next = 16;
                        break;
                      case 15:
                        throw new Error("I don't know how to deal with this message");
                      case 16:
                      case "end":
                        return _context3.stop();
                    }
                  }, null, null, null, Promise);
                }
                return _callee3;
              }(),
              // Called at the end of a batch of updates.
              endUpdate: function () {
                function _callee4() {
                  return _regeneratorRuntime.async(function (_context4) {
                    while (1) switch (_context4.prev = _context4.next) {
                      case 0:
                        _context4.next = 1;
                        return _regeneratorRuntime.awrap(self._collection.resumeObserversServer());
                      case 1:
                      case "end":
                        return _context4.stop();
                    }
                  }, null, null, null, Promise);
                }
                return _callee4;
              }(),
              // Used to preserve current versions of documents across a store reset.
              getDoc: function () {
                function _callee5(id) {
                  return _regeneratorRuntime.async(function (_context5) {
                    while (1) switch (_context5.prev = _context5.next) {
                      case 0:
                        return _context5.abrupt("return", self.findOneAsync(id));
                      case 1:
                      case "end":
                        return _context5.stop();
                    }
                  }, null, null, null, Promise);
                }
                return _callee5;
              }()
            }, wrappedStoreCommon); // OK, we're going to be a slave, replicating some remote
            // database, except possibly with some temporary divergence while
            // we have unacknowledged RPC's.
            if (Meteor.isClient) {
              registerStoreResult = self._connection.registerStoreClient(name, wrappedStoreClient);
            } else {
              registerStoreResult = self._connection.registerStoreServer(name, wrappedStoreServer);
            }
            message = "There is already a collection named \"" + name + "\"";
            logWarn = function () {
              console.warn ? console.warn(message) : console.log(message);
            };
            if (registerStoreResult) {
              _context6.next = 2;
              break;
            }
            return _context6.abrupt("return", logWarn());
          case 2:
            return _context6.abrupt("return", (_registerStoreResult = registerStoreResult) === null || _registerStoreResult === void 0 ? void 0 : (_registerStoreResult$ = _registerStoreResult.then) === null || _registerStoreResult$ === void 0 ? void 0 : _registerStoreResult$.call(_registerStoreResult, function (ok) {
              if (!ok) {
                logWarn();
              }
            }));
          case 3:
          case "end":
            return _context6.stop();
        }
      }, null, this, null, Promise);
    }
    return _callee6;
  }()
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods_sync.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/mongo/collection/methods_sync.js                                                                          //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var _objectSpread;
module.link("@babel/runtime/helpers/objectSpread2", {
  default: function (v) {
    _objectSpread = v;
  }
}, 0);
module.export({
  SyncMethods: function () {
    return SyncMethods;
  }
});
var SyncMethods = {
  /**
   * @summary Find the documents in a collection that match the selector.
   * @locus Anywhere
   * @method find
   * @memberof Mongo.Collection
   * @instance
   * @param {MongoSelector} [selector] A query describing the documents to find
   * @param {Object} [options]
   * @param {MongoSortSpecifier} options.sort Sort order (default: natural order)
   * @param {Number} options.skip Number of results to skip at the beginning
   * @param {Number} options.limit Maximum number of results to return
   * @param {MongoFieldSpecifier} options.fields Dictionary of fields to return or exclude.
   * @param {Boolean} options.reactive (Client only) Default `true`; pass `false` to disable reactivity
   * @param {Function} options.transform Overrides `transform` on the  [`Collection`](#collections) for this cursor.  Pass `null` to disable transformation.
   * @param {Boolean} options.disableOplog (Server only) Pass true to disable oplog-tailing on this query. This affects the way server processes calls to `observe` on this query. Disabling the oplog can be useful when working with data that updates in large batches.
   * @param {Number} options.pollingIntervalMs (Server only) When oplog is disabled (through the use of `disableOplog` or when otherwise not available), the frequency (in milliseconds) of how often to poll this query when observing on the server. Defaults to 10000ms (10 seconds).
   * @param {Number} options.pollingThrottleMs (Server only) When oplog is disabled (through the use of `disableOplog` or when otherwise not available), the minimum time (in milliseconds) to allow between re-polling when observing on the server. Increasing this will save CPU and mongo load at the expense of slower updates to users. Decreasing this is not recommended. Defaults to 50ms.
   * @param {Number} options.maxTimeMs (Server only) If set, instructs MongoDB to set a time limit for this cursor's operations. If the operation reaches the specified time limit (in milliseconds) without the having been completed, an exception will be thrown. Useful to prevent an (accidental or malicious) unoptimized query from causing a full collection scan that would disrupt other database users, at the expense of needing to handle the resulting error.
   * @param {String|Object} options.hint (Server only) Overrides MongoDB's default index selection and query optimization process. Specify an index to force its use, either by its name or index specification. You can also specify `{ $natural : 1 }` to force a forwards collection scan, or `{ $natural : -1 }` for a reverse collection scan. Setting this is only recommended for advanced users.
   * @param {String} options.readPreference (Server only) Specifies a custom MongoDB [`readPreference`](https://docs.mongodb.com/manual/core/read-preference) for this particular cursor. Possible values are `primary`, `primaryPreferred`, `secondary`, `secondaryPreferred` and `nearest`.
   * @returns {Mongo.Cursor}
   */
  find: function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    // Collection.find() (return all docs) behaves differently
    // from Collection.find(undefined) (return 0 docs).  so be
    // careful about the length of arguments.
    return this._collection.find(this._getFindSelector(args), this._getFindOptions(args));
  },
  /**
   * @summary Finds the first document that matches the selector, as ordered by sort and skip options. Returns `undefined` if no matching document is found.
   * @locus Anywhere
   * @method findOne
   * @memberof Mongo.Collection
   * @instance
   * @param {MongoSelector} [selector] A query describing the documents to find
   * @param {Object} [options]
   * @param {MongoSortSpecifier} options.sort Sort order (default: natural order)
   * @param {Number} options.skip Number of results to skip at the beginning
   * @param {MongoFieldSpecifier} options.fields Dictionary of fields to return or exclude.
   * @param {Boolean} options.reactive (Client only) Default true; pass false to disable reactivity
   * @param {Function} options.transform Overrides `transform` on the [`Collection`](#collections) for this cursor.  Pass `null` to disable transformation.
   * @param {String} options.readPreference (Server only) Specifies a custom MongoDB [`readPreference`](https://docs.mongodb.com/manual/core/read-preference) for fetching the document. Possible values are `primary`, `primaryPreferred`, `secondary`, `secondaryPreferred` and `nearest`.
   * @returns {Object}
   */
  findOne: function () {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    return this._collection.findOne(this._getFindSelector(args), this._getFindOptions(args));
  },
  // 'insert' immediately returns the inserted document's new _id.
  // The others return values immediately if you are in a stub, an in-memory
  // unmanaged collection, or a mongo-backed collection and you don't pass a
  // callback. 'update' and 'remove' return the number of affected
  // documents. 'upsert' returns an object with keys 'numberAffected' and, if an
  // insert happened, 'insertedId'.
  //
  // Otherwise, the semantics are exactly like other methods: they take
  // a callback as an optional last argument; if no callback is
  // provided, they block until the operation is complete, and throw an
  // exception if it fails; if a callback is provided, then they don't
  // necessarily block, and they call the callback when they finish with error and
  // result arguments.  (The insert method provides the document ID as its result;
  // update and remove provide the number of affected docs as the result; upsert
  // provides an object with numberAffected and maybe insertedId.)
  //
  // On the client, blocking is impossible, so if a callback
  // isn't provided, they just return immediately and any error
  // information is lost.
  //
  // There's one more tweak. On the client, if you don't provide a
  // callback, then if there is an error, a message will be logged with
  // Meteor._debug.
  //
  // The intent (though this is actually determined by the underlying
  // drivers) is that the operations should be done synchronously, not
  // generating their result until the database has acknowledged
  // them. In the future maybe we should provide a flag to turn this
  // off.
  _insert: function (doc, callback) {
    // Make sure we were passed a document to insert
    if (!doc) {
      throw new Error('insert requires an argument');
    }

    // Make a shallow clone of the document, preserving its prototype.
    doc = Object.create(Object.getPrototypeOf(doc), Object.getOwnPropertyDescriptors(doc));
    if ('_id' in doc) {
      if (!doc._id || !(typeof doc._id === 'string' || doc._id instanceof Mongo.ObjectID)) {
        throw new Error('Meteor requires document _id fields to be non-empty strings or ObjectIDs');
      }
    } else {
      var generateId = true;

      // Don't generate the id if we're the client and the 'outermost' call
      // This optimization saves us passing both the randomSeed and the id
      // Passing both is redundant.
      if (this._isRemoteCollection()) {
        var enclosing = DDP._CurrentMethodInvocation.get();
        if (!enclosing) {
          generateId = false;
        }
      }
      if (generateId) {
        doc._id = this._makeNewID();
      }
    }

    // On inserts, always return the id that we generated; on all other
    // operations, just return the result from the collection.
    var chooseReturnValueFromCollectionResult = function (result) {
      if (Meteor._isPromise(result)) return result;
      if (doc._id) {
        return doc._id;
      }

      // XXX what is this for??
      // It's some iteraction between the callback to _callMutatorMethod and
      // the return value conversion
      doc._id = result;
      return result;
    };
    var wrappedCallback = wrapCallback(callback, chooseReturnValueFromCollectionResult);
    if (this._isRemoteCollection()) {
      var result = this._callMutatorMethod('insert', [doc], wrappedCallback);
      return chooseReturnValueFromCollectionResult(result);
    }

    // it's my collection.  descend into the collection object
    // and propagate any exception.
    try {
      // If the user provided a callback and the collection implements this
      // operation asynchronously, then queryRet will be undefined, and the
      // result will be returned through the callback instead.
      var _result;
      if (!!wrappedCallback) {
        this._collection.insert(doc, wrappedCallback);
      } else {
        // If we don't have the callback, we assume the user is using the promise.
        // We can't just pass this._collection.insert to the promisify because it would lose the context.
        _result = this._collection.insert(doc);
      }
      return chooseReturnValueFromCollectionResult(_result);
    } catch (e) {
      if (callback) {
        callback(e);
        return null;
      }
      throw e;
    }
  },
  /**
   * @summary Insert a document in the collection.  Returns its unique _id.
   * @locus Anywhere
   * @method  insert
   * @memberof Mongo.Collection
   * @instance
   * @param {Object} doc The document to insert. May not yet have an _id attribute, in which case Meteor will generate one for you.
   * @param {Function} [callback] Optional.  If present, called with an error object as the first argument and, if no error, the _id as the second.
   */
  insert: function (doc, callback) {
    return this._insert(doc, callback);
  },
  /**
   * @summary Asynchronously modifies one or more documents in the collection. Returns the number of matched documents.
   * @locus Anywhere
   * @method update
   * @memberof Mongo.Collection
   * @instance
   * @param {MongoSelector} selector Specifies which documents to modify
   * @param {MongoModifier} modifier Specifies how to modify the documents
   * @param {Object} [options]
   * @param {Boolean} options.multi True to modify all matching documents; false to only modify one of the matching documents (the default).
   * @param {Boolean} options.upsert True to insert a document if no matching documents are found.
   * @param {Array} options.arrayFilters Optional. Used in combination with MongoDB [filtered positional operator](https://docs.mongodb.com/manual/reference/operator/update/positional-filtered/) to specify which elements to modify in an array field.
   * @param {Function} [callback] Optional.  If present, called with an error object as the first argument and, if no error, the number of affected documents as the second.
   */
  update: function (selector, modifier) {
    for (var _len3 = arguments.length, optionsAndCallback = new Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
      optionsAndCallback[_key3 - 2] = arguments[_key3];
    }
    var callback = popCallbackFromArgs(optionsAndCallback);

    // We've already popped off the callback, so we are left with an array
    // of one or zero items
    var options = _objectSpread({}, optionsAndCallback[0] || null);
    var insertedId;
    if (options && options.upsert) {
      // set `insertedId` if absent.  `insertedId` is a Meteor extension.
      if (options.insertedId) {
        if (!(typeof options.insertedId === 'string' || options.insertedId instanceof Mongo.ObjectID)) throw new Error('insertedId must be string or ObjectID');
        insertedId = options.insertedId;
      } else if (!selector || !selector._id) {
        insertedId = this._makeNewID();
        options.generatedId = true;
        options.insertedId = insertedId;
      }
    }
    selector = Mongo.Collection._rewriteSelector(selector, {
      fallbackId: insertedId
    });
    var wrappedCallback = wrapCallback(callback);
    if (this._isRemoteCollection()) {
      var args = [selector, modifier, options];
      return this._callMutatorMethod('update', args, callback);
    }

    // it's my collection.  descend into the collection object
    // and propagate any exception.
    // If the user provided a callback and the collection implements this
    // operation asynchronously, then queryRet will be undefined, and the
    // result will be returned through the callback instead.
    //console.log({callback, options, selector, modifier, coll: this._collection});
    try {
      // If the user provided a callback and the collection implements this
      // operation asynchronously, then queryRet will be undefined, and the
      // result will be returned through the callback instead.
      return this._collection.update(selector, modifier, options, wrappedCallback);
    } catch (e) {
      if (callback) {
        callback(e);
        return null;
      }
      throw e;
    }
  },
  /**
   * @summary Remove documents from the collection
   * @locus Anywhere
   * @method remove
   * @memberof Mongo.Collection
   * @instance
   * @param {MongoSelector} selector Specifies which documents to remove
   * @param {Function} [callback] Optional.  If present, called with an error object as the first argument and, if no error, the number of affected documents as the second.
   */
  remove: function (selector, callback) {
    selector = Mongo.Collection._rewriteSelector(selector);
    if (this._isRemoteCollection()) {
      return this._callMutatorMethod('remove', [selector], callback);
    }

    // it's my collection.  descend into the collection1 object
    // and propagate any exception.
    return this._collection.remove(selector);
  },
  /**
   * @summary Asynchronously modifies one or more documents in the collection, or insert one if no matching documents were found. Returns an object with keys `numberAffected` (the number of documents modified)  and `insertedId` (the unique _id of the document that was inserted, if any).
   * @locus Anywhere
   * @method upsert
   * @memberof Mongo.Collection
   * @instance
   * @param {MongoSelector} selector Specifies which documents to modify
   * @param {MongoModifier} modifier Specifies how to modify the documents
   * @param {Object} [options]
   * @param {Boolean} options.multi True to modify all matching documents; false to only modify one of the matching documents (the default).
   * @param {Function} [callback] Optional.  If present, called with an error object as the first argument and, if no error, the number of affected documents as the second.
   */
  upsert: function (selector, modifier, options, callback) {
    if (!callback && typeof options === 'function') {
      callback = options;
      options = {};
    }
    return this.update(selector, modifier, _objectSpread(_objectSpread({}, options), {}, {
      _returnObject: true,
      upsert: true
    }));
  }
};
// Convert the callback to not return a result if there is an error
function wrapCallback(callback, convertResult) {
  return callback && function (error, result) {
    if (error) {
      callback(error);
    } else if (typeof convertResult === 'function') {
      callback(error, convertResult(result));
    } else {
      callback(error, result);
    }
  };
}
function popCallbackFromArgs(args) {
  // Pull off any callback (or perhaps a 'callback' variable that was passed
  // in undefined, like how 'upsert' does it).
  if (args.length && (args[args.length - 1] === undefined || args[args.length - 1] instanceof Function)) {
    return args.pop();
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"watch_change_stream.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/mongo/collection/watch_change_stream.js                                                                   //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.export({
  watchChangeStream: function () {
    return watchChangeStream;
  }
});
function watchChangeStream() {
  var pipeline = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  // Only available on server
  if (typeof Package === 'undefined' || !this.rawCollection) {
    throw new Error('watchChangeStream is only available on server collections');
  }
  var raw = this.rawCollection();
  if (!raw.watch) {
    throw new Error('Underlying collection does not support watch (Change Streams)');
  }
  console.log('[watchChangeStream] Chamando raw.watch() com pipeline:', JSON.stringify(pipeline, null, 2), 'e options:', JSON.stringify(options, null, 2));
  return raw.watch(pipeline, options);
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"mongo_utils.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/mongo/mongo_utils.js                                                                                      //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var _excluded = ["fields", "projection"];
var _objectSpread;
module.link("@babel/runtime/helpers/objectSpread2", {
  default: function (v) {
    _objectSpread = v;
  }
}, 0);
var _objectWithoutProperties;
module.link("@babel/runtime/helpers/objectWithoutProperties", {
  default: function (v) {
    _objectWithoutProperties = v;
  }
}, 1);
module.export({
  normalizeProjection: function () {
    return normalizeProjection;
  }
});
var normalizeProjection = function (options) {
  // transform fields key in projection
  var _ref = options || {},
    fields = _ref.fields,
    projection = _ref.projection,
    otherOptions = _objectWithoutProperties(_ref, _excluded);
  // TODO: enable this comment when deprecating the fields option
  // Log.debug(`fields option has been deprecated, please use the new 'projection' instead`)

  return _objectSpread(_objectSpread({}, otherOptions), projection || fields ? {
    projection: fields || projection
  } : {});
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json",
    ".ts"
  ]
});


/* Exports */
return {
  export: function () { return {
      Mongo: Mongo
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/mongo/local_collection_driver.js",
    "/node_modules/meteor/mongo/collection/collection.js"
  ]
}});
