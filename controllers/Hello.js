
module.exports = {

	config: {
		title: "Hello World, this is OpenComb"
		, view: "ocPlatform/Hello.html"
		, layout: "front"
	}

	, process: function(req,rspn){
		rspn.write("hello") ;

		req.params ;

		// req.layout.params.id ;

		return true ;
	}

} ;
