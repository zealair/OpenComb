
module.exports = {

	view: "ocPlatform/WebPage.html"

	, init: function(callback){
		this._super(function(err,controller){
			if( controller.view )
			{
				controller.view.useWrapper = false ;
			}
			callback(err,controller) ;
		}) ;
	}
} ;
