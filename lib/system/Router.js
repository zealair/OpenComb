
var Class = require("ocClass/lib/Class.js") ;
var Controller = require("./../mvc/Controller.js") ;
var Response = require("../mvc/Response.js") ;
var url = require("url") ;

module.exports = Class.extend({

	route: function(req,rspn,next){

		var urlInfo = url.parse(req.url) ;
		var controllerPath = urlInfo.pathname.substr(1,urlInfo.pathname.length-1) || this._defaultControllerPath ;
		if(!controllerPath)
		{
			next() ;
			return ;
		}

		Controller.load(controllerPath,function(err,controller){

			if(err)
			{
				if( typeof err.code!="undefined" && err.code=='MODULE_NOT_FOUND')
				{
					rspn.codeStatus = 404 ;
				}
				else
				{
					rspn.codeStatus = 500 ;
				}
				next() ;

				throw err ;
			}
			else
			{
				rspn.setHeader("Content-Type", "text/html") ;
				rspn.setHeader("Power-by", "OpenComb") ;

				controller.main(req,Response.buildControllerResponse(rspn)) ;
			}
		}) ;
	}

	, _defaultControllerPath: "ocPlatform/Hello"

},{

	className: "ControllerRouter"
}) ;



