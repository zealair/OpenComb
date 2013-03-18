
var $opencomb = {} ;

jQuery(function($){


	var initOpenComb = function() {

		$opencomb.shipper = new Shipper() ;
		$opencomb.shipper.require("ocPlatform/lib/frontend/mvc/View.js",function(err,module){
			if(err)
			{
				throw err ;
			}

			console.log( module.test() ) ;
		}) ;

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
			return this._moduleCache[path] ;
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

				var ele = document.createElement("script") ;
				ele.src = "/ship-down:"+path ;
				ele.type = "text/javascript" ;
				document.head.appendChild(ele) ;
			}

			, _onDownloaded: function(deps,func)
			{
				this.deps = deps ;
				this.func = func ;

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
	Shipper.prototype._onDownloaded = function(path,deps,func)
	{
		this.cache(path,true)._onDownloaded(deps,func) ;
	}
////////////////////////////////


	initOpenComb() ;
}) ;

