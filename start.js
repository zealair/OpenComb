#! /usr/local/bin/node

var pkgmeta = require("./package.json") ;

require("./index.js")
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