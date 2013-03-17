
jQuery(function($){

	var urls = [
		"/Shipper.js"
	] ;

	var loadScript = function (src){

		var ele = document.createElement("script")
		ele.src = src ;
		ele.type = "text/javascript" ;
		document.head.appendChild(ele) ;
	}

	for(var i=0;i<urls.length;i++)
	{
		loadScript(urls[i]) ;
	}

})

