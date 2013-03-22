
var $oc = null ;

jQuery(function($){

	var shipdownloads = [
		"ocTemplate/lib/TemplateCaches.js"
		, "ocPlatform/lib/frontend/mvc/View.js"
		, "ocPlatform/lib/frontend/mvc/Director.js"
	] ;

	var initOpenComb = function() {


		$oc.shipper.module("ocPlatform/lib/frontend/mvc/View.js").initViewsInDocument($oc,$) ;

		// init controller director
		var Director = $oc.shipper.module("ocPlatform/lib/frontend/mvc/Director.js") ;
		$oc.director = new Director( $(document) ) ;
		$oc.director.setup("a","click") ;



		console.log("OpenComb frontend has loaded on your browser :)") ;
	}



	$oc = $(document) ;
	$oc.views = {} ;
	$oc.viewpool = [] ;
	$oc.shipper = new Shipper() ;
	$shipper = $oc.shipper ;		// init global variable $shipper

	var waiting = shipdownloads.length ;
	for(var i=0;i<shipdownloads.length;i++)
	{
		$oc.shipper.require(shipdownloads[i],function(err,path,module){

			if(err)
			{
				throw err ;
			}
			if( !(--waiting) )
			{
				initOpenComb() ;
			}
		}) ;
	}





}) ;

