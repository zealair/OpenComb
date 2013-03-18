var url = require("url") ;
var fs = require("fs") ;
var _pt = require("path") ;


var ShipperServer = module.exports = function(){}


module.exports.prototype.connect_middleware = function(req,rspn,next){

	var urlInfo = url.parse(req.url) ;

	if( urlInfo.path.substr(0,17)=="/ship-query-deps:" )
	{
		var deps = [] ;
		this.traceDep( [urlInfo.path.substr(17)], deps, function(err,deps){

			if( err )
			{
				rspn.statusCode = err.code ;
				rspn.write(err.message) ;
			}

			else
			{
				rspn.write( JSON.stringify(deps) ) ;
			}

			rspn.end() ;
		} ) ;

	}
	else if( urlInfo.path.substr(0,11)=="/ship-down:" )
	{
		var path = urlInfo.path.substr(11) ;
		this.load( path, function(err,compiled){

			if( err )
			{
				rspn.statusCode = err.code ;
				rspn.write(err.message) ;
			}

			else
			{
				rspn.write("$opencomb.shipper._onDownloaded('"+path+"',"+JSON.stringify(compiled.deps)+","+compiled.code+") ;") ;
			}

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
	}

	if( !this.checkShippable (path) )
	{
		callback({code:403,file:path,message:"forbidden:"+path}) ;
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

		var regexp = /require\s*\((.*?)\)/mg ;
		var res ;
		var lastIndex = 0 ;
		while( res=regexp.exec(source) )
		{
			var res2 = res[1].match(/^\s*["'](.*?)["']\s*$/) ;
			if(!res2)
			{
				callback({code:500,message:"cound't pass a variable("+res[1]+") to require(). file: "+path})
				return ;
			}

			var tidypath = makePath(res2[1],path) ;
			compiled.code+= source.substring(lastIndex,res.index) + "require(\"" + tidypath + "\")" ;
			compiled.deps.push(tidypath) ;
			lastIndex = regexp.lastIndex ;
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

module.exports.prototype.checkShippable = function(path){
	var mod = require(path) ;
	return ('__SHIPPABLE' in mod) && mod.__SHIPPABLE ;
}