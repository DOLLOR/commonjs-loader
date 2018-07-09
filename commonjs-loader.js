!(function commonjsLoader(global) {
    /**
     * get js file with sync XHR
     * @param {String} url
     * @return {String} contents of the required file
     */
    var xhrGet = function (url) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.send(url);
        return xhr.responseText;
    };
    /**
     * convert relative url to absolute one
     * @param {String} path
     * @param {String} base
     * @return {String} absolute url
     */
    function resolveRelative(path, base) {
        // Absolute URL
        if (path.match(/^[a-z]*:\/\//)) {
            return path;
        }
        // Protocol relative URL
        if (path.indexOf("//") === 0) {
            return base.replace(/\/\/.*/, path);
        }
        // Upper directory
        if (path.indexOf("../") === 0) {
            return resolveRelative(path.slice(3), base.replace(/\/[^\/]*$/, ''));
        }
        // Relative to the root
        if (path.indexOf('/') === 0) {
            var match = base.match(/(\w*:\/\/)?[^\/]*\//) || [base];
            return match[0] + path.slice(1);
        }
        //relative to the current directory
        return base.replace(/\/[^\/]*$/, "") + '/' + path.replace(/^\.\//, '');
    }
    /**
     * save the loaded modules in this object, with URLs as keys
     */
    var moduleList = {};
    /**
     * create a require function
     * @param {String} baseURL the url for the current js file
     * @return {(url:String)=>any} the require function for commonJS
     */
    var createRequire = function (baseURL) {
        return function (url) {
            if (url.slice(-3) !== '.js') {
                url = url + '.js';
            }
            url = resolveRelative(url, baseURL);
            if (moduleList.hasOwnProperty(url)) {
                return moduleList[url];
            }
            var jsCodes = xhrGet(url);
            var factory = eval("\n\t\t\t\t(function(require,module,exports){\n\t\t\t\t\t" + jsCodes + "\n\t\t\t\t});\n\t\t\t");
            var module = {
                exports: {},
                id: url
            };
            factory(createRequire(url), module, module.exports);
            moduleList[module.id] = module.exports;
            return module.exports;
        };
    };
    global.requireCommonJS = createRequire(location.href);
})(this);
