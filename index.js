
var Application = require("ocframework") ;

var app = new Application() ;
app.startup(function(err){

	if(err)
	{
		throw err ;
	}

	console.log("OpenComb has started up :)") ;
}) ;


