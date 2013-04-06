
if(typeof process=='undefined')
{
	process = {} ;
}

if(!process.nextTick)
{
	process.nextTick = function(callback)
	{
		setTimeout(callback,0) ;
	}
}




var ViewTemplateCaches = require("ocPlatform/lib/mvc/view/ViewTemplateCaches.js") ;
var FrontendView = require("ocPlatform/public/lib/oc/mvc/ViewTemplate.js") ;
ViewTemplateCaches.singleton = FrontendView.Caches.singleton ;