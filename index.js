global._ = require("./public/lib/3party/underscore-1.4.4.js") ;
require("./lib/core/reset.js") ;
require("./lib/mvc/Former.js") ;
var pkgmeta = require("./package.json") ;

var app = require("./lib/core/Application.js") ( process.cwd() ) ;
app.startup(function(err)
{
	if(err)
	{
		console.log(err) ;
	}

	else
	{
		console.log("OpenComb("+pkgmeta.version+") has startuped :)") ;
	}
}) ;