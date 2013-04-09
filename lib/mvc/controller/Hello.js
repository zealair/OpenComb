
module.exports = {

	title: "Hello World, this is OpenComb"
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

module.exports.__as_controller = true ;
