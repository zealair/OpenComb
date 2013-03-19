
var $opencomb = null ;

jQuery(function($){

	var shipdownloads = [
		"ocTemplate/lib/TemplateCaches.js"
		, "ocPlatform/lib/frontend/mvc/View.js"
	] ;

	var initOpenComb = function() {

		$opencomb.shipper.module("ocPlatform/lib/frontend/mvc/View.js").initViewsInDocument($opencomb,$) ;


		var Factory = $opencomb.shipper.module("ocHtmlParser/lib/Factory.js") ;
		var uitree = Factory.htmlParser().parseSync(document.body.innerHTML) ;
		console.log(uitree) ;


		console.log("OpenComb frontend has loaded on your browser :)") ;
	}



////////////////////////////////
	var Shipper = function()
	{
		this._moduleCache = {} ;
	}

	Shipper.prototype.require = function(path,callback)
	{
		this.cache(path,true).download( function(err,cache){
			if( callback )
			{
				callback( err, cache? cache.module.exports: undefined ) ;
			}
		} ) ;
	}

	Shipper.prototype.module = function(path)
	{
		return this.cache(path,true).module.exports ;
	}

	Shipper.prototype.cache = function(path,create)
	{
		if( typeof this._moduleCache[path]!="undefined" )
		{
			if(this._moduleCache[path].error)
			{
				throw new Error(this._moduleCache[path].error) ;
			}
			else
			{
				return this._moduleCache[path] ;
			}
		}
		if( !create )
		{
			return null ;
		}

		var shipper = this ;

		return this._moduleCache[path] = {
			deps: null
			, func: null
			, module: {
				exports: {}
				, loaded: false
				, filename: path
			}
			, downloaded: false
			, downloading: false
			, waitingDownloadCallbacks: []

			, download: function(callback){

				if(this.downloading)
				{
					this.waitingDownloadCallbacks.push(callback) ;
					return ;
				}
				else if(this.downloaded)
				{
					callback(null,this) ;
					return ;
				}

				this.waitingDownloadCallbacks.push(callback) ;
				this.downloading = true ;

				shipper.createScript("/ship-down:"+path + "?wrapper=$opencomb.shipper._onDownloaded($err,$path,$deps,$define)",true) ;
			}

			, _onDownloaded: function(err,deps,func)
			{
				this.deps = deps ;
				this.func = func ;
				this.error = err ;

				var cache = this ;
				var downloadDone = function(){

					cache._load() ;

					cache.downloaded = true ;
					cache.downloading = false ;

					// 通知 callback
					var callback ;
					while(callback=cache.waitingDownloadCallbacks.shift())
					{
						callback(null,cache) ;
					}
				}

				if(deps.length)
				{
					var depscnt = deps.length ;
					for(var i=0;i<this.deps.length;i++)
					{
						var depcache = shipper.cache( this.deps[i], true ) ;
						depcache.download(function(){
							if( (--depscnt)<=0 )
							{
								downloadDone() ;
							}
						}) ;
					}
				}
				else
				{
					downloadDone() ;
				}
			}

			, _load: function()
			{
				var require = function(path)
				{
					return shipper.module(path) ;
				}
				require.resolve = function()
				{
					throw new Error("can not call require.resolve() in browser .") ;
				}

				this.func.apply(null,[
					require
					, this.module
					, this.module.exports
					, null
					, this.module.filename
				]) ;

				this.module.loaded = true ;
			}

		}
	}
	Shipper.prototype._onDownloaded = function(err,path,deps,func)
	{
		if(err)
		{
			this.cache(path,true)._onDownloaded(err,[],function(){}) ;

			var modules = this.revertQueryDep(path) ;
			if(modules.length)
			{
				err+= " , and these modules depended it : \"" + modules.join("\", \"") + '"' ;
			}

			throw new Error(err) ;
		}
		else
		{
			this.cache(path,true)._onDownloaded(null,deps,func) ;
		}
	}
	Shipper.prototype.revertQueryDep = function(dep)
	{
		var modules = [] ;

		for(var key in this._moduleCache)
		{
			if(this._moduleCache[key].deps)
			{
				for(var l=0;l<this._moduleCache[key].deps.length;l++)
				{
					if( this._moduleCache[key].deps[l] == dep )
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
			document.head.appendChild(ele) ;
		}
		return ele ;
	}
////////////////////////////////


	$opencomb = $(document) ;
	$opencomb.views = {} ;
	$opencomb.viewpool = [] ;
	$opencomb.shipper = new Shipper() ;

	var waiting = shipdownloads.length ;
	for(var i=0;i<shipdownloads.length;i++)
	{
		$opencomb.shipper.require(shipdownloads[i],function(err,module){
			if(err)
			{
				throw err ;
			}
			if( !(--waiting) )
			{
				initOpenComb() ;
			}
		}) ;
	}

}) ;

