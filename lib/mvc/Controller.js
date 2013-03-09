var Class = require("ocClass.js/lib/Class.js") ;


var Controller = module.exports = Class.extend({


	main: function(param,out){

		this.process(param,out) ;

	}


},{
	instance: function(){
		if(!Controller._instance)
		{
			Controller._instance = new this ;
		}
		return Controller._instance ;
	}

	, _instance: null
}) ;