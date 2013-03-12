
var Class = require("ocClass/lib/Class.js") ;
var Controller = require("./../mvc/Controller.js") ;
var Response = require("ocPlatform/lib/mvc/Response.js") ;
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
					rspn.write(404) ;
				}
				else
				{
					rspn.write(500) ;
				}
				next() ;
			}
			else
			{
				controller.main(req,Response.buildControllerResponse(rspn)) ;
			}
		}) ;
	}

	, _defaultControllerPath: "ocPlatform/Hello"

},{

	className: "ControllerRouter"
}) ;



