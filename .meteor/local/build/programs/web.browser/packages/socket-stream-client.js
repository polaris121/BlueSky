//////////////////////////////////////////////////////////////////////////
//                                                                      //
// This is a generated file. You can view the original                  //
// source in your browser if your browser supports source maps.         //
// Source maps are supported by all recent versions of Chrome, Safari,  //
// and Firefox, and by Internet Explorer 11.                            //
//                                                                      //
//////////////////////////////////////////////////////////////////////////


Package["core-runtime"].queue("socket-stream-client",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var Retry = Package.retry.Retry;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"socket-stream-client":{"browser.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/socket-stream-client/browser.js                                                                           //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let _objectSpread;
module.link("@babel/runtime/helpers/objectSpread2", {
  default(v) {
    _objectSpread = v;
  }
}, 0);
module.export({
  ClientStream: () => ClientStream
});
let toSockjsUrl, toWebsocketUrl;
module.link("./urls.js", {
  toSockjsUrl(v) {
    toSockjsUrl = v;
  },
  toWebsocketUrl(v) {
    toWebsocketUrl = v;
  }
}, 0);
let StreamClientCommon;
module.link("./common.js", {
  StreamClientCommon(v) {
    StreamClientCommon = v;
  }
}, 1);
let SockJS;
module.link("./sockjs-1.6.1-min-.js", {
  default(v) {
    SockJS = v;
  }
}, 2);
class ClientStream extends StreamClientCommon {
  // @param url {String} URL to Meteor app
  //   "http://subdomain.meteor.com/" or "/" or
  //   "ddp+sockjs://foo-**.meteor.com/sockjs"
  constructor(url, options) {
    super(options);
    this._initCommon(this.options);

    //// Constants

    // how long between hearing heartbeat from the server until we declare
    // the connection dead. heartbeats come every 45s (stream_server.js)
    //
    // NOTE: this is a older timeout mechanism. We now send heartbeats at
    // the DDP level (https://github.com/meteor/meteor/pull/1865), and
    // expect those timeouts to kill a non-responsive connection before
    // this timeout fires. This is kept around for compatibility (when
    // talking to a server that doesn't support DDP heartbeats) and can be
    // removed later.
    this.HEARTBEAT_TIMEOUT = 100 * 1000;
    this.rawUrl = url;
    this.socket = null;
    this.lastError = null;
    this.heartbeatTimer = null;

    // Listen to global 'online' event if we are running in a browser.
    window.addEventListener('online', this._online.bind(this), false /* useCapture */);

    //// Kickoff!
    this._launchConnection();
  }

  // data is a utf8 string. Data sent while not connected is dropped on
  // the floor, and it is up the user of this API to retransmit lost
  // messages on 'reset'
  send(data) {
    if (this.currentStatus.connected) {
      this.socket.send(data);
    }
  }

  // Changes where this connection points
  _changeUrl(url) {
    this.rawUrl = url;
  }
  _connected() {
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = null;
    }
    if (this.currentStatus.connected) {
      // already connected. do nothing. this probably shouldn't happen.
      return;
    }

    // update status
    this.currentStatus.status = 'connected';
    this.currentStatus.connected = true;
    this.currentStatus.retryCount = 0;
    this.statusChanged();

    // fire resets. This must come after status change so that clients
    // can call send from within a reset callback.
    this.forEachCallback('reset', callback => {
      callback();
    });
  }
  _cleanup(maybeError) {
    this._clearConnectionAndHeartbeatTimers();
    if (this.socket) {
      this.socket.onmessage = this.socket.onclose = this.socket.onerror = this.socket.onheartbeat = () => {};
      this.socket.close();
      this.socket = null;
    }
    this.forEachCallback('disconnect', callback => {
      callback(maybeError);
    });
  }
  _clearConnectionAndHeartbeatTimers() {
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = null;
    }
    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
  _heartbeat_timeout() {
    console.log('Connection timeout. No sockjs heartbeat received.');
    this._lostConnection(new this.ConnectionError("Heartbeat timed out"));
  }
  _heartbeat_received() {
    // If we've already permanently shut down this stream, the timeout is
    // already cleared, and we don't need to set it again.
    if (this._forcedToDisconnect) return;
    if (this.heartbeatTimer) clearTimeout(this.heartbeatTimer);
    this.heartbeatTimer = setTimeout(this._heartbeat_timeout.bind(this), this.HEARTBEAT_TIMEOUT);
  }
  _sockjsProtocolsWhitelist() {
    // only allow polling protocols. no streaming.  streaming
    // makes safari spin.
    var protocolsWhitelist = ['xdr-polling', 'xhr-polling', 'iframe-xhr-polling', 'jsonp-polling'];

    // iOS 4 and 5 and below crash when using websockets over certain
    // proxies. this seems to be resolved with iOS 6. eg
    // https://github.com/LearnBoost/socket.io/issues/193#issuecomment-7308865.
    //
    // iOS <4 doesn't support websockets at all so sockjs will just
    // immediately fall back to http
    var noWebsockets = navigator && /iPhone|iPad|iPod/.test(navigator.userAgent) && /OS 4_|OS 5_/.test(navigator.userAgent);
    if (!noWebsockets) protocolsWhitelist = ['websocket'].concat(protocolsWhitelist);
    return protocolsWhitelist;
  }
  _launchConnection() {
    this._cleanup(); // cleanup the old socket, if there was one.

    var options = _objectSpread({
      transports: this._sockjsProtocolsWhitelist()
    }, this.options._sockjsOptions);
    const hasSockJS = typeof SockJS === "function";
    const disableSockJS = __meteor_runtime_config__.DISABLE_SOCKJS;
    this.socket = hasSockJS && !disableSockJS
    // Convert raw URL to SockJS URL each time we open a connection, so
    // that we can connect to random hostnames and get around browser
    // per-host connection limits.
    ? new SockJS(toSockjsUrl(this.rawUrl), undefined, options) : new WebSocket(toWebsocketUrl(this.rawUrl));
    this.socket.onopen = data => {
      this.lastError = null;
      this._connected();
    };
    this.socket.onmessage = data => {
      this.lastError = null;
      this._heartbeat_received();
      if (this.currentStatus.connected) {
        this.forEachCallback('message', callback => {
          callback(data.data);
        });
      }
    };
    this.socket.onclose = () => {
      this._lostConnection();
    };
    this.socket.onerror = error => {
      const {
        lastError
      } = this;
      this.lastError = error;
      if (lastError) return;
      console.error('stream error', error, new Date().toDateString());
    };
    this.socket.onheartbeat = () => {
      this.lastError = null;
      this._heartbeat_received();
    };
    if (this.connectionTimer) clearTimeout(this.connectionTimer);
    this.connectionTimer = setTimeout(() => {
      this._lostConnection(new this.ConnectionError("DDP connection timed out"));
    }, this.CONNECT_TIMEOUT);
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"common.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/socket-stream-client/common.js                                                                            //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let _objectSpread;
module.link("@babel/runtime/helpers/objectSpread2", {
  default(v) {
    _objectSpread = v;
  }
}, 0);
module.export({
  StreamClientCommon: () => StreamClientCommon
});
let Retry;
module.link("meteor/retry", {
  Retry(v) {
    Retry = v;
  }
}, 0);
const forcedReconnectError = new Error("forced reconnect");
class StreamClientCommon {
  constructor(options) {
    this.options = _objectSpread({
      retry: true
    }, options || null);
    this.ConnectionError = options && options.ConnectionError || Error;
  }

  // Register for callbacks.
  on(name, callback) {
    if (name !== 'message' && name !== 'reset' && name !== 'disconnect') throw new Error('unknown event type: ' + name);
    if (!this.eventCallbacks[name]) this.eventCallbacks[name] = [];
    this.eventCallbacks[name].push(callback);
  }
  forEachCallback(name, cb) {
    if (!this.eventCallbacks[name] || !this.eventCallbacks[name].length) {
      return;
    }
    this.eventCallbacks[name].forEach(cb);
  }
  _initCommon(options) {
    options = options || Object.create(null);

    //// Constants

    // how long to wait until we declare the connection attempt
    // failed.
    this.CONNECT_TIMEOUT = options.connectTimeoutMs || 10000;
    this.eventCallbacks = Object.create(null); // name -> [callback]

    this._forcedToDisconnect = false;

    //// Reactive status
    this.currentStatus = {
      status: 'connecting',
      connected: false,
      retryCount: 0
    };
    if (Package.tracker) {
      this.statusListeners = new Package.tracker.Tracker.Dependency();
    }
    this.statusChanged = () => {
      if (this.statusListeners) {
        this.statusListeners.changed();
      }
    };

    //// Retry logic
    this._retry = new Retry();
    this.connectionTimer = null;
  }

  // Trigger a reconnect.
  reconnect(options) {
    options = options || Object.create(null);
    if (options.url) {
      this._changeUrl(options.url);
    }
    if (options._sockjsOptions) {
      this.options._sockjsOptions = options._sockjsOptions;
    }
    if (this.currentStatus.connected) {
      if (options._force || options.url) {
        this._lostConnection(forcedReconnectError);
      }
      return;
    }

    // if we're mid-connection, stop it.
    if (this.currentStatus.status === 'connecting') {
      // Pretend it's a clean close.
      this._lostConnection();
    }
    this._retry.clear();
    this.currentStatus.retryCount -= 1; // don't count manual retries
    this._retryNow();
  }
  disconnect(options) {
    options = options || Object.create(null);

    // Failed is permanent. If we're failed, don't let people go back
    // online by calling 'disconnect' then 'reconnect'.
    if (this._forcedToDisconnect) return;

    // If _permanent is set, permanently disconnect a stream. Once a stream
    // is forced to disconnect, it can never reconnect. This is for
    // error cases such as ddp version mismatch, where trying again
    // won't fix the problem.
    if (options._permanent) {
      this._forcedToDisconnect = true;
    }
    this._cleanup();
    this._retry.clear();
    this.currentStatus = {
      status: options._permanent ? 'failed' : 'offline',
      connected: false,
      retryCount: 0
    };
    if (options._permanent && options._error) this.currentStatus.reason = options._error;
    this.statusChanged();
  }

  // maybeError is set unless it's a clean protocol-level close.
  _lostConnection(maybeError) {
    this._cleanup(maybeError);
    this._retryLater(maybeError); // sets status. no need to do it here.
  }

  // fired when we detect that we've gone online. try to reconnect
  // immediately.
  _online() {
    // if we've requested to be offline by disconnecting, don't reconnect.
    if (this.currentStatus.status != 'offline') this.reconnect();
  }
  _retryLater(maybeError) {
    var timeout = 0;
    if (this.options.retry || maybeError === forcedReconnectError) {
      timeout = this._retry.retryLater(this.currentStatus.retryCount, this._retryNow.bind(this));
      this.currentStatus.status = 'waiting';
      this.currentStatus.retryTime = new Date().getTime() + timeout;
    } else {
      this.currentStatus.status = 'failed';
      delete this.currentStatus.retryTime;
    }
    this.currentStatus.connected = false;
    this.statusChanged();
  }
  _retryNow() {
    if (this._forcedToDisconnect) return;
    this.currentStatus.retryCount += 1;
    this.currentStatus.status = 'connecting';
    this.currentStatus.connected = false;
    delete this.currentStatus.retryTime;
    this.statusChanged();
    this._launchConnection();
  }

  // Get current status. Reactive.
  status() {
    if (this.statusListeners) {
      this.statusListeners.depend();
    }
    return this.currentStatus;
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"sockjs-1.6.1-min-.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/socket-stream-client/sockjs-1.6.1-min-.js                                                                 //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
!function (module1) {
  /* sockjs-client v1.6.1 | http://sockjs.org | MIT license */
  !function (e) {
    if ("object" == typeof exports && "undefined" != typeof module) module.exports = e();else if ("function" == typeof define && define.amd) define([], e);else {
      ("undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this).SockJS = e();
    }
  }(function () {
    return function i(s, a, l) {
      function u(t, e) {
        if (!a[t]) {
          if (!s[t]) {
            var n = "function" == typeof require && require;
            if (!e && n) return n(t, !0);
            if (c) return c(t, !0);
            var r = new Error("Cannot find module '" + t + "'");
            throw r.code = "MODULE_NOT_FOUND", r;
          }
          var o = a[t] = {
            exports: {}
          };
          s[t][0].call(o.exports, function (e) {
            return u(s[t][1][e] || e);
          }, o, o.exports, i, s, a, l);
        }
        return a[t].exports;
      }
      for (var c = "function" == typeof require && require, e = 0; e < l.length; e++) u(l[e]);
      return u;
    }({
      1: [function (n, r, e) {
        (function (t) {
          (function () {
            "use strict";

            var e = n("./transport-list");
            r.exports = n("./main")(e), "_sockjs_onload" in t && setTimeout(t._sockjs_onload, 1);
          }).call(this);
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
      }, {
        "./main": 14,
        "./transport-list": 16
      }],
      2: [function (e, t, n) {
        "use strict";

        var r = e("inherits"),
          o = e("./event");
        function i() {
          o.call(this), this.initEvent("close", !1, !1), this.wasClean = !1, this.code = 0, this.reason = "";
        }
        r(i, o), t.exports = i;
      }, {
        "./event": 4,
        "inherits": 54
      }],
      3: [function (e, t, n) {
        "use strict";

        var r = e("inherits"),
          o = e("./eventtarget");
        function i() {
          o.call(this);
        }
        r(i, o), i.prototype.removeAllListeners = function (e) {
          e ? delete this._listeners[e] : this._listeners = {};
        }, i.prototype.once = function (t, n) {
          var r = this,
            o = !1;
          this.on(t, function e() {
            r.removeListener(t, e), o || (o = !0, n.apply(this, arguments));
          });
        }, i.prototype.emit = function () {
          var e = arguments[0],
            t = this._listeners[e];
          if (t) {
            for (var n = arguments.length, r = new Array(n - 1), o = 1; o < n; o++) r[o - 1] = arguments[o];
            for (var i = 0; i < t.length; i++) t[i].apply(this, r);
          }
        }, i.prototype.on = i.prototype.addListener = o.prototype.addEventListener, i.prototype.removeListener = o.prototype.removeEventListener, t.exports.EventEmitter = i;
      }, {
        "./eventtarget": 5,
        "inherits": 54
      }],
      4: [function (e, t, n) {
        "use strict";

        function r(e) {
          this.type = e;
        }
        r.prototype.initEvent = function (e, t, n) {
          return this.type = e, this.bubbles = t, this.cancelable = n, this.timeStamp = +new Date(), this;
        }, r.prototype.stopPropagation = function () {}, r.prototype.preventDefault = function () {}, r.CAPTURING_PHASE = 1, r.AT_TARGET = 2, r.BUBBLING_PHASE = 3, t.exports = r;
      }, {}],
      5: [function (e, t, n) {
        "use strict";

        function r() {
          this._listeners = {};
        }
        r.prototype.addEventListener = function (e, t) {
          e in this._listeners || (this._listeners[e] = []);
          var n = this._listeners[e];
          -1 === n.indexOf(t) && (n = n.concat([t])), this._listeners[e] = n;
        }, r.prototype.removeEventListener = function (e, t) {
          var n = this._listeners[e];
          if (n) {
            var r = n.indexOf(t);
            -1 === r || (1 < n.length ? this._listeners[e] = n.slice(0, r).concat(n.slice(r + 1)) : delete this._listeners[e]);
          }
        }, r.prototype.dispatchEvent = function () {
          var e = arguments[0],
            t = e.type,
            n = 1 === arguments.length ? [e] : Array.apply(null, arguments);
          if (this["on" + t] && this["on" + t].apply(this, n), t in this._listeners) for (var r = this._listeners[t], o = 0; o < r.length; o++) r[o].apply(this, n);
        }, t.exports = r;
      }, {}],
      6: [function (e, t, n) {
        "use strict";

        var r = e("inherits"),
          o = e("./event");
        function i(e) {
          o.call(this), this.initEvent("message", !1, !1), this.data = e;
        }
        r(i, o), t.exports = i;
      }, {
        "./event": 4,
        "inherits": 54
      }],
      7: [function (e, t, n) {
        "use strict";

        var r = e("./utils/iframe");
        function o(e) {
          (this._transport = e).on("message", this._transportMessage.bind(this)), e.on("close", this._transportClose.bind(this));
        }
        o.prototype._transportClose = function (e, t) {
          r.postMessage("c", JSON.stringify([e, t]));
        }, o.prototype._transportMessage = function (e) {
          r.postMessage("t", e);
        }, o.prototype._send = function (e) {
          this._transport.send(e);
        }, o.prototype._close = function () {
          this._transport.close(), this._transport.removeAllListeners();
        }, t.exports = o;
      }, {
        "./utils/iframe": 47
      }],
      8: [function (e, t, n) {
        "use strict";

        var f = e("./utils/url"),
          r = e("./utils/event"),
          h = e("./facade"),
          o = e("./info-iframe-receiver"),
          d = e("./utils/iframe"),
          p = e("./location"),
          m = function () {};
        t.exports = function (l, e) {
          var u,
            c = {};
          e.forEach(function (e) {
            e.facadeTransport && (c[e.facadeTransport.transportName] = e.facadeTransport);
          }), c[o.transportName] = o, l.bootstrap_iframe = function () {
            var a;
            d.currentWindowId = p.hash.slice(1);
            r.attachEvent("message", function (t) {
              if (t.source === parent && (void 0 === u && (u = t.origin), t.origin === u)) {
                var n;
                try {
                  n = JSON.parse(t.data);
                } catch (e) {
                  return void m("bad json", t.data);
                }
                if (n.windowId === d.currentWindowId) switch (n.type) {
                  case "s":
                    var e;
                    try {
                      e = JSON.parse(n.data);
                    } catch (e) {
                      m("bad json", n.data);
                      break;
                    }
                    var r = e[0],
                      o = e[1],
                      i = e[2],
                      s = e[3];
                    if (m(r, o, i, s), r !== l.version) throw new Error('Incompatible SockJS! Main site uses: "' + r + '", the iframe: "' + l.version + '".');
                    if (!f.isOriginEqual(i, p.href) || !f.isOriginEqual(s, p.href)) throw new Error("Can't connect to different domain from within an iframe. (" + p.href + ", " + i + ", " + s + ")");
                    a = new h(new c[o](i, s));
                    break;
                  case "m":
                    a._send(n.data);
                    break;
                  case "c":
                    a && a._close(), a = null;
                }
              }
            }), d.postMessage("s");
          };
        };
      }, {
        "./facade": 7,
        "./info-iframe-receiver": 10,
        "./location": 13,
        "./utils/event": 46,
        "./utils/iframe": 47,
        "./utils/url": 52,
        "debug": void 0
      }],
      9: [function (e, t, n) {
        "use strict";

        var r = e("events").EventEmitter,
          o = e("inherits"),
          s = e("./utils/object"),
          a = function () {};
        function i(e, t) {
          r.call(this);
          var o = this,
            i = +new Date();
          this.xo = new t("GET", e), this.xo.once("finish", function (e, t) {
            var n, r;
            if (200 === e) {
              if (r = +new Date() - i, t) try {
                n = JSON.parse(t);
              } catch (e) {
                a("bad json", t);
              }
              s.isObject(n) || (n = {});
            }
            o.emit("finish", n, r), o.removeAllListeners();
          });
        }
        o(i, r), i.prototype.close = function () {
          this.removeAllListeners(), this.xo.close();
        }, t.exports = i;
      }, {
        "./utils/object": 49,
        "debug": void 0,
        "events": 3,
        "inherits": 54
      }],
      10: [function (e, t, n) {
        "use strict";

        var r = e("inherits"),
          o = e("events").EventEmitter,
          i = e("./transport/sender/xhr-local"),
          s = e("./info-ajax");
        function a(e) {
          var n = this;
          o.call(this), this.ir = new s(e, i), this.ir.once("finish", function (e, t) {
            n.ir = null, n.emit("message", JSON.stringify([e, t]));
          });
        }
        r(a, o), a.transportName = "iframe-info-receiver", a.prototype.close = function () {
          this.ir && (this.ir.close(), this.ir = null), this.removeAllListeners();
        }, t.exports = a;
      }, {
        "./info-ajax": 9,
        "./transport/sender/xhr-local": 37,
        "events": 3,
        "inherits": 54
      }],
      11: [function (n, o, e) {
        (function (u) {
          (function () {
            "use strict";

            var r = n("events").EventEmitter,
              e = n("inherits"),
              i = n("./utils/event"),
              s = n("./transport/iframe"),
              a = n("./info-iframe-receiver"),
              l = function () {};
            function t(t, n) {
              var o = this;
              r.call(this);
              function e() {
                var e = o.ifr = new s(a.transportName, n, t);
                e.once("message", function (t) {
                  if (t) {
                    var e;
                    try {
                      e = JSON.parse(t);
                    } catch (e) {
                      return l("bad json", t), o.emit("finish"), void o.close();
                    }
                    var n = e[0],
                      r = e[1];
                    o.emit("finish", n, r);
                  }
                  o.close();
                }), e.once("close", function () {
                  o.emit("finish"), o.close();
                });
              }
              u.document.body ? e() : i.attachEvent("load", e);
            }
            e(t, r), t.enabled = function () {
              return s.enabled();
            }, t.prototype.close = function () {
              this.ifr && this.ifr.close(), this.removeAllListeners(), this.ifr = null;
            }, o.exports = t;
          }).call(this);
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
      }, {
        "./info-iframe-receiver": 10,
        "./transport/iframe": 22,
        "./utils/event": 46,
        "debug": void 0,
        "events": 3,
        "inherits": 54
      }],
      12: [function (e, t, n) {
        "use strict";

        var r = e("events").EventEmitter,
          o = e("inherits"),
          i = e("./utils/url"),
          s = e("./transport/sender/xdr"),
          a = e("./transport/sender/xhr-cors"),
          l = e("./transport/sender/xhr-local"),
          u = e("./transport/sender/xhr-fake"),
          c = e("./info-iframe"),
          f = e("./info-ajax"),
          h = function () {};
        function d(e, t) {
          h(e);
          var n = this;
          r.call(this), setTimeout(function () {
            n.doXhr(e, t);
          }, 0);
        }
        o(d, r), d._getReceiver = function (e, t, n) {
          return n.sameOrigin ? new f(t, l) : a.enabled ? new f(t, a) : s.enabled && n.sameScheme ? new f(t, s) : c.enabled() ? new c(e, t) : new f(t, u);
        }, d.prototype.doXhr = function (e, t) {
          var n = this,
            r = i.addPath(e, "/info");
          h("doXhr", r), this.xo = d._getReceiver(e, r, t), this.timeoutRef = setTimeout(function () {
            h("timeout"), n._cleanup(!1), n.emit("finish");
          }, d.timeout), this.xo.once("finish", function (e, t) {
            h("finish", e, t), n._cleanup(!0), n.emit("finish", e, t);
          });
        }, d.prototype._cleanup = function (e) {
          h("_cleanup"), clearTimeout(this.timeoutRef), this.timeoutRef = null, !e && this.xo && this.xo.close(), this.xo = null;
        }, d.prototype.close = function () {
          h("close"), this.removeAllListeners(), this._cleanup(!1);
        }, d.timeout = 8e3, t.exports = d;
      }, {
        "./info-ajax": 9,
        "./info-iframe": 11,
        "./transport/sender/xdr": 34,
        "./transport/sender/xhr-cors": 35,
        "./transport/sender/xhr-fake": 36,
        "./transport/sender/xhr-local": 37,
        "./utils/url": 52,
        "debug": void 0,
        "events": 3,
        "inherits": 54
      }],
      13: [function (e, t, n) {
        (function (e) {
          (function () {
            "use strict";

            t.exports = e.location || {
              origin: "http://localhost:80",
              protocol: "http:",
              host: "localhost",
              port: 80,
              href: "http://localhost/",
              hash: ""
            };
          }).call(this);
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
      }, {}],
      14: [function (x, _, e) {
        (function (w) {
          (function () {
            "use strict";

            x("./shims");
            var r,
              l = x("url-parse"),
              e = x("inherits"),
              u = x("./utils/random"),
              t = x("./utils/escape"),
              c = x("./utils/url"),
              i = x("./utils/event"),
              n = x("./utils/transport"),
              o = x("./utils/object"),
              f = x("./utils/browser"),
              h = x("./utils/log"),
              s = x("./event/event"),
              d = x("./event/eventtarget"),
              p = x("./location"),
              a = x("./event/close"),
              m = x("./event/trans-message"),
              v = x("./info-receiver"),
              b = function () {};
            function y(e, t, n) {
              if (!(this instanceof y)) return new y(e, t, n);
              if (arguments.length < 1) throw new TypeError("Failed to construct 'SockJS: 1 argument required, but only 0 present");
              d.call(this), this.readyState = y.CONNECTING, this.extensions = "", this.protocol = "", (n = n || {}).protocols_whitelist && h.warn("'protocols_whitelist' is DEPRECATED. Use 'transports' instead."), this._transportsWhitelist = n.transports, this._transportOptions = n.transportOptions || {}, this._timeout = n.timeout || 0;
              var r = n.sessionId || 8;
              if ("function" == typeof r) this._generateSessionId = r;else {
                if ("number" != typeof r) throw new TypeError("If sessionId is used in the options, it needs to be a number or a function.");
                this._generateSessionId = function () {
                  return u.string(r);
                };
              }
              this._server = n.server || u.numberString(1e3);
              var o = new l(e);
              if (!o.host || !o.protocol) throw new SyntaxError("The URL '" + e + "' is invalid");
              if (o.hash) throw new SyntaxError("The URL must not contain a fragment");
              if ("http:" !== o.protocol && "https:" !== o.protocol) throw new SyntaxError("The URL's scheme must be either 'http:' or 'https:'. '" + o.protocol + "' is not allowed.");
              var i = "https:" === o.protocol;
              if ("https:" === p.protocol && !i && !c.isLoopbackAddr(o.hostname)) throw new Error("SecurityError: An insecure SockJS connection may not be initiated from a page loaded over HTTPS");
              t ? Array.isArray(t) || (t = [t]) : t = [];
              var s = t.sort();
              s.forEach(function (e, t) {
                if (!e) throw new SyntaxError("The protocols entry '" + e + "' is invalid.");
                if (t < s.length - 1 && e === s[t + 1]) throw new SyntaxError("The protocols entry '" + e + "' is duplicated.");
              });
              var a = c.getOrigin(p.href);
              this._origin = a ? a.toLowerCase() : null, o.set("pathname", o.pathname.replace(/\/+$/, "")), this.url = o.href, b("using url", this.url), this._urlInfo = {
                nullOrigin: !f.hasDomain(),
                sameOrigin: c.isOriginEqual(this.url, p.href),
                sameScheme: c.isSchemeEqual(this.url, p.href)
              }, this._ir = new v(this.url, this._urlInfo), this._ir.once("finish", this._receiveInfo.bind(this));
            }
            function g(e) {
              return 1e3 === e || 3e3 <= e && e <= 4999;
            }
            e(y, d), y.prototype.close = function (e, t) {
              if (e && !g(e)) throw new Error("InvalidAccessError: Invalid code");
              if (t && 123 < t.length) throw new SyntaxError("reason argument has an invalid length");
              if (this.readyState !== y.CLOSING && this.readyState !== y.CLOSED) {
                this._close(e || 1e3, t || "Normal closure", !0);
              }
            }, y.prototype.send = function (e) {
              if ("string" != typeof e && (e = "" + e), this.readyState === y.CONNECTING) throw new Error("InvalidStateError: The connection has not been established yet");
              this.readyState === y.OPEN && this._transport.send(t.quote(e));
            }, y.version = x("./version"), y.CONNECTING = 0, y.OPEN = 1, y.CLOSING = 2, y.CLOSED = 3, y.prototype._receiveInfo = function (e, t) {
              if (b("_receiveInfo", t), this._ir = null, e) {
                this._rto = this.countRTO(t), this._transUrl = e.base_url ? e.base_url : this.url, e = o.extend(e, this._urlInfo), b("info", e);
                var n = r.filterToEnabled(this._transportsWhitelist, e);
                this._transports = n.main, b(this._transports.length + " enabled transports"), this._connect();
              } else this._close(1002, "Cannot connect to server");
            }, y.prototype._connect = function () {
              for (var e = this._transports.shift(); e; e = this._transports.shift()) {
                if (b("attempt", e.transportName), e.needBody && (!w.document.body || void 0 !== w.document.readyState && "complete" !== w.document.readyState && "interactive" !== w.document.readyState)) return b("waiting for body"), this._transports.unshift(e), void i.attachEvent("load", this._connect.bind(this));
                var t = Math.max(this._timeout, this._rto * e.roundTrips || 5e3);
                this._transportTimeoutId = setTimeout(this._transportTimeout.bind(this), t), b("using timeout", t);
                var n = c.addPath(this._transUrl, "/" + this._server + "/" + this._generateSessionId()),
                  r = this._transportOptions[e.transportName];
                b("transport url", n);
                var o = new e(n, this._transUrl, r);
                return o.on("message", this._transportMessage.bind(this)), o.once("close", this._transportClose.bind(this)), o.transportName = e.transportName, void (this._transport = o);
              }
              this._close(2e3, "All transports failed", !1);
            }, y.prototype._transportTimeout = function () {
              b("_transportTimeout"), this.readyState === y.CONNECTING && (this._transport && this._transport.close(), this._transportClose(2007, "Transport timed out"));
            }, y.prototype._transportMessage = function (e) {
              b("_transportMessage", e);
              var t,
                n = this,
                r = e.slice(0, 1),
                o = e.slice(1);
              switch (r) {
                case "o":
                  return void this._open();
                case "h":
                  return this.dispatchEvent(new s("heartbeat")), void b("heartbeat", this.transport);
              }
              if (o) try {
                t = JSON.parse(o);
              } catch (e) {
                b("bad json", o);
              }
              if (void 0 !== t) switch (r) {
                case "a":
                  Array.isArray(t) && t.forEach(function (e) {
                    b("message", n.transport, e), n.dispatchEvent(new m(e));
                  });
                  break;
                case "m":
                  b("message", this.transport, t), this.dispatchEvent(new m(t));
                  break;
                case "c":
                  Array.isArray(t) && 2 === t.length && this._close(t[0], t[1], !0);
              } else b("empty payload", o);
            }, y.prototype._transportClose = function (e, t) {
              b("_transportClose", this.transport, e, t), this._transport && (this._transport.removeAllListeners(), this._transport = null, this.transport = null), g(e) || 2e3 === e || this.readyState !== y.CONNECTING ? this._close(e, t) : this._connect();
            }, y.prototype._open = function () {
              b("_open", this._transport && this._transport.transportName, this.readyState), this.readyState === y.CONNECTING ? (this._transportTimeoutId && (clearTimeout(this._transportTimeoutId), this._transportTimeoutId = null), this.readyState = y.OPEN, this.transport = this._transport.transportName, this.dispatchEvent(new s("open")), b("connected", this.transport)) : this._close(1006, "Server lost session");
            }, y.prototype._close = function (t, n, r) {
              b("_close", this.transport, t, n, r, this.readyState);
              var o = !1;
              if (this._ir && (o = !0, this._ir.close(), this._ir = null), this._transport && (this._transport.close(), this._transport = null, this.transport = null), this.readyState === y.CLOSED) throw new Error("InvalidStateError: SockJS has already been closed");
              this.readyState = y.CLOSING, setTimeout(function () {
                this.readyState = y.CLOSED, o && this.dispatchEvent(new s("error"));
                var e = new a("close");
                e.wasClean = r || !1, e.code = t || 1e3, e.reason = n, this.dispatchEvent(e), this.onmessage = this.onclose = this.onerror = null, b("disconnected");
              }.bind(this), 0);
            }, y.prototype.countRTO = function (e) {
              return 100 < e ? 4 * e : 300 + e;
            }, _.exports = function (e) {
              return r = n(e), x("./iframe-bootstrap")(y, e), y;
            };
          }).call(this);
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
      }, {
        "./event/close": 2,
        "./event/event": 4,
        "./event/eventtarget": 5,
        "./event/trans-message": 6,
        "./iframe-bootstrap": 8,
        "./info-receiver": 12,
        "./location": 13,
        "./shims": 15,
        "./utils/browser": 44,
        "./utils/escape": 45,
        "./utils/event": 46,
        "./utils/log": 48,
        "./utils/object": 49,
        "./utils/random": 50,
        "./utils/transport": 51,
        "./utils/url": 52,
        "./version": 53,
        "debug": void 0,
        "inherits": 54,
        "url-parse": 57
      }],
      15: [function (e, t, n) {
        "use strict";

        function a(e) {
          return "[object Function]" === i.toString.call(e);
        }
        function l(e) {
          return "[object String]" === f.call(e);
        }
        var o,
          c = Array.prototype,
          i = Object.prototype,
          r = Function.prototype,
          s = String.prototype,
          u = c.slice,
          f = i.toString,
          h = Object.defineProperty && function () {
            try {
              return Object.defineProperty({}, "x", {}), !0;
            } catch (e) {
              return !1;
            }
          }();
        o = h ? function (e, t, n, r) {
          !r && t in e || Object.defineProperty(e, t, {
            configurable: !0,
            enumerable: !1,
            writable: !0,
            value: n
          });
        } : function (e, t, n, r) {
          !r && t in e || (e[t] = n);
        };
        function d(e, t, n) {
          for (var r in t) i.hasOwnProperty.call(t, r) && o(e, r, t[r], n);
        }
        function p(e) {
          if (null == e) throw new TypeError("can't convert " + e + " to object");
          return Object(e);
        }
        function m() {}
        d(r, {
          bind: function (t) {
            var n = this;
            if (!a(n)) throw new TypeError("Function.prototype.bind called on incompatible " + n);
            for (var r = u.call(arguments, 1), e = Math.max(0, n.length - r.length), o = [], i = 0; i < e; i++) o.push("$" + i);
            var s = Function("binder", "return function (" + o.join(",") + "){ return binder.apply(this, arguments); }")(function () {
              if (this instanceof s) {
                var e = n.apply(this, r.concat(u.call(arguments)));
                return Object(e) === e ? e : this;
              }
              return n.apply(t, r.concat(u.call(arguments)));
            });
            return n.prototype && (m.prototype = n.prototype, s.prototype = new m(), m.prototype = null), s;
          }
        }), d(Array, {
          isArray: function (e) {
            return "[object Array]" === f.call(e);
          }
        });
        var v,
          b,
          y,
          g = Object("a"),
          w = "a" !== g[0] || !(0 in g);
        d(c, {
          forEach: function (e, t) {
            var n = p(this),
              r = w && l(this) ? this.split("") : n,
              o = t,
              i = -1,
              s = r.length >>> 0;
            if (!a(e)) throw new TypeError();
            for (; ++i < s;) i in r && e.call(o, r[i], i, n);
          }
        }, (v = c.forEach, y = b = !0, v && (v.call("foo", function (e, t, n) {
          "object" != typeof n && (b = !1);
        }), v.call([1], function () {
          y = "string" == typeof this;
        }, "x")), !(v && b && y)));
        var x = Array.prototype.indexOf && -1 !== [0, 1].indexOf(1, 2);
        d(c, {
          indexOf: function (e, t) {
            var n = w && l(this) ? this.split("") : p(this),
              r = n.length >>> 0;
            if (!r) return -1;
            var o = 0;
            for (1 < arguments.length && (o = function (e) {
              var t = +e;
              return t != t ? t = 0 : 0 !== t && t !== 1 / 0 && t !== -1 / 0 && (t = (0 < t || -1) * Math.floor(Math.abs(t))), t;
            }(t)), o = 0 <= o ? o : Math.max(0, r + o); o < r; o++) if (o in n && n[o] === e) return o;
            return -1;
          }
        }, x);
        var _,
          E = s.split;
        2 !== "ab".split(/(?:ab)*/).length || 4 !== ".".split(/(.?)(.?)/).length || "t" === "tesst".split(/(s)*/)[1] || 4 !== "test".split(/(?:)/, -1).length || "".split(/.?/).length || 1 < ".".split(/()()/).length ? (_ = void 0 === /()??/.exec("")[1], s.split = function (e, t) {
          var n = this;
          if (void 0 === e && 0 === t) return [];
          if ("[object RegExp]" !== f.call(e)) return E.call(this, e, t);
          var r,
            o,
            i,
            s,
            a = [],
            l = (e.ignoreCase ? "i" : "") + (e.multiline ? "m" : "") + (e.extended ? "x" : "") + (e.sticky ? "y" : ""),
            u = 0;
          for (e = new RegExp(e.source, l + "g"), n += "", _ || (r = new RegExp("^" + e.source + "$(?!\\s)", l)), t = void 0 === t ? -1 >>> 0 : function (e) {
            return e >>> 0;
          }(t); (o = e.exec(n)) && !(u < (i = o.index + o[0].length) && (a.push(n.slice(u, o.index)), !_ && 1 < o.length && o[0].replace(r, function () {
            for (var e = 1; e < arguments.length - 2; e++) void 0 === arguments[e] && (o[e] = void 0);
          }), 1 < o.length && o.index < n.length && c.push.apply(a, o.slice(1)), s = o[0].length, u = i, a.length >= t));) e.lastIndex === o.index && e.lastIndex++;
          return u === n.length ? !s && e.test("") || a.push("") : a.push(n.slice(u)), a.length > t ? a.slice(0, t) : a;
        }) : "0".split(void 0, 0).length && (s.split = function (e, t) {
          return void 0 === e && 0 === t ? [] : E.call(this, e, t);
        });
        var S = s.substr,
          O = "".substr && "b" !== "0b".substr(-1);
        d(s, {
          substr: function (e, t) {
            return S.call(this, e < 0 && (e = this.length + e) < 0 ? 0 : e, t);
          }
        }, O);
      }, {}],
      16: [function (e, t, n) {
        "use strict";

        t.exports = [e("./transport/websocket"), e("./transport/xhr-streaming"), e("./transport/xdr-streaming"), e("./transport/eventsource"), e("./transport/lib/iframe-wrap")(e("./transport/eventsource")), e("./transport/htmlfile"), e("./transport/lib/iframe-wrap")(e("./transport/htmlfile")), e("./transport/xhr-polling"), e("./transport/xdr-polling"), e("./transport/lib/iframe-wrap")(e("./transport/xhr-polling")), e("./transport/jsonp-polling")];
      }, {
        "./transport/eventsource": 20,
        "./transport/htmlfile": 21,
        "./transport/jsonp-polling": 23,
        "./transport/lib/iframe-wrap": 26,
        "./transport/websocket": 38,
        "./transport/xdr-polling": 39,
        "./transport/xdr-streaming": 40,
        "./transport/xhr-polling": 41,
        "./transport/xhr-streaming": 42
      }],
      17: [function (o, f, e) {
        (function (r) {
          (function () {
            "use strict";

            var i = o("events").EventEmitter,
              e = o("inherits"),
              s = o("../../utils/event"),
              a = o("../../utils/url"),
              l = r.XMLHttpRequest,
              u = function () {};
            function c(e, t, n, r) {
              u(e, t);
              var o = this;
              i.call(this), setTimeout(function () {
                o._start(e, t, n, r);
              }, 0);
            }
            e(c, i), c.prototype._start = function (e, t, n, r) {
              var o = this;
              try {
                this.xhr = new l();
              } catch (e) {}
              if (!this.xhr) return u("no xhr"), this.emit("finish", 0, "no xhr support"), void this._cleanup();
              t = a.addQuery(t, "t=" + +new Date()), this.unloadRef = s.unloadAdd(function () {
                u("unload cleanup"), o._cleanup(!0);
              });
              try {
                this.xhr.open(e, t, !0), this.timeout && "timeout" in this.xhr && (this.xhr.timeout = this.timeout, this.xhr.ontimeout = function () {
                  u("xhr timeout"), o.emit("finish", 0, ""), o._cleanup(!1);
                });
              } catch (e) {
                return u("exception", e), this.emit("finish", 0, ""), void this._cleanup(!1);
              }
              if (r && r.noCredentials || !c.supportsCORS || (u("withCredentials"), this.xhr.withCredentials = !0), r && r.headers) for (var i in r.headers) this.xhr.setRequestHeader(i, r.headers[i]);
              this.xhr.onreadystatechange = function () {
                if (o.xhr) {
                  var e,
                    t,
                    n = o.xhr;
                  switch (u("readyState", n.readyState), n.readyState) {
                    case 3:
                      try {
                        t = n.status, e = n.responseText;
                      } catch (e) {}
                      u("status", t), 1223 === t && (t = 204), 200 === t && e && 0 < e.length && (u("chunk"), o.emit("chunk", t, e));
                      break;
                    case 4:
                      t = n.status, u("status", t), 1223 === t && (t = 204), 12005 !== t && 12029 !== t || (t = 0), u("finish", t, n.responseText), o.emit("finish", t, n.responseText), o._cleanup(!1);
                  }
                }
              };
              try {
                o.xhr.send(n);
              } catch (e) {
                o.emit("finish", 0, ""), o._cleanup(!1);
              }
            }, c.prototype._cleanup = function (e) {
              if (u("cleanup"), this.xhr) {
                if (this.removeAllListeners(), s.unloadDel(this.unloadRef), this.xhr.onreadystatechange = function () {}, this.xhr.ontimeout && (this.xhr.ontimeout = null), e) try {
                  this.xhr.abort();
                } catch (e) {}
                this.unloadRef = this.xhr = null;
              }
            }, c.prototype.close = function () {
              u("close"), this._cleanup(!0);
            }, c.enabled = !!l;
            var t = ["Active"].concat("Object").join("X");
            !c.enabled && t in r && (u("overriding xmlhttprequest"), c.enabled = !!new (l = function () {
              try {
                return new r[t]("Microsoft.XMLHTTP");
              } catch (e) {
                return null;
              }
            })());
            var n = !1;
            try {
              n = "withCredentials" in new l();
            } catch (e) {}
            c.supportsCORS = n, f.exports = c;
          }).call(this);
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
      }, {
        "../../utils/event": 46,
        "../../utils/url": 52,
        "debug": void 0,
        "events": 3,
        "inherits": 54
      }],
      18: [function (e, t, n) {
        (function (e) {
          (function () {
            t.exports = e.EventSource;
          }).call(this);
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
      }, {}],
      19: [function (e, n, t) {
        (function (e) {
          (function () {
            "use strict";

            var t = e.WebSocket || e.MozWebSocket;
            n.exports = t ? function (e) {
              return new t(e);
            } : void 0;
          }).call(this);
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
      }, {}],
      20: [function (e, t, n) {
        "use strict";

        var r = e("inherits"),
          o = e("./lib/ajax-based"),
          i = e("./receiver/eventsource"),
          s = e("./sender/xhr-cors"),
          a = e("eventsource");
        function l(e) {
          if (!l.enabled()) throw new Error("Transport created when disabled");
          o.call(this, e, "/eventsource", i, s);
        }
        r(l, o), l.enabled = function () {
          return !!a;
        }, l.transportName = "eventsource", l.roundTrips = 2, t.exports = l;
      }, {
        "./lib/ajax-based": 24,
        "./receiver/eventsource": 29,
        "./sender/xhr-cors": 35,
        "eventsource": 18,
        "inherits": 54
      }],
      21: [function (e, t, n) {
        "use strict";

        var r = e("inherits"),
          o = e("./receiver/htmlfile"),
          i = e("./sender/xhr-local"),
          s = e("./lib/ajax-based");
        function a(e) {
          if (!o.enabled) throw new Error("Transport created when disabled");
          s.call(this, e, "/htmlfile", o, i);
        }
        r(a, s), a.enabled = function (e) {
          return o.enabled && e.sameOrigin;
        }, a.transportName = "htmlfile", a.roundTrips = 2, t.exports = a;
      }, {
        "./lib/ajax-based": 24,
        "./receiver/htmlfile": 30,
        "./sender/xhr-local": 37,
        "inherits": 54
      }],
      22: [function (e, t, n) {
        "use strict";

        var r = e("inherits"),
          i = e("events").EventEmitter,
          o = e("../version"),
          s = e("../utils/url"),
          a = e("../utils/iframe"),
          l = e("../utils/event"),
          u = e("../utils/random"),
          c = function () {};
        function f(e, t, n) {
          if (!f.enabled()) throw new Error("Transport created when disabled");
          i.call(this);
          var r = this;
          this.origin = s.getOrigin(n), this.baseUrl = n, this.transUrl = t, this.transport = e, this.windowId = u.string(8);
          var o = s.addPath(n, "/iframe.html") + "#" + this.windowId;
          c(e, t, o), this.iframeObj = a.createIframe(o, function (e) {
            c("err callback"), r.emit("close", 1006, "Unable to load an iframe (" + e + ")"), r.close();
          }), this.onmessageCallback = this._message.bind(this), l.attachEvent("message", this.onmessageCallback);
        }
        r(f, i), f.prototype.close = function () {
          if (c("close"), this.removeAllListeners(), this.iframeObj) {
            l.detachEvent("message", this.onmessageCallback);
            try {
              this.postMessage("c");
            } catch (e) {}
            this.iframeObj.cleanup(), this.iframeObj = null, this.onmessageCallback = this.iframeObj = null;
          }
        }, f.prototype._message = function (t) {
          if (c("message", t.data), s.isOriginEqual(t.origin, this.origin)) {
            var n;
            try {
              n = JSON.parse(t.data);
            } catch (e) {
              return void c("bad json", t.data);
            }
            if (n.windowId === this.windowId) switch (n.type) {
              case "s":
                this.iframeObj.loaded(), this.postMessage("s", JSON.stringify([o, this.transport, this.transUrl, this.baseUrl]));
                break;
              case "t":
                this.emit("message", n.data);
                break;
              case "c":
                var e;
                try {
                  e = JSON.parse(n.data);
                } catch (e) {
                  return void c("bad json", n.data);
                }
                this.emit("close", e[0], e[1]), this.close();
            } else c("mismatched window id", n.windowId, this.windowId);
          } else c("not same origin", t.origin, this.origin);
        }, f.prototype.postMessage = function (e, t) {
          c("postMessage", e, t), this.iframeObj.post(JSON.stringify({
            windowId: this.windowId,
            type: e,
            data: t || ""
          }), this.origin);
        }, f.prototype.send = function (e) {
          c("send", e), this.postMessage("m", e);
        }, f.enabled = function () {
          return a.iframeEnabled;
        }, f.transportName = "iframe", f.roundTrips = 2, t.exports = f;
      }, {
        "../utils/event": 46,
        "../utils/iframe": 47,
        "../utils/random": 50,
        "../utils/url": 52,
        "../version": 53,
        "debug": void 0,
        "events": 3,
        "inherits": 54
      }],
      23: [function (s, a, e) {
        (function (i) {
          (function () {
            "use strict";

            var e = s("inherits"),
              t = s("./lib/sender-receiver"),
              n = s("./receiver/jsonp"),
              r = s("./sender/jsonp");
            function o(e) {
              if (!o.enabled()) throw new Error("Transport created when disabled");
              t.call(this, e, "/jsonp", r, n);
            }
            e(o, t), o.enabled = function () {
              return !!i.document;
            }, o.transportName = "jsonp-polling", o.roundTrips = 1, o.needBody = !0, a.exports = o;
          }).call(this);
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
      }, {
        "./lib/sender-receiver": 28,
        "./receiver/jsonp": 31,
        "./sender/jsonp": 33,
        "inherits": 54
      }],
      24: [function (e, t, n) {
        "use strict";

        var r = e("inherits"),
          a = e("../../utils/url"),
          o = e("./sender-receiver"),
          l = function () {};
        function i(e, t, n, r) {
          o.call(this, e, t, function (s) {
            return function (e, t, n) {
              l("create ajax sender", e, t);
              var r = {};
              "string" == typeof t && (r.headers = {
                "Content-type": "text/plain"
              });
              var o = a.addPath(e, "/xhr_send"),
                i = new s("POST", o, t, r);
              return i.once("finish", function (e) {
                if (l("finish", e), i = null, 200 !== e && 204 !== e) return n(new Error("http status " + e));
                n();
              }), function () {
                l("abort"), i.close(), i = null;
                var e = new Error("Aborted");
                e.code = 1e3, n(e);
              };
            };
          }(r), n, r);
        }
        r(i, o), t.exports = i;
      }, {
        "../../utils/url": 52,
        "./sender-receiver": 28,
        "debug": void 0,
        "inherits": 54
      }],
      25: [function (e, t, n) {
        "use strict";

        var r = e("inherits"),
          o = e("events").EventEmitter,
          i = function () {};
        function s(e, t) {
          i(e), o.call(this), this.sendBuffer = [], this.sender = t, this.url = e;
        }
        r(s, o), s.prototype.send = function (e) {
          i("send", e), this.sendBuffer.push(e), this.sendStop || this.sendSchedule();
        }, s.prototype.sendScheduleWait = function () {
          i("sendScheduleWait");
          var e,
            t = this;
          this.sendStop = function () {
            i("sendStop"), t.sendStop = null, clearTimeout(e);
          }, e = setTimeout(function () {
            i("timeout"), t.sendStop = null, t.sendSchedule();
          }, 25);
        }, s.prototype.sendSchedule = function () {
          i("sendSchedule", this.sendBuffer.length);
          var t = this;
          if (0 < this.sendBuffer.length) {
            var e = "[" + this.sendBuffer.join(",") + "]";
            this.sendStop = this.sender(this.url, e, function (e) {
              t.sendStop = null, e ? (i("error", e), t.emit("close", e.code || 1006, "Sending error: " + e), t.close()) : t.sendScheduleWait();
            }), this.sendBuffer = [];
          }
        }, s.prototype._cleanup = function () {
          i("_cleanup"), this.removeAllListeners();
        }, s.prototype.close = function () {
          i("close"), this._cleanup(), this.sendStop && (this.sendStop(), this.sendStop = null);
        }, t.exports = s;
      }, {
        "debug": void 0,
        "events": 3,
        "inherits": 54
      }],
      26: [function (e, n, t) {
        (function (s) {
          (function () {
            "use strict";

            var t = e("inherits"),
              o = e("../iframe"),
              i = e("../../utils/object");
            n.exports = function (r) {
              function e(e, t) {
                o.call(this, r.transportName, e, t);
              }
              return t(e, o), e.enabled = function (e, t) {
                if (!s.document) return !1;
                var n = i.extend({}, t);
                return n.sameOrigin = !0, r.enabled(n) && o.enabled();
              }, e.transportName = "iframe-" + r.transportName, e.needBody = !0, e.roundTrips = o.roundTrips + r.roundTrips - 1, e.facadeTransport = r, e;
            };
          }).call(this);
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
      }, {
        "../../utils/object": 49,
        "../iframe": 22,
        "inherits": 54
      }],
      27: [function (e, t, n) {
        "use strict";

        var r = e("inherits"),
          o = e("events").EventEmitter,
          i = function () {};
        function s(e, t, n) {
          i(t), o.call(this), this.Receiver = e, this.receiveUrl = t, this.AjaxObject = n, this._scheduleReceiver();
        }
        r(s, o), s.prototype._scheduleReceiver = function () {
          i("_scheduleReceiver");
          var n = this,
            r = this.poll = new this.Receiver(this.receiveUrl, this.AjaxObject);
          r.on("message", function (e) {
            i("message", e), n.emit("message", e);
          }), r.once("close", function (e, t) {
            i("close", e, t, n.pollIsClosing), n.poll = r = null, n.pollIsClosing || ("network" === t ? n._scheduleReceiver() : (n.emit("close", e || 1006, t), n.removeAllListeners()));
          });
        }, s.prototype.abort = function () {
          i("abort"), this.removeAllListeners(), this.pollIsClosing = !0, this.poll && this.poll.abort();
        }, t.exports = s;
      }, {
        "debug": void 0,
        "events": 3,
        "inherits": 54
      }],
      28: [function (e, t, n) {
        "use strict";

        var r = e("inherits"),
          a = e("../../utils/url"),
          l = e("./buffered-sender"),
          u = e("./polling"),
          c = function () {};
        function o(e, t, n, r, o) {
          var i = a.addPath(e, t);
          c(i);
          var s = this;
          l.call(this, e, n), this.poll = new u(r, i, o), this.poll.on("message", function (e) {
            c("poll message", e), s.emit("message", e);
          }), this.poll.once("close", function (e, t) {
            c("poll close", e, t), s.poll = null, s.emit("close", e, t), s.close();
          });
        }
        r(o, l), o.prototype.close = function () {
          l.prototype.close.call(this), c("close"), this.removeAllListeners(), this.poll && (this.poll.abort(), this.poll = null);
        }, t.exports = o;
      }, {
        "../../utils/url": 52,
        "./buffered-sender": 25,
        "./polling": 27,
        "debug": void 0,
        "inherits": 54
      }],
      29: [function (e, t, n) {
        "use strict";

        var r = e("inherits"),
          o = e("events").EventEmitter,
          i = e("eventsource"),
          s = function () {};
        function a(e) {
          s(e), o.call(this);
          var n = this,
            r = this.es = new i(e);
          r.onmessage = function (e) {
            s("message", e.data), n.emit("message", decodeURI(e.data));
          }, r.onerror = function (e) {
            s("error", r.readyState, e);
            var t = 2 !== r.readyState ? "network" : "permanent";
            n._cleanup(), n._close(t);
          };
        }
        r(a, o), a.prototype.abort = function () {
          s("abort"), this._cleanup(), this._close("user");
        }, a.prototype._cleanup = function () {
          s("cleanup");
          var e = this.es;
          e && (e.onmessage = e.onerror = null, e.close(), this.es = null);
        }, a.prototype._close = function (e) {
          s("close", e);
          var t = this;
          setTimeout(function () {
            t.emit("close", null, e), t.removeAllListeners();
          }, 200);
        }, t.exports = a;
      }, {
        "debug": void 0,
        "events": 3,
        "eventsource": 18,
        "inherits": 54
      }],
      30: [function (n, c, e) {
        (function (u) {
          (function () {
            "use strict";

            var e = n("inherits"),
              r = n("../../utils/iframe"),
              o = n("../../utils/url"),
              i = n("events").EventEmitter,
              s = n("../../utils/random"),
              a = function () {};
            function l(e) {
              a(e), i.call(this);
              var t = this;
              r.polluteGlobalNamespace(), this.id = "a" + s.string(6), e = o.addQuery(e, "c=" + decodeURIComponent(r.WPrefix + "." + this.id)), a("using htmlfile", l.htmlfileEnabled);
              var n = l.htmlfileEnabled ? r.createHtmlfile : r.createIframe;
              u[r.WPrefix][this.id] = {
                start: function () {
                  a("start"), t.iframeObj.loaded();
                },
                message: function (e) {
                  a("message", e), t.emit("message", e);
                },
                stop: function () {
                  a("stop"), t._cleanup(), t._close("network");
                }
              }, this.iframeObj = n(e, function () {
                a("callback"), t._cleanup(), t._close("permanent");
              });
            }
            e(l, i), l.prototype.abort = function () {
              a("abort"), this._cleanup(), this._close("user");
            }, l.prototype._cleanup = function () {
              a("_cleanup"), this.iframeObj && (this.iframeObj.cleanup(), this.iframeObj = null), delete u[r.WPrefix][this.id];
            }, l.prototype._close = function (e) {
              a("_close", e), this.emit("close", null, e), this.removeAllListeners();
            }, l.htmlfileEnabled = !1;
            var t = ["Active"].concat("Object").join("X");
            if (t in u) try {
              l.htmlfileEnabled = !!new u[t]("htmlfile");
            } catch (e) {}
            l.enabled = l.htmlfileEnabled || r.iframeEnabled, c.exports = l;
          }).call(this);
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
      }, {
        "../../utils/iframe": 47,
        "../../utils/random": 50,
        "../../utils/url": 52,
        "debug": void 0,
        "events": 3,
        "inherits": 54
      }],
      31: [function (t, n, e) {
        (function (c) {
          (function () {
            "use strict";

            var r = t("../../utils/iframe"),
              i = t("../../utils/random"),
              s = t("../../utils/browser"),
              o = t("../../utils/url"),
              e = t("inherits"),
              a = t("events").EventEmitter,
              l = function () {};
            function u(e) {
              l(e);
              var t = this;
              a.call(this), r.polluteGlobalNamespace(), this.id = "a" + i.string(6);
              var n = o.addQuery(e, "c=" + encodeURIComponent(r.WPrefix + "." + this.id));
              c[r.WPrefix][this.id] = this._callback.bind(this), this._createScript(n), this.timeoutId = setTimeout(function () {
                l("timeout"), t._abort(new Error("JSONP script loaded abnormally (timeout)"));
              }, u.timeout);
            }
            e(u, a), u.prototype.abort = function () {
              if (l("abort"), c[r.WPrefix][this.id]) {
                var e = new Error("JSONP user aborted read");
                e.code = 1e3, this._abort(e);
              }
            }, u.timeout = 35e3, u.scriptErrorTimeout = 1e3, u.prototype._callback = function (e) {
              l("_callback", e), this._cleanup(), this.aborting || (e && (l("message", e), this.emit("message", e)), this.emit("close", null, "network"), this.removeAllListeners());
            }, u.prototype._abort = function (e) {
              l("_abort", e), this._cleanup(), this.aborting = !0, this.emit("close", e.code, e.message), this.removeAllListeners();
            }, u.prototype._cleanup = function () {
              if (l("_cleanup"), clearTimeout(this.timeoutId), this.script2 && (this.script2.parentNode.removeChild(this.script2), this.script2 = null), this.script) {
                var e = this.script;
                e.parentNode.removeChild(e), e.onreadystatechange = e.onerror = e.onload = e.onclick = null, this.script = null;
              }
              delete c[r.WPrefix][this.id];
            }, u.prototype._scriptError = function () {
              l("_scriptError");
              var e = this;
              this.errorTimer || (this.errorTimer = setTimeout(function () {
                e.loadedOkay || e._abort(new Error("JSONP script loaded abnormally (onerror)"));
              }, u.scriptErrorTimeout));
            }, u.prototype._createScript = function (e) {
              l("_createScript", e);
              var t,
                n = this,
                r = this.script = c.document.createElement("script");
              if (r.id = "a" + i.string(8), r.src = e, r.type = "text/javascript", r.charset = "UTF-8", r.onerror = this._scriptError.bind(this), r.onload = function () {
                l("onload"), n._abort(new Error("JSONP script loaded abnormally (onload)"));
              }, r.onreadystatechange = function () {
                if (l("onreadystatechange", r.readyState), /loaded|closed/.test(r.readyState)) {
                  if (r && r.htmlFor && r.onclick) {
                    n.loadedOkay = !0;
                    try {
                      r.onclick();
                    } catch (e) {}
                  }
                  r && n._abort(new Error("JSONP script loaded abnormally (onreadystatechange)"));
                }
              }, void 0 === r.async && c.document.attachEvent) if (s.isOpera()) (t = this.script2 = c.document.createElement("script")).text = "try{var a = document.getElementById('" + r.id + "'); if(a)a.onerror();}catch(x){};", r.async = t.async = !1;else {
                try {
                  r.htmlFor = r.id, r.event = "onclick";
                } catch (e) {}
                r.async = !0;
              }
              void 0 !== r.async && (r.async = !0);
              var o = c.document.getElementsByTagName("head")[0];
              o.insertBefore(r, o.firstChild), t && o.insertBefore(t, o.firstChild);
            }, n.exports = u;
          }).call(this);
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
      }, {
        "../../utils/browser": 44,
        "../../utils/iframe": 47,
        "../../utils/random": 50,
        "../../utils/url": 52,
        "debug": void 0,
        "events": 3,
        "inherits": 54
      }],
      32: [function (e, t, n) {
        "use strict";

        var r = e("inherits"),
          o = e("events").EventEmitter,
          i = function () {};
        function s(e, t) {
          i(e), o.call(this);
          var r = this;
          this.bufferPosition = 0, this.xo = new t("POST", e, null), this.xo.on("chunk", this._chunkHandler.bind(this)), this.xo.once("finish", function (e, t) {
            i("finish", e, t), r._chunkHandler(e, t), r.xo = null;
            var n = 200 === e ? "network" : "permanent";
            i("close", n), r.emit("close", null, n), r._cleanup();
          });
        }
        r(s, o), s.prototype._chunkHandler = function (e, t) {
          if (i("_chunkHandler", e), 200 === e && t) for (var n = -1;; this.bufferPosition += n + 1) {
            var r = t.slice(this.bufferPosition);
            if (-1 === (n = r.indexOf("\n"))) break;
            var o = r.slice(0, n);
            o && (i("message", o), this.emit("message", o));
          }
        }, s.prototype._cleanup = function () {
          i("_cleanup"), this.removeAllListeners();
        }, s.prototype.abort = function () {
          i("abort"), this.xo && (this.xo.close(), i("close"), this.emit("close", null, "user"), this.xo = null), this._cleanup();
        }, t.exports = s;
      }, {
        "debug": void 0,
        "events": 3,
        "inherits": 54
      }],
      33: [function (e, t, n) {
        (function (f) {
          (function () {
            "use strict";

            var s,
              a,
              l = e("../../utils/random"),
              u = e("../../utils/url"),
              c = function () {};
            t.exports = function (e, t, n) {
              c(e, t), s || (c("createForm"), (s = f.document.createElement("form")).style.display = "none", s.style.position = "absolute", s.method = "POST", s.enctype = "application/x-www-form-urlencoded", s.acceptCharset = "UTF-8", (a = f.document.createElement("textarea")).name = "d", s.appendChild(a), f.document.body.appendChild(s));
              var r = "a" + l.string(8);
              s.target = r, s.action = u.addQuery(u.addPath(e, "/jsonp_send"), "i=" + r);
              var o = function (t) {
                c("createIframe", t);
                try {
                  return f.document.createElement('<iframe name="' + t + '">');
                } catch (e) {
                  var n = f.document.createElement("iframe");
                  return n.name = t, n;
                }
              }(r);
              o.id = r, o.style.display = "none", s.appendChild(o);
              try {
                a.value = t;
              } catch (e) {}
              s.submit();
              function i(e) {
                c("completed", r, e), o.onerror && (o.onreadystatechange = o.onerror = o.onload = null, setTimeout(function () {
                  c("cleaning up", r), o.parentNode.removeChild(o), o = null;
                }, 500), a.value = "", n(e));
              }
              return o.onerror = function () {
                c("onerror", r), i();
              }, o.onload = function () {
                c("onload", r), i();
              }, o.onreadystatechange = function (e) {
                c("onreadystatechange", r, o.readyState, e), "complete" === o.readyState && i();
              }, function () {
                c("aborted", r), i(new Error("Aborted"));
              };
            };
          }).call(this);
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
      }, {
        "../../utils/random": 50,
        "../../utils/url": 52,
        "debug": void 0
      }],
      34: [function (r, u, e) {
        (function (l) {
          (function () {
            "use strict";

            var o = r("events").EventEmitter,
              e = r("inherits"),
              i = r("../../utils/event"),
              t = r("../../utils/browser"),
              s = r("../../utils/url"),
              a = function () {};
            function n(e, t, n) {
              a(e, t);
              var r = this;
              o.call(this), setTimeout(function () {
                r._start(e, t, n);
              }, 0);
            }
            e(n, o), n.prototype._start = function (e, t, n) {
              a("_start");
              var r = this,
                o = new l.XDomainRequest();
              t = s.addQuery(t, "t=" + +new Date()), o.onerror = function () {
                a("onerror"), r._error();
              }, o.ontimeout = function () {
                a("ontimeout"), r._error();
              }, o.onprogress = function () {
                a("progress", o.responseText), r.emit("chunk", 200, o.responseText);
              }, o.onload = function () {
                a("load"), r.emit("finish", 200, o.responseText), r._cleanup(!1);
              }, this.xdr = o, this.unloadRef = i.unloadAdd(function () {
                r._cleanup(!0);
              });
              try {
                this.xdr.open(e, t), this.timeout && (this.xdr.timeout = this.timeout), this.xdr.send(n);
              } catch (e) {
                this._error();
              }
            }, n.prototype._error = function () {
              this.emit("finish", 0, ""), this._cleanup(!1);
            }, n.prototype._cleanup = function (e) {
              if (a("cleanup", e), this.xdr) {
                if (this.removeAllListeners(), i.unloadDel(this.unloadRef), this.xdr.ontimeout = this.xdr.onerror = this.xdr.onprogress = this.xdr.onload = null, e) try {
                  this.xdr.abort();
                } catch (e) {}
                this.unloadRef = this.xdr = null;
              }
            }, n.prototype.close = function () {
              a("close"), this._cleanup(!0);
            }, n.enabled = !(!l.XDomainRequest || !t.hasDomain()), u.exports = n;
          }).call(this);
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
      }, {
        "../../utils/browser": 44,
        "../../utils/event": 46,
        "../../utils/url": 52,
        "debug": void 0,
        "events": 3,
        "inherits": 54
      }],
      35: [function (e, t, n) {
        "use strict";

        var r = e("inherits"),
          o = e("../driver/xhr");
        function i(e, t, n, r) {
          o.call(this, e, t, n, r);
        }
        r(i, o), i.enabled = o.enabled && o.supportsCORS, t.exports = i;
      }, {
        "../driver/xhr": 17,
        "inherits": 54
      }],
      36: [function (e, t, n) {
        "use strict";

        var r = e("events").EventEmitter;
        function o() {
          var e = this;
          r.call(this), this.to = setTimeout(function () {
            e.emit("finish", 200, "{}");
          }, o.timeout);
        }
        e("inherits")(o, r), o.prototype.close = function () {
          clearTimeout(this.to);
        }, o.timeout = 2e3, t.exports = o;
      }, {
        "events": 3,
        "inherits": 54
      }],
      37: [function (e, t, n) {
        "use strict";

        var r = e("inherits"),
          o = e("../driver/xhr");
        function i(e, t, n) {
          o.call(this, e, t, n, {
            noCredentials: !0
          });
        }
        r(i, o), i.enabled = o.enabled, t.exports = i;
      }, {
        "../driver/xhr": 17,
        "inherits": 54
      }],
      38: [function (e, t, n) {
        "use strict";

        var i = e("../utils/event"),
          s = e("../utils/url"),
          r = e("inherits"),
          a = e("events").EventEmitter,
          l = e("./driver/websocket"),
          u = function () {};
        function c(e, t, n) {
          if (!c.enabled()) throw new Error("Transport created when disabled");
          a.call(this), u("constructor", e);
          var r = this,
            o = s.addPath(e, "/websocket");
          o = "https" === o.slice(0, 5) ? "wss" + o.slice(5) : "ws" + o.slice(4), this.url = o, this.ws = new l(this.url, [], n), this.ws.onmessage = function (e) {
            u("message event", e.data), r.emit("message", e.data);
          }, this.unloadRef = i.unloadAdd(function () {
            u("unload"), r.ws.close();
          }), this.ws.onclose = function (e) {
            u("close event", e.code, e.reason), r.emit("close", e.code, e.reason), r._cleanup();
          }, this.ws.onerror = function (e) {
            u("error event", e), r.emit("close", 1006, "WebSocket connection broken"), r._cleanup();
          };
        }
        r(c, a), c.prototype.send = function (e) {
          var t = "[" + e + "]";
          u("send", t), this.ws.send(t);
        }, c.prototype.close = function () {
          u("close");
          var e = this.ws;
          this._cleanup(), e && e.close();
        }, c.prototype._cleanup = function () {
          u("_cleanup");
          var e = this.ws;
          e && (e.onmessage = e.onclose = e.onerror = null), i.unloadDel(this.unloadRef), this.unloadRef = this.ws = null, this.removeAllListeners();
        }, c.enabled = function () {
          return u("enabled"), !!l;
        }, c.transportName = "websocket", c.roundTrips = 2, t.exports = c;
      }, {
        "../utils/event": 46,
        "../utils/url": 52,
        "./driver/websocket": 19,
        "debug": void 0,
        "events": 3,
        "inherits": 54
      }],
      39: [function (e, t, n) {
        "use strict";

        var r = e("inherits"),
          o = e("./lib/ajax-based"),
          i = e("./xdr-streaming"),
          s = e("./receiver/xhr"),
          a = e("./sender/xdr");
        function l(e) {
          if (!a.enabled) throw new Error("Transport created when disabled");
          o.call(this, e, "/xhr", s, a);
        }
        r(l, o), l.enabled = i.enabled, l.transportName = "xdr-polling", l.roundTrips = 2, t.exports = l;
      }, {
        "./lib/ajax-based": 24,
        "./receiver/xhr": 32,
        "./sender/xdr": 34,
        "./xdr-streaming": 40,
        "inherits": 54
      }],
      40: [function (e, t, n) {
        "use strict";

        var r = e("inherits"),
          o = e("./lib/ajax-based"),
          i = e("./receiver/xhr"),
          s = e("./sender/xdr");
        function a(e) {
          if (!s.enabled) throw new Error("Transport created when disabled");
          o.call(this, e, "/xhr_streaming", i, s);
        }
        r(a, o), a.enabled = function (e) {
          return !e.cookie_needed && !e.nullOrigin && s.enabled && e.sameScheme;
        }, a.transportName = "xdr-streaming", a.roundTrips = 2, t.exports = a;
      }, {
        "./lib/ajax-based": 24,
        "./receiver/xhr": 32,
        "./sender/xdr": 34,
        "inherits": 54
      }],
      41: [function (e, t, n) {
        "use strict";

        var r = e("inherits"),
          o = e("./lib/ajax-based"),
          i = e("./receiver/xhr"),
          s = e("./sender/xhr-cors"),
          a = e("./sender/xhr-local");
        function l(e) {
          if (!a.enabled && !s.enabled) throw new Error("Transport created when disabled");
          o.call(this, e, "/xhr", i, s);
        }
        r(l, o), l.enabled = function (e) {
          return !e.nullOrigin && (!(!a.enabled || !e.sameOrigin) || s.enabled);
        }, l.transportName = "xhr-polling", l.roundTrips = 2, t.exports = l;
      }, {
        "./lib/ajax-based": 24,
        "./receiver/xhr": 32,
        "./sender/xhr-cors": 35,
        "./sender/xhr-local": 37,
        "inherits": 54
      }],
      42: [function (l, u, e) {
        (function (a) {
          (function () {
            "use strict";

            var e = l("inherits"),
              t = l("./lib/ajax-based"),
              n = l("./receiver/xhr"),
              r = l("./sender/xhr-cors"),
              o = l("./sender/xhr-local"),
              i = l("../utils/browser");
            function s(e) {
              if (!o.enabled && !r.enabled) throw new Error("Transport created when disabled");
              t.call(this, e, "/xhr_streaming", n, r);
            }
            e(s, t), s.enabled = function (e) {
              return !e.nullOrigin && !i.isOpera() && r.enabled;
            }, s.transportName = "xhr-streaming", s.roundTrips = 2, s.needBody = !!a.document, u.exports = s;
          }).call(this);
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
      }, {
        "../utils/browser": 44,
        "./lib/ajax-based": 24,
        "./receiver/xhr": 32,
        "./sender/xhr-cors": 35,
        "./sender/xhr-local": 37,
        "inherits": 54
      }],
      43: [function (e, t, n) {
        (function (n) {
          (function () {
            "use strict";

            n.crypto && n.crypto.getRandomValues ? t.exports.randomBytes = function (e) {
              var t = new Uint8Array(e);
              return n.crypto.getRandomValues(t), t;
            } : t.exports.randomBytes = function (e) {
              for (var t = new Array(e), n = 0; n < e; n++) t[n] = Math.floor(256 * Math.random());
              return t;
            };
          }).call(this);
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
      }, {}],
      44: [function (e, t, n) {
        (function (e) {
          (function () {
            "use strict";

            t.exports = {
              isOpera: function () {
                return e.navigator && /opera/i.test(e.navigator.userAgent);
              },
              isKonqueror: function () {
                return e.navigator && /konqueror/i.test(e.navigator.userAgent);
              },
              hasDomain: function () {
                if (!e.document) return !0;
                try {
                  return !!e.document.domain;
                } catch (e) {
                  return !1;
                }
              }
            };
          }).call(this);
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
      }, {}],
      45: [function (e, t, n) {
        "use strict";

        var r,
          o = /[\x00-\x1f\ud800-\udfff\ufffe\uffff\u0300-\u0333\u033d-\u0346\u034a-\u034c\u0350-\u0352\u0357-\u0358\u035c-\u0362\u0374\u037e\u0387\u0591-\u05af\u05c4\u0610-\u0617\u0653-\u0654\u0657-\u065b\u065d-\u065e\u06df-\u06e2\u06eb-\u06ec\u0730\u0732-\u0733\u0735-\u0736\u073a\u073d\u073f-\u0741\u0743\u0745\u0747\u07eb-\u07f1\u0951\u0958-\u095f\u09dc-\u09dd\u09df\u0a33\u0a36\u0a59-\u0a5b\u0a5e\u0b5c-\u0b5d\u0e38-\u0e39\u0f43\u0f4d\u0f52\u0f57\u0f5c\u0f69\u0f72-\u0f76\u0f78\u0f80-\u0f83\u0f93\u0f9d\u0fa2\u0fa7\u0fac\u0fb9\u1939-\u193a\u1a17\u1b6b\u1cda-\u1cdb\u1dc0-\u1dcf\u1dfc\u1dfe\u1f71\u1f73\u1f75\u1f77\u1f79\u1f7b\u1f7d\u1fbb\u1fbe\u1fc9\u1fcb\u1fd3\u1fdb\u1fe3\u1feb\u1fee-\u1fef\u1ff9\u1ffb\u1ffd\u2000-\u2001\u20d0-\u20d1\u20d4-\u20d7\u20e7-\u20e9\u2126\u212a-\u212b\u2329-\u232a\u2adc\u302b-\u302c\uaab2-\uaab3\uf900-\ufa0d\ufa10\ufa12\ufa15-\ufa1e\ufa20\ufa22\ufa25-\ufa26\ufa2a-\ufa2d\ufa30-\ufa6d\ufa70-\ufad9\ufb1d\ufb1f\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufb4e\ufff0-\uffff]/g;
        t.exports = {
          quote: function (e) {
            var t = JSON.stringify(e);
            return o.lastIndex = 0, o.test(t) ? (r = r || function (e) {
              var t,
                n = {},
                r = [];
              for (t = 0; t < 65536; t++) r.push(String.fromCharCode(t));
              return e.lastIndex = 0, r.join("").replace(e, function (e) {
                return n[e] = "\\u" + ("0000" + e.charCodeAt(0).toString(16)).slice(-4), "";
              }), e.lastIndex = 0, n;
            }(o), t.replace(o, function (e) {
              return r[e];
            })) : t;
          }
        };
      }, {}],
      46: [function (e, t, n) {
        (function (s) {
          (function () {
            "use strict";

            var n = e("./random"),
              r = {},
              o = !1,
              i = s.chrome && s.chrome.app && s.chrome.app.runtime;
            t.exports = {
              attachEvent: function (e, t) {
                void 0 !== s.addEventListener ? s.addEventListener(e, t, !1) : s.document && s.attachEvent && (s.document.attachEvent("on" + e, t), s.attachEvent("on" + e, t));
              },
              detachEvent: function (e, t) {
                void 0 !== s.addEventListener ? s.removeEventListener(e, t, !1) : s.document && s.detachEvent && (s.document.detachEvent("on" + e, t), s.detachEvent("on" + e, t));
              },
              unloadAdd: function (e) {
                if (i) return null;
                var t = n.string(8);
                return r[t] = e, o && setTimeout(this.triggerUnloadCallbacks, 0), t;
              },
              unloadDel: function (e) {
                e in r && delete r[e];
              },
              triggerUnloadCallbacks: function () {
                for (var e in r) r[e](), delete r[e];
              }
            };
            i || t.exports.attachEvent("unload", function () {
              o || (o = !0, t.exports.triggerUnloadCallbacks());
            });
          }).call(this);
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
      }, {
        "./random": 50
      }],
      47: [function (t, p, e) {
        (function (d) {
          (function () {
            "use strict";

            var f = t("./event"),
              e = t("./browser"),
              h = function () {};
            p.exports = {
              WPrefix: "_jp",
              currentWindowId: null,
              polluteGlobalNamespace: function () {
                p.exports.WPrefix in d || (d[p.exports.WPrefix] = {});
              },
              postMessage: function (e, t) {
                d.parent !== d ? d.parent.postMessage(JSON.stringify({
                  windowId: p.exports.currentWindowId,
                  type: e,
                  data: t || ""
                }), "*") : h("Cannot postMessage, no parent window.", e, t);
              },
              createIframe: function (e, t) {
                function n() {
                  h("unattach"), clearTimeout(i);
                  try {
                    a.onload = null;
                  } catch (e) {}
                  a.onerror = null;
                }
                function r() {
                  h("cleanup"), a && (n(), setTimeout(function () {
                    a && a.parentNode.removeChild(a), a = null;
                  }, 0), f.unloadDel(s));
                }
                function o(e) {
                  h("onerror", e), a && (r(), t(e));
                }
                var i,
                  s,
                  a = d.document.createElement("iframe");
                return a.src = e, a.style.display = "none", a.style.position = "absolute", a.onerror = function () {
                  o("onerror");
                }, a.onload = function () {
                  h("onload"), clearTimeout(i), i = setTimeout(function () {
                    o("onload timeout");
                  }, 2e3);
                }, d.document.body.appendChild(a), i = setTimeout(function () {
                  o("timeout");
                }, 15e3), s = f.unloadAdd(r), {
                  post: function (e, t) {
                    h("post", e, t), setTimeout(function () {
                      try {
                        a && a.contentWindow && a.contentWindow.postMessage(e, t);
                      } catch (e) {}
                    }, 0);
                  },
                  cleanup: r,
                  loaded: n
                };
              },
              createHtmlfile: function (e, t) {
                function n() {
                  clearTimeout(i), a.onerror = null;
                }
                function r() {
                  u && (n(), f.unloadDel(s), a.parentNode.removeChild(a), a = u = null, CollectGarbage());
                }
                function o(e) {
                  h("onerror", e), u && (r(), t(e));
                }
                var i,
                  s,
                  a,
                  l = ["Active"].concat("Object").join("X"),
                  u = new d[l]("htmlfile");
                u.open(), u.write('<html><script>document.domain="' + d.document.domain + '";<\/script></html>'), u.close(), u.parentWindow[p.exports.WPrefix] = d[p.exports.WPrefix];
                var c = u.createElement("div");
                return u.body.appendChild(c), a = u.createElement("iframe"), c.appendChild(a), a.src = e, a.onerror = function () {
                  o("onerror");
                }, i = setTimeout(function () {
                  o("timeout");
                }, 15e3), s = f.unloadAdd(r), {
                  post: function (e, t) {
                    try {
                      setTimeout(function () {
                        a && a.contentWindow && a.contentWindow.postMessage(e, t);
                      }, 0);
                    } catch (e) {}
                  },
                  cleanup: r,
                  loaded: n
                };
              }
            }, p.exports.iframeEnabled = !1, d.document && (p.exports.iframeEnabled = ("function" == typeof d.postMessage || "object" == typeof d.postMessage) && !e.isKonqueror());
          }).call(this);
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
      }, {
        "./browser": 44,
        "./event": 46,
        "debug": void 0
      }],
      48: [function (e, t, n) {
        (function (r) {
          (function () {
            "use strict";

            var n = {};
            ["log", "debug", "warn"].forEach(function (e) {
              var t;
              try {
                t = r.console && r.console[e] && r.console[e].apply;
              } catch (e) {}
              n[e] = t ? function () {
                return r.console[e].apply(r.console, arguments);
              } : "log" === e ? function () {} : n.log;
            }), t.exports = n;
          }).call(this);
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
      }, {}],
      49: [function (e, t, n) {
        "use strict";

        t.exports = {
          isObject: function (e) {
            var t = typeof e;
            return "function" == t || "object" == t && !!e;
          },
          extend: function (e) {
            if (!this.isObject(e)) return e;
            for (var t, n, r = 1, o = arguments.length; r < o; r++) for (n in t = arguments[r]) Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
            return e;
          }
        };
      }, {}],
      50: [function (e, t, n) {
        "use strict";

        var i = e("crypto"),
          s = "abcdefghijklmnopqrstuvwxyz012345";
        t.exports = {
          string: function (e) {
            for (var t = s.length, n = i.randomBytes(e), r = [], o = 0; o < e; o++) r.push(s.substr(n[o] % t, 1));
            return r.join("");
          },
          number: function (e) {
            return Math.floor(Math.random() * e);
          },
          numberString: function (e) {
            var t = ("" + (e - 1)).length;
            return (new Array(t + 1).join("0") + this.number(e)).slice(-t);
          }
        };
      }, {
        "crypto": 43
      }],
      51: [function (e, t, n) {
        "use strict";

        var o = function () {};
        t.exports = function (e) {
          return {
            filterToEnabled: function (t, n) {
              var r = {
                main: [],
                facade: []
              };
              return t ? "string" == typeof t && (t = [t]) : t = [], e.forEach(function (e) {
                e && ("websocket" !== e.transportName || !1 !== n.websocket ? t.length && -1 === t.indexOf(e.transportName) ? o("not in whitelist", e.transportName) : e.enabled(n) ? (o("enabled", e.transportName), r.main.push(e), e.facadeTransport && r.facade.push(e.facadeTransport)) : o("disabled", e.transportName) : o("disabled from server", "websocket"));
              }), r;
            }
          };
        };
      }, {
        "debug": void 0
      }],
      52: [function (e, t, n) {
        "use strict";

        var r = e("url-parse"),
          o = function () {};
        t.exports = {
          getOrigin: function (e) {
            if (!e) return null;
            var t = new r(e);
            if ("file:" === t.protocol) return null;
            var n = t.port;
            return n = n || ("https:" === t.protocol ? "443" : "80"), t.protocol + "//" + t.hostname + ":" + n;
          },
          isOriginEqual: function (e, t) {
            var n = this.getOrigin(e) === this.getOrigin(t);
            return o("same", e, t, n), n;
          },
          isSchemeEqual: function (e, t) {
            return e.split(":")[0] === t.split(":")[0];
          },
          addPath: function (e, t) {
            var n = e.split("?");
            return n[0] + t + (n[1] ? "?" + n[1] : "");
          },
          addQuery: function (e, t) {
            return e + (-1 === e.indexOf("?") ? "?" + t : "&" + t);
          },
          isLoopbackAddr: function (e) {
            return /^127\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(e) || /^\[::1\]$/.test(e);
          }
        };
      }, {
        "debug": void 0,
        "url-parse": 57
      }],
      53: [function (e, t, n) {
        t.exports = "1.6.1";
      }, {}],
      54: [function (e, t, n) {
        "function" == typeof Object.create ? t.exports = function (e, t) {
          t && (e.super_ = t, e.prototype = Object.create(t.prototype, {
            constructor: {
              value: e,
              enumerable: !1,
              writable: !0,
              configurable: !0
            }
          }));
        } : t.exports = function (e, t) {
          if (t) {
            e.super_ = t;
            function n() {}
            n.prototype = t.prototype, e.prototype = new n(), e.prototype.constructor = e;
          }
        };
      }, {}],
      55: [function (e, t, n) {
        "use strict";

        var i = Object.prototype.hasOwnProperty;
        function s(e) {
          try {
            return decodeURIComponent(e.replace(/\+/g, " "));
          } catch (e) {
            return null;
          }
        }
        n.stringify = function (e, t) {
          t = t || "";
          var n,
            r,
            o = [];
          for (r in "string" != typeof t && (t = "?"), e) if (i.call(e, r)) {
            if ((n = e[r]) || null != n && !isNaN(n) || (n = ""), r = encodeURIComponent(r), n = encodeURIComponent(n), null === r || null === n) continue;
            o.push(r + "=" + n);
          }
          return o.length ? t + o.join("&") : "";
        }, n.parse = function (e) {
          for (var t, n = /([^=?&]+)=?([^&]*)/g, r = {}; t = n.exec(e);) {
            var o = s(t[1]),
              i = s(t[2]);
            null === o || null === i || o in r || (r[o] = i);
          }
          return r;
        };
      }, {}],
      56: [function (e, t, n) {
        "use strict";

        t.exports = function (e, t) {
          if (t = t.split(":")[0], !(e = +e)) return !1;
          switch (t) {
            case "http":
            case "ws":
              return 80 !== e;
            case "https":
            case "wss":
              return 443 !== e;
            case "ftp":
              return 21 !== e;
            case "gopher":
              return 70 !== e;
            case "file":
              return !1;
          }
          return 0 !== e;
        };
      }, {}],
      57: [function (e, n, t) {
        (function (a) {
          (function () {
            "use strict";

            var d = e("requires-port"),
              p = e("querystringify"),
              t = /^[\x00-\x20\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/,
              m = /[\n\r\t]/g,
              i = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//,
              l = /:\d+$/,
              u = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\\/]+)?([\S\s]*)/i,
              v = /^[a-zA-Z]:/;
            function b(e) {
              return (e || "").toString().replace(t, "");
            }
            var y = [["#", "hash"], ["?", "query"], function (e, t) {
                return w(t.protocol) ? e.replace(/\\/g, "/") : e;
              }, ["/", "pathname"], ["@", "auth", 1], [NaN, "host", void 0, 1, 1], [/:(\d*)$/, "port", void 0, 1], [NaN, "hostname", void 0, 1, 1]],
              s = {
                hash: 1,
                query: 1
              };
            function g(e) {
              var t,
                n = ("undefined" != typeof window ? window : void 0 !== a ? a : "undefined" != typeof self ? self : {}).location || {},
                r = {},
                o = typeof (e = e || n);
              if ("blob:" === e.protocol) r = new _(unescape(e.pathname), {});else if ("string" == o) for (t in r = new _(e, {}), s) delete r[t];else if ("object" == o) {
                for (t in e) t in s || (r[t] = e[t]);
                void 0 === r.slashes && (r.slashes = i.test(e.href));
              }
              return r;
            }
            function w(e) {
              return "file:" === e || "ftp:" === e || "http:" === e || "https:" === e || "ws:" === e || "wss:" === e;
            }
            function x(e, t) {
              e = (e = b(e)).replace(m, ""), t = t || {};
              var n,
                r = u.exec(e),
                o = r[1] ? r[1].toLowerCase() : "",
                i = !!r[2],
                s = !!r[3],
                a = 0;
              return i ? a = s ? (n = r[2] + r[3] + r[4], r[2].length + r[3].length) : (n = r[2] + r[4], r[2].length) : s ? (n = r[3] + r[4], a = r[3].length) : n = r[4], "file:" === o ? 2 <= a && (n = n.slice(2)) : w(o) ? n = r[4] : o ? i && (n = n.slice(2)) : 2 <= a && w(t.protocol) && (n = r[4]), {
                protocol: o,
                slashes: i || w(o),
                slashesCount: a,
                rest: n
              };
            }
            function _(e, t, n) {
              if (e = (e = b(e)).replace(m, ""), !(this instanceof _)) return new _(e, t, n);
              var r,
                o,
                i,
                s,
                a,
                l,
                u = y.slice(),
                c = typeof t,
                f = this,
                h = 0;
              for ("object" != c && "string" != c && (n = t, t = null), n && "function" != typeof n && (n = p.parse), r = !(o = x(e || "", t = g(t))).protocol && !o.slashes, f.slashes = o.slashes || r && t.slashes, f.protocol = o.protocol || t.protocol || "", e = o.rest, ("file:" === o.protocol && (2 !== o.slashesCount || v.test(e)) || !o.slashes && (o.protocol || o.slashesCount < 2 || !w(f.protocol))) && (u[3] = [/(.*)/, "pathname"]); h < u.length; h++) "function" != typeof (s = u[h]) ? (i = s[0], l = s[1], i != i ? f[l] = e : "string" == typeof i ? ~(a = "@" === i ? e.lastIndexOf(i) : e.indexOf(i)) && (e = "number" == typeof s[2] ? (f[l] = e.slice(0, a), e.slice(a + s[2])) : (f[l] = e.slice(a), e.slice(0, a))) : (a = i.exec(e)) && (f[l] = a[1], e = e.slice(0, a.index)), f[l] = f[l] || r && s[3] && t[l] || "", s[4] && (f[l] = f[l].toLowerCase())) : e = s(e, f);
              n && (f.query = n(f.query)), r && t.slashes && "/" !== f.pathname.charAt(0) && ("" !== f.pathname || "" !== t.pathname) && (f.pathname = function (e, t) {
                if ("" === e) return t;
                for (var n = (t || "/").split("/").slice(0, -1).concat(e.split("/")), r = n.length, o = n[r - 1], i = !1, s = 0; r--;) "." === n[r] ? n.splice(r, 1) : ".." === n[r] ? (n.splice(r, 1), s++) : s && (0 === r && (i = !0), n.splice(r, 1), s--);
                return i && n.unshift(""), "." !== o && ".." !== o || n.push(""), n.join("/");
              }(f.pathname, t.pathname)), "/" !== f.pathname.charAt(0) && w(f.protocol) && (f.pathname = "/" + f.pathname), d(f.port, f.protocol) || (f.host = f.hostname, f.port = ""), f.username = f.password = "", f.auth && (~(a = f.auth.indexOf(":")) ? (f.username = f.auth.slice(0, a), f.username = encodeURIComponent(decodeURIComponent(f.username)), f.password = f.auth.slice(a + 1), f.password = encodeURIComponent(decodeURIComponent(f.password))) : f.username = encodeURIComponent(decodeURIComponent(f.auth)), f.auth = f.password ? f.username + ":" + f.password : f.username), f.origin = "file:" !== f.protocol && w(f.protocol) && f.host ? f.protocol + "//" + f.host : "null", f.href = f.toString();
            }
            _.prototype = {
              set: function (e, t, n) {
                var r = this;
                switch (e) {
                  case "query":
                    "string" == typeof t && t.length && (t = (n || p.parse)(t)), r[e] = t;
                    break;
                  case "port":
                    r[e] = t, d(t, r.protocol) ? t && (r.host = r.hostname + ":" + t) : (r.host = r.hostname, r[e] = "");
                    break;
                  case "hostname":
                    r[e] = t, r.port && (t += ":" + r.port), r.host = t;
                    break;
                  case "host":
                    r[e] = t, l.test(t) ? (t = t.split(":"), r.port = t.pop(), r.hostname = t.join(":")) : (r.hostname = t, r.port = "");
                    break;
                  case "protocol":
                    r.protocol = t.toLowerCase(), r.slashes = !n;
                    break;
                  case "pathname":
                  case "hash":
                    if (t) {
                      var o = "pathname" === e ? "/" : "#";
                      r[e] = t.charAt(0) !== o ? o + t : t;
                    } else r[e] = t;
                    break;
                  case "username":
                  case "password":
                    r[e] = encodeURIComponent(t);
                    break;
                  case "auth":
                    var i = t.indexOf(":");
                    ~i ? (r.username = t.slice(0, i), r.username = encodeURIComponent(decodeURIComponent(r.username)), r.password = t.slice(i + 1), r.password = encodeURIComponent(decodeURIComponent(r.password))) : r.username = encodeURIComponent(decodeURIComponent(t));
                }
                for (var s = 0; s < y.length; s++) {
                  var a = y[s];
                  a[4] && (r[a[1]] = r[a[1]].toLowerCase());
                }
                return r.auth = r.password ? r.username + ":" + r.password : r.username, r.origin = "file:" !== r.protocol && w(r.protocol) && r.host ? r.protocol + "//" + r.host : "null", r.href = r.toString(), r;
              },
              toString: function (e) {
                e && "function" == typeof e || (e = p.stringify);
                var t,
                  n = this,
                  r = n.host,
                  o = n.protocol;
                o && ":" !== o.charAt(o.length - 1) && (o += ":");
                var i = o + (n.protocol && n.slashes || w(n.protocol) ? "//" : "");
                return n.username ? (i += n.username, n.password && (i += ":" + n.password), i += "@") : n.password ? (i += ":" + n.password, i += "@") : "file:" !== n.protocol && w(n.protocol) && !r && "/" !== n.pathname && (i += "@"), (":" === r[r.length - 1] || l.test(n.hostname) && !n.port) && (r += ":"), i += r + n.pathname, (t = "object" == typeof n.query ? e(n.query) : n.query) && (i += "?" !== t.charAt(0) ? "?" + t : t), n.hash && (i += n.hash), i;
              }
            }, _.extractProtocol = x, _.location = g, _.trimLeft = b, _.qs = p, n.exports = _;
          }).call(this);
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
      }, {
        "querystringify": 55,
        "requires-port": 56
      }]
    }, {}, [1])(1);
  });
}.call(this, module);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"urls.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/socket-stream-client/urls.js                                                                              //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.export({
  toSockjsUrl: () => toSockjsUrl,
  toWebsocketUrl: () => toWebsocketUrl
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }
}, 0);
// @param url {String} URL to Meteor app, eg:
//   "/" or "madewith.meteor.com" or "https://foo.meteor.com"
//   or "ddp+sockjs://ddp--****-foo.meteor.com/sockjs"
// @returns {String} URL to the endpoint with the specific scheme and subPath, e.g.
// for scheme "http" and subPath "sockjs"
//   "http://subdomain.meteor.com/sockjs" or "/sockjs"
//   or "https://ddp--1234-foo.meteor.com/sockjs"
function translateUrl(url, newSchemeBase, subPath) {
  if (!newSchemeBase) {
    newSchemeBase = 'http';
  }
  if (subPath !== "sockjs" && url.startsWith("/")) {
    url = Meteor.absoluteUrl(url.substr(1));
  }
  var ddpUrlMatch = url.match(/^ddp(i?)\+sockjs:\/\//);
  var httpUrlMatch = url.match(/^http(s?):\/\//);
  var newScheme;
  if (ddpUrlMatch) {
    // Remove scheme and split off the host.
    var urlAfterDDP = url.substr(ddpUrlMatch[0].length);
    newScheme = ddpUrlMatch[1] === 'i' ? newSchemeBase : newSchemeBase + 's';
    var slashPos = urlAfterDDP.indexOf('/');
    var host = slashPos === -1 ? urlAfterDDP : urlAfterDDP.substr(0, slashPos);
    var rest = slashPos === -1 ? '' : urlAfterDDP.substr(slashPos);

    // In the host (ONLY!), change '*' characters into random digits. This
    // allows different stream connections to connect to different hostnames
    // and avoid browser per-hostname connection limits.
    host = host.replace(/\*/g, () => Math.floor(Math.random() * 10));
    return newScheme + '://' + host + rest;
  } else if (httpUrlMatch) {
    newScheme = !httpUrlMatch[1] ? newSchemeBase : newSchemeBase + 's';
    var urlAfterHttp = url.substr(httpUrlMatch[0].length);
    url = newScheme + '://' + urlAfterHttp;
  }

  // Prefix FQDNs but not relative URLs
  if (url.indexOf('://') === -1 && !url.startsWith('/')) {
    url = newSchemeBase + '://' + url;
  }

  // XXX This is not what we should be doing: if I have a site
  // deployed at "/foo", then DDP.connect("/") should actually connect
  // to "/", not to "/foo". "/" is an absolute path. (Contrast: if
  // deployed at "/foo", it would be reasonable for DDP.connect("bar")
  // to connect to "/foo/bar").
  //
  // We should make this properly honor absolute paths rather than
  // forcing the path to be relative to the site root. Simultaneously,
  // we should set DDP_DEFAULT_CONNECTION_URL to include the site
  // root. See also client_convenience.js #RationalizingRelativeDDPURLs
  url = Meteor._relativeToSiteRootUrl(url);
  if (url.endsWith('/')) return url + subPath;else return url + '/' + subPath;
}
function toSockjsUrl(url) {
  return translateUrl(url, 'http', 'sockjs');
}
function toWebsocketUrl(url) {
  return translateUrl(url, 'ws', 'websocket');
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {

}});
