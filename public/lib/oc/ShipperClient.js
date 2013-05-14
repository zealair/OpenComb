
var Shipper = function()
{
	this._moduleCache = {
		module: {}
		, viewscript: {}
	} ;
	this._loadings = [] ;
	this._callbacks = [] ;
}

Shipper.prototype.require = function(path,callback,type)
{
	if(path.constructor===Array)
	{
		callback && this._callbacks.push(callback) ;

		for(var i=0;i<path.length;i++)
		{
			this.require(path[i],null,type) ;
		}

		return ;
	}

	else
	{
		path = path.replace(/^\/+/,'') ;

		var shipper = this ;

		util.array.pushIfNotExists(this._loadings,path) ;
		callback && this._callbacks.push(callback) ;

		// console.log("require shipdown ",path,this._loadings.length) ;

		var cache = this.cache(path,true,type) ;
		cache.download( function moduelDownloaded(err,downloadedcache){

			util.array.remove(shipper._loadings,downloadedcache.path) ;
			// console.log(downloadedcache.path,shipper._loadings) ;

			for(var i=0;i<downloadedcache.deps.length;i++)
			{
				var depcache = shipper.cache(downloadedcache.deps[i],true,'module') ;
				// console.log("	require module ",downloadedcache.deps[i]," ",depcache.downloaded? "loaded": "unloaded") ;

				if(!depcache.downloaded && !depcache.downloading)
				{
					//console.log("	start loading") ;

					util.array.pushIfNotExists(shipper._loadings,downloadedcache.deps[i]) ;
					depcache.download(moduelDownloaded) ;
				}
			}

			// all modules downloaded
			if(!shipper._loadings.length)
			{
				// notice watcher
				var cbs = shipper._callbacks.slice() ;
				shipper._callbacks = [] ;

				for(var i=0;i<cbs.length;i++)
				{
					cbs[i](null) ;
				}
			}

		} ) ;
	}
}

Shipper.prototype.module = function(path,type)
{
	var cache = this.cache(path,false,type) ;
	if(!cache)
	{
		throw new Error("cound not found module under frontend : "+path) ;
	}
	return cache.load() ;
}

Shipper.prototype.cache = function(path,create,type)
{
	type = type || 'module' ;

	if( typeof this._moduleCache[type][path]!="undefined" )
	{
		if(this._moduleCache[type][path].error)
		{
			throw new Error(this._moduleCache[type][path].error) ;
		}
		else
		{
			return this._moduleCache[type][path] ;
		}
	}
	if( !create )
	{
		return null ;
	}

	return this._moduleCache[type][path] = new ShipModuleCache(this,path,type) ;
}

Shipper.prototype.downloaded = function(err,type,path,deps,func)
{
	if(err)
	{
		this.cache(path,true,type)._onDownloaded(err,[],function(){}) ;

		var modules = this.revertQueryDep(path) ;
		if(modules.length)
		{
			err+= " , and these modules depended it : \"" + modules.join("\", \"") + '"' ;
		}

		throw new Error(err) ;
	}
	else
	{
		// console.log("module downloaded",path) ;
		this.cache(path,true,type)._onDownloaded(null,deps,func) ;
	}
}
Shipper.prototype.revertQueryDep = function(dep)
{
	var modules = [] ;

	for(var key in this._moduleCache.module)
	{
		if(this._moduleCache.module[key].deps)
		{
			for(var l=0;l<this._moduleCache.module[key].deps.length;l++)
			{
				if( this._moduleCache.module[key].deps[l] == dep )
				{
					modules.push(key) ;
					break ;
				}
			}
		}
	}

	return modules ;
}

Shipper.prototype.createScript = function(src,load)
{
	var ele = document.createElement("script") ;
	ele.src = src ;
	ele.type = "text/javascript" ;
	if(load)
	{
		document.getElementsByTagName("head")[0].appendChild(ele) ;
	}
	return ele ;
}




function ShipModuleCache (shipper,path,type)
{
	this.deps = null
	this.func = null
	this.module = {
		exports: {}
		, loaded: false
		, filename: path
	} ;

	this.downloaded = false
	this.downloading = false
	this.waitingDownloadCallbacks = []
	this.path = path ;
	this.type = type ;



	this.download = function(callback)
	{
		if(this.downloaded)
		{
			callback(null,this) ;
			return ;
		}

		this.waitingDownloadCallbacks.push(callback) ;

		if(!this.downloading)
		{
			this.downloading = true ;
			shipper.createScript("/shipdown"+ (this.type=='module'? '': (':'+this.type)) +(path[0]=='/'?'':"/")+path,true) ;
		}
	}

	this._onDownloaded = function(err,deps,func)
	{
		this.deps = deps ;
		this.func = func ;
		this.error = err ;

		this.downloading = false ;
		this.downloaded = true ;

		// 通知 callback
		var callback, cblst = this.waitingDownloadCallbacks.slice() ;
		while(callback=cblst.shift())
		{
			callback(null,this) ;
		}
	}

	this.load = function()
	{
		if(this.module.loaded)
		{
			return this.module.exports ;
		}

		function require(path)
		{
			return shipper.module(path) ;
		}
		require.resolve = function()
		{
			throw new Error("can not call require.resolve() in browser .") ;
		}

		if(!this.func)
		{
			//this.func = function(){}
			throw new Error("module has no func ? "+this.path) ;
		}

		var err = null ;
		try{
			this.func.apply(null,[
				require
				, this.module
				, this.module.exports
				, null
				, this.module.filename
			]) ;
		}catch(e){
			err = e ;
		}

		this.module.loaded = true ;

		if(err)
		{
			throw err ;
		}

		return this.module.exports ;
	}

}





var util = {
	array: {
		search: function(arr,ele)
		{
			for(var i=0;i<arr.length;i++)
			{
				if( arr[i] == ele )
				{
					return i ;
				}
			}

			return false ;
		}
		, remove: function(arr,ele)
		{
			var idx = util.array.search(arr,ele) ;
			if(idx!==false)
			{
				arr.splice(idx,1) ;
			}
		}
		, pushIfNotExists: function(arr,ele)
		{
			if(util.array.search(arr,ele)===false)
			{
				arr.push(ele) ;
			}
		}
	}
}



jQuery.shipper = new Shipper() ;
$shipper = jQuery.shipper ;		// init global variable $shipper
