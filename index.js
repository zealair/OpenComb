

process.env.NODE_PATH = (process.env.NODE_PATH||"") + __dirname+"/module" ;
console.log(process.env.NODE_PATH) ;


var Platform = require("ocPlatform/lib/system/Platform.js") ;

var platform = new Platform(null,null,__dirname) ;
platform.startup(function(err){

	if(err)
	{
		throw err ;
	}

	console.log("OpenComb has started up :)") ;

}) ;