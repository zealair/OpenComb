
var Platform = require("ocplatform") ;

var platform = new Platform() ;
platform.startup(function(err){

	if(err)
	{
		throw err ;
	}

	console.log("OpenComb has started up :)") ;

}) ;


