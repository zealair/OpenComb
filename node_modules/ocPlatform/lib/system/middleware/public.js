

var send = require('send')
	, utils = require('connect/lib/utils')
	, parse = utils.parseUrl
	, url = require('url');


exports = module.exports = function public(root, urlroot, options){

	options = options || {};

	// root required
	if (!root) throw new Error('static() root path required');
	urlroot = urlroot || "" ;

	// default redirect
	var redirect = false !== options.redirect;

	return function public(req, res, next) {
		if ('GET' != req.method && 'HEAD' != req.method) return next();
		var path = parse(req).pathname;
		if( urlroot )
		{
			if(path.substr(0,urlroot.length)!=urlroot)
			{
				return next() ;
			}

			path = path.substr(urlroot.length) ;
		}

		var pause = utils.pause(req);

		function resume() {
			next();
			pause.resume();
		}

		function directory() {
			if (!redirect) return resume();
			var pathname = url.parse(req.originalUrl).pathname;
			res.statusCode = 301;
			res.setHeader('Location', pathname + '/');
			res.end('Redirecting to ' + utils.escape(pathname) + '/');
		}

		function error(err) {
			if (404 == err.status) return resume();
			next(err);
		}


		send(req, path)
			.maxage(options.maxAge || 0)
			.root(root)
			.hidden(options.hidden)
			.on('error', error)
			.on('directory', directory)
			.pipe(res);
	};
};

/**
 * Expose mime module.
 *
 * If you wish to extend the mime table use this
 * reference to the "mime" module in the npm registry.
 */

exports.mime = send.mime;
