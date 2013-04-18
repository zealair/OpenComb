
var Class = require("occlass/lib/Class.js") ;
var Controller = require("ocplatform/lib/mvc/Controller.js") ;
var path = require("path") ;

module.exports = Class.extend({

	ctor: function(platform){
		this.platform = platform ;
	}

	, route: function(req,rsp,next){

		var extname = path.extname(req._parsedUrl.pathname) ;
		if( extname && extname.toLowerCase()!='.js' )
		{
			next() ;
			return ;
		}

		var controllerPath = req._parsedUrl.pathname.substr(1,req._parsedUrl.pathname.length-1) || this._defaultControllerPath ;
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

				var earth = controller.createEarth(req,rsp,this.platform) ;
				controller.main(earth,function(controller,earth){
					// 销毁 earth 对象
					earth.rsp.end() ;
					earth.destroy() ;
				}) ;
			}

			if(err)
			{
				if( typeof err.code!="undefined" && err.code=='MODULE_NOT_FOUND')
				{
					rsp.statusCode = '404' ;
					var controllerPath = "ocplatform/lib/mvc/controllers/MissController.js" ;
				}
				else
				{
					rsp.statusCode = '500' ;
					console.log(err.toString()) ;

					// 500 controller ?
					var controllerPath = "ocplatform/lib/mvc/controllers/MissController.js" ;
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

	, _defaultControllerPath: "ocplatform/lib/mvc/controllers/Hello"

},{
	className: "ControllerRouter"
}) ;



