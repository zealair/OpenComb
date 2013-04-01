require("ocPlatform/lib/system/reset.js") ;
var Platform = require("ocPlatform/lib/system/Platform.js") ;

(new Platform()).startup(function(err){

	if(err)
	{
		throw err ;
	}

	console.log("OpenComb has started up :)") ;

}) ;