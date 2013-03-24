
module.exports = {

	title: "Hello World, this is OpenComb"
	, view: "ocPlatform/Hello.html"
	, layout: "ocPlatform/layout/WebLayout.js"

	, process: function(req,rspn){

		req.params ;

		// req.layout.params.id ;

		return true ;
	}

} ;
