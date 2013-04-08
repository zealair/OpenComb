require("ocplatform/lib/system/reset.js") ;
var Platform = require("ocplatform/lib/system/Platform.js") ;

var platform = new Platform() ;
platform.startup(function(err){

	if(err)
	{
		throw err ;
	}

	console.log("OpenComb has started up :)") ;

}) ;


