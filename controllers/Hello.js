
module.exports = {

	title: "Hello World, this is OpenComb"
	, view: "ocPlatform/Hello.html"
	, layout: "ocPlatform/layout/LayoutWebBrowse.js"

	, process: function(req,rspn){

		req.params ;

		// req.layout.params.id ;

		return true ;
	}

} ;
