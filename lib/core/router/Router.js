
var Class = require("occlass/lib/Class.js") ;
var Controller = require("../../mvc/Controller.js") ;
var path = require("path") ;

module.exports = Class.extend({

	ctor: function(platform){
		this.platform = platform ;
	}

	, route: function(req,res,next){

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
				res.setHeader("Content-Type", "text/html") ;
				res.setHeader("Power-by", "OpenComb") ;

				var earth = controller.createEarth(req,res,this.platform) ;
				controller.main(earth) ;
			}

			if(err)
			{
				if( typeof err.code!="undefined" && err.code=='MODULE_NOT_FOUND')
				{
					res.statusCode = '404' ;
					var controllerPath = "opencomb/lib/mvc/controllers/MissController.js" ;
				}
				else
				{
					res.statusCode = '500' ;
					console.log(err.toString()) ;

					// 500 controller ?
					var controllerPath = "opencomb/lib/mvc/controllers/MissController.js" ;
				}

				controller = Controller.load(controllerPath,function(err,controller){

					if(err)
					{
						// 什么？连 404 网页也找不到？？
						res.write("<h1>500</h1>") ;
						res.statusCode = '500' ;
						res.end() ;
					}
					else
					{
						main(controller) ;
					}
				}) ;
			}

			else
			{
				res.statusCode = '200' ;
				main(controller) ;
			}

		}) ;
	}

	, setDefaultController: function(controllerPath)
	{
		this._defaultControllerPath = controllerPath ;
	}

	, _defaultControllerPath: "opencomb/lib/mvc/controllers/Hello"

},{
	className: "ControllerRouter"
}) ;



