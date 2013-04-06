
module.exports = {

	title: "Hello World, this is OpenComb"
	, view: "ocPlatform/templates/Hello.html"
	, layout: "weblayout"

	, process: function(seed,nut,earth){
		return true ;
	}

	, actions: {
		say: function(seed,nut,earth)
		{
			nut.message("hello world") ;
			return true ;
		}
	}

} ;
