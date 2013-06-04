var pkgmeta = require("./package.json") ;

require("./entrance.js")
	.createApplication ()
	.startup(function(err)
		{
			if(err)
			{
				console.log(err) ;
			}

			else
			{
				console.log("OpenComb("+pkgmeta.version+") has startuped :)") ;
			}
		}
	) ;