var url = require("url") ;
var fs = require("fs") ;
var _pt = require("path") ;
var querystring = require("querystring") ;
var utilarr = require("ocPlatform/lib/util/array.js") ;

var ShipperServer = module.exports = function(){
	this._arrAllowPatterns = [] ;
	this._arrAllowFolders = [] ;
}


module.exports.prototype.connect_middleware = function(req,rspn,next){

	var urlInfo = url.parse(req.url) ;

	if( urlInfo.pathname.substr(0,11)=="/ship-down:" )
	{
		var path = urlInfo.pathname.substr(11) ;
		var query = querystring.parse(urlInfo.query) ;
		var callwrapper = query.wrapper || "$define" ;

		this.load( path, function(err,compiled){

			var outpath = '"'+path+'"' ;
			if(err)
			{
				var outerr = '"'+addslashes(compiled.message)+'"' ;
				var outdeps = 'null' ;
				var outdefine = 'null' ;

				rspn.statusCode = err.code || "500" ;
			}
			else
			{
				var outerr = 'null' ;
				var outdeps = JSON.stringify(compiled.deps||[]) ;
				var outdefine = compiled.code ;
			}

			var output = callwrapper.replace("$err",outerr) ;
			output = output.replace("$path",outpath) ;
			output = output.replace("$deps",outdeps) ;
			output = output.replace("$define",outdefine) ;

			rspn.setHeader("Content-Type","application/javascript") ;
			rspn.write(output) ;
			rspn.end() ;

		} ) ;
	}
	else
	{
		next() ;
	}
}


module.exports.prototype.load = function(path,callback){

	try{
		var mod = require(path) ;
		var fullpath = require.resolve(path) ;
	}catch(e){
		callback({code:404,file:path,message:e.toString()}) ;
		return ;
	}

	if( !this.checkShippable (path,fullpath) )
	{
		callback({code:403,file:path,message:"Forbidden ship download module: "+path}) ;
		return ;
	}

	if( '__SHIPCOMPILEDCACHE' in mod && mod.__SHIPCOMPILEDCACHE )
	{
		callback(null,mod.__SHIPCOMPILEDCACHE) ;
		return ;
	}

	fs.readFile(fullpath,function(err,buff){
		if(err)
		{
			callback({code:404,file:path,message:"can not found module: \""+path+"\"",cause:err}) ;
			return ;
		}

		var source = buff.toString() ;
		var compiled = {
			code: ""
			, deps: []
		} ;

		var regexp = /(^|[^\.])require\s*\((.*?)\)/mg ;
		var res ;
		var lastIndex = 0 ;
		while( res=regexp.exec(source) )
		{
			var res2 = res[2].match(/^\s*["']([^"']*?)["']\s*$/) ;
			if(!res2)
			{
				callback({code:404,message:"cound't pass a variable \""+res[2]+"\" to require(). file: "+path})
				return ;
			}

			// 检查模块是否有效
			if(res2[1][0]!=".")
			{
				try{
					var deppath = require.resolve(res2[1]) ;
					if(!deppath || deppath[0]!="/")
					{
						continue ;
					}
				} catch(e) {
					// 无法确定模块路径
					continue ;
				}
			}

			var tidypath = makePath(res2[1],path) ;
			compiled.code+= source.substring(lastIndex,res.index) + res[1]+"require(\"" + tidypath + "\")" ;
			lastIndex = regexp.lastIndex ;
			compiled.deps.push(tidypath) ;
		}

		compiled.code+= source.substring(lastIndex,source.length) ;
		compiled.code = "function(require,module,exports,__dirname,__filename){\r\n\r\n" + compiled.code + "\r\n\r\n}" ;

		mod.__SHIPCOMPILEDCACHE = compiled ;
		callback(null,mod.__SHIPCOMPILEDCACHE) ;
	})
}

module.exports.prototype.traceDep = function(queue,deps,callback)
{
	if(!queue.length)
	{
		callback(null,deps) ;
		return ;
	}

	var path = queue.shift() ;
	var fullpath = require.resolve(path) ;
	var dirpath = _pt.dirname(fullpath) ;
	var shipper = this ;

	this.load(path,function(err,compiled){
		if(err)
		{
			callback(err) ;
			return ;
		}

		deps.push(path) ;

		for(var i=0;i<compiled.deps.length;i++)
		{
			if( !exists(deps,compiled.deps[i]) )
			{
				if( !fs.existsSync(require.resolve(compiled.deps[i],dirpath)) )
				{
					callback({code:404,message:"can not found module: \""+compiled.deps[i]+"\" for "+path+"( Node.js build-in module cound not ship to client) "}) ;
					return ;
				}

				queue.push(compiled.deps[i]) ;
			}
		}

		// next
		shipper.traceDep(queue,deps,callback) ;
	})
}

var exists = function(array,value)
{
	for(var i=0;i<array.length;i++)
	{
		if( array[i]===value )
		{
			return true ;
		}
	}
	return false ;
}

var makePath = function(path,from){

	if(path[0]==".")
	{
		return _pt.normalize(_pt.dirname(from)+"/"+path) ;
	}
	else
	{
		return _pt.normalize(path) ;
	}
}

module.exports.prototype.registerAllowFolder = function(dirpath)
{
	this._arrAllowFolders.push(dirpath) ;
}

module.exports.prototype.registerAllowFilter = function(regexp)
{
	this._arrAllowPatterns.push(regexp) ;
}

module.exports.prototype.checkShippable = function(path,fullpath)
{
	for(var i=0;i<this._arrAllowFolders.length;i++)
	{
		if( fullpath.substr(0,this._arrAllowFolders[i].length) == this._arrAllowFolders[i] )
		{
			return true ;
		}
	}

	for(var i=0;i<this._arrAllowPatterns.length;i++)
	{
		if( this._arrAllowPatterns[i].constructor===RegExp && this._arrAllowPatterns[i].test(fullpath) )
		{
			return true ;
		}
		else if (typeof this._arrAllowPatterns[i]=="function" && this._arrAllowPatterns[i](fullpath))
		{
			return true ;
		}
	}

	var mod = require(path) ;
	return ('__SHIPPABLE' in mod) && mod.__SHIPPABLE ;
}


var addslashes = function (str){
	str = str.replace(/\\/g,'\\\\');
	str = str.replace(/\'/g,'\\\'');
	str = str.replace(/\"/g,'\\"');
	str = str.replace(/\0/g,'\\0');
	return str;
}