!(function commonjsLoader(global){
	var out = {};
	/**
	 * @param {String} src source code to be transpiled
	 * @param {String} url file url for source map
	 */
	out.transpile = function(src,url){
		return src;
	};

	/**
	 * get js file with sync XHR
	 * @param {String} url 
	 * @return {String} contents of the required file
	 */
	var xhrGet = function(url){
		var xhr = new XMLHttpRequest();
		xhr.open('GET',url,false);
		xhr.send(null);
		return xhr.responseText;
	};

	var xhrGetAsync = function(url){
		return new Promise(function(resolve){
			var xhr = new XMLHttpRequest();
			xhr.open('GET',url,true);
			xhr.onload = function(ev){
				resolve(this.responseText);
			};
			xhr.onreadystatechange = function(ev){
				if(this.readyState!==4) return;
				resolve(this.responseText);
			};
			xhr.send(null);
		});
	};

	var fillUrl = function(url){
		return url.slice(-3)==='.js'?
		url:
		url+'.js';
	};

	var codes2module = function(jsCodes,url){
		var timerStart = +new Date();//timer
		jsCodes = out.transpile(jsCodes,url);
		jsCodes = '0,(function(require,module,exports){'+jsCodes+'\n});\n//# sourceURL='+url;
		var factory = global.eval(jsCodes);
		var module = {
			exports:{},
			id:url
		};
		console.log(new Date() - timerStart,url);
		factory(createRequire(url),module,module.exports);
		moduleList[module.id] = module.exports;

		return module.exports;
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
	var createRequire = function createRequire(baseURL){
		var require = function(url,asyncPromise){
			url = resolveRelative(url,baseURL);
			url = fillUrl(url);
			if(moduleList.hasOwnProperty(url)){
				return moduleList[url];
			}

			var jsCodes = xhrGet(url);
			jsCodes = codes2module(jsCodes,url);
			return jsCodes;
		};
		require.async = function(url){
			url = resolveRelative(url,baseURL);
			url = fillUrl(url);
			if(moduleList.hasOwnProperty(url)){
				return moduleList[url];
			}

			return xhrGetAsync(url).then(function(jsCodes){
				jsCodes = codes2module(jsCodes,url);
				return jsCodes;
			});
		};
		return require;
	};

	// global require
	out.require = createRequire(location.href);

	// module exports
	global.commonjsLoader = out;
	if(!global.require) global.require = out.require;
})(this);
