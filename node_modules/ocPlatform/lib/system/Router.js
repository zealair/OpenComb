
var Class = require("ocClass/lib/Class.js") ;
var Controller = require("./../mvc/controller/Controller.js") ;
var url = require("url") ;
var assert = require("assert") ;
var path = require("path") ;

module.exports = Class.extend({

	ctor: function(platform){
		this.platform = platform ;
	}

	, route: function(req,rsp,next){

		var urlInfo = url.parse(req.url) ;

		var extname = path.extname(urlInfo.pathname) ;
		if( extname && extname.toLowerCase()!='.js' )
		{
			next() ;
			return ;
		}

		var controllerPath = urlInfo.pathname.substr(1,urlInfo.pathname.length-1) || this._defaultControllerPath ;
		if(!controllerPath)
		{
			next() ;
			return ;
		}

		var router = this ;
		Controller.load(controllerPath,function(err,controller){

			function main(controller)
			{
				rsp.setHeader("Content-Type", "text/html") ;
				rsp.setHeader("Power-by", "OpenComb") ;

				module.exports.buildControllerResponse(rsp) ;
				rsp.pause() ;

				controller.main(req,rsp,router.platform) ;

				rsp.resume() ;
			}

			if(err)
			{
				if( typeof err.code!="undefined" && err.code=='MODULE_NOT_FOUND')
				{
					rsp.statusCode = '404' ;
					var controllerPath = "ocPlatform/lib/mvc/controller/MissController.js" ;
				}
				else
				{
					rsp.statusCode = '500' ;
					console.log(err.toString()) ;

					// 500 controller ?
					var controllerPath = "ocPlatform/lib/mvc/controller/MissController.js" ;
				}

				controller = Controller.load(controllerPath,function(err,controller){

					if(err)
					{
						// 什么？连 404 网页也找不到？？
						rsp.write("<h1>500</h1>") ;
						rsp.statusCode = '500' ;
						rsp.end() ;
					}
					else
					{
						main(controller) ;
					}
				}) ;
			}

			else
			{
				rsp.statusCode = '200' ;
				main(controller) ;
			}

		}) ;
	}

	, _defaultControllerPath: "ocPlatform/lib/mvc/controller/Hello"

},{

	className: "ControllerRouter"

	, buildControllerResponse:	 function(httpRspn){

		if( httpRspn._isControllerResponse )
		{
			return ;
		}

		httpRspn._isControllerResponse = true ;
		httpRspn._locks = 0 ;

		httpRspn.pause = function()
		{
			httpRspn._locks ++ ;
		}
		httpRspn.resume = function()
		{
			assert(httpRspn._locks>=1,"httpRspn._locks must be >0") ;

			if( (--httpRspn._locks)<=0 )
			{
				this.emit("complete") ;
			}
		}

		httpRspn._oriEnd = httpRspn.end ;
		httpRspn.end = function()
		{
			this._oriEnd() ;
		}

		return httpRspn ;

	}
}) ;



