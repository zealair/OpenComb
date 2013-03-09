
var Class = require("ocClass.js/lib/Class.js") ;
var Controller = require("../mvc/Controller.js") ;
var url = require("url") ;

module.exports = Class.extend({

	route: function(res,rspn){

		var urlInfo = url.parse(res.url) ;

		var controllerPath = urlInfo.pathname.substr(1,urlInfo.pathname.length-1) || this._defaultControllerPath ;

		var controllerClass = require(controllerPath) ;

		if( !controllerClass || !Class.isA(controllerClass,Controller) )
		{
			throw new Error("请求的控制器没有继承自 Controller 类") ;
		}

		controllerClass.instance().main(res,rspn) ;
	}

	, _defaultControllerPath: "ocPlatform/controllers/Hello"

}) ;
