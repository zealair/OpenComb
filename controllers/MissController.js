module.exports = {
	view: 'ocframework/templates/404.html'

	, process: function(seed,nut){
		nut.model.message = seed.message || "Page not found.";
		nut.model.code = seed.code || '404' ;
	}
}