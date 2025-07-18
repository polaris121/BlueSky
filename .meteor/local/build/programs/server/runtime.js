!function (module1) {
  const fs = require('fs');
  const path = require('path');
  const {
    createHash
  } = require("crypto");
  const Module = module.constructor;
  module.exports = function enable() {
    let {
      cachePath,
      createLoader = true
    } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    let cacheEnabled = !!cachePath;
    let cacheEntries = Object.create(null);
    if (cachePath) {
      try {
        fs.readdirSync(cachePath).forEach(name => {
          cacheEntries[name] = true;
        });
      } catch (e) {
        if (e.code === 'ENOENT') {
          fs.mkdirSync(cachePath);
        } else {
          cacheEnabled = false;
        }
      }
    }
    const Mp = Module.prototype;
    Mp.resolve = function (id) {
      return Module._resolveFilename(id, this);
    };

    // Enable the module.{watch,export,...} runtime API needed by Reify.
    require("@meteorjs/reify/lib/runtime").enable(Mp);
    const moduleLoad = Mp.load;
    Mp.load = function (filename) {
      const result = moduleLoad.apply(this, arguments);
      if (typeof this.runSetters === "function") {
        // Make sure we call module.runSetters (or module.runModuleSetters, a
        // legacy synonym) whenever a module finishes loading.
        this.runSetters();
      }
      return result;
    };
    const resolved = Promise.resolve();
    Mp.dynamicImport = function (id) {
      return resolved.then(() => require(id));
    };
    const reifyVersion = require("@meteorjs/reify/package.json").version;
    const reifyAcornParse = require("@meteorjs/reify/lib/parsers/acorn").parse;
    const reifyCompile = require("@meteorjs/reify/lib/compiler").compile;
    function compileContent(content) {
      let identical = true;
      try {
        const result = reifyCompile(content, {
          parse: reifyAcornParse,
          generateLetDeclarations: false,
          ast: false
        });
        if (!result.identical) {
          identical = false;
          content = result.code;
        }
      } finally {
        return {
          content,
          identical
        };
      }
    }
    const _compile = Mp._compile;
    Mp._compile = function (content, filename, options) {
      // When cache is enabled, the file has already been compiled
      if (!options || !options.compiledWithReify) {
        content = compileContent(content).content;
      }
      return _compile.call(this, content, filename);
    };
    if (cacheEnabled) {
      const jsExt = Module._extensions.js;
      Module._extensions['.js'] = function (module, filename) {
        let stat = fs.statSync(filename);
        let baseKey = createHash("sha1").update("".concat(reifyVersion, "\0").concat(filename, "\0").concat(stat.mtimeMs, "\0").concat(stat.ino, "\0").concat(stat.size, "\0")).digest('hex');

        // When files don't use import/export, there is no reason to store
        // an identical copy of the file in the cache. Instead, it stores an empty
        // file with a different suffix to indicate the original file should be used
        let identicalKey = baseKey + '-identical.json';
        let key = baseKey + '.json';
        let content;
        if (cacheEntries[key]) {
          content = fs.readFileSync(path.join(cachePath, key), 'utf8');
        } else if (cacheEntries[identicalKey]) {
          content = fs.readFileSync(filename, 'utf8');
        } else {
          let origContent = fs.readFileSync(filename, 'utf8');
          let result = compileContent(origContent);
          content = result.content;
          if (result.identical) {
            writeFileLater(identicalKey, '');
          } else {
            writeFileLater(key, content);
          }
        }
        return module._compile(content, filename, {
          compiledWithReify: true
        });
      };
    }
    let immediateTimer = null;
    let pendingWrites = Object.create(null);
    function writeFileLater(key, content) {
      pendingWrites[key] = content;
      if (immediateTimer !== null) {
        return;
      }
      immediateTimer = setImmediate(() => {
        immediateTimer = null;
        Object.keys(pendingWrites).forEach(key => {
          try {
            let targetPath = path.resolve(cachePath, key);
            let tempPath = targetPath + '.tmp';
            fs.writeFileSync(tempPath, pendingWrites[key]);
            fs.renameSync(tempPath, targetPath);
          } catch (err) {}
        });
        pendingWrites = Object.create(null);
      });
    }
  };
}.call(this, module);
//# sourceMappingURL=runtime.js.map