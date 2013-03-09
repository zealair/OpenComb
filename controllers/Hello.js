var Controller = require("./../lib/mvc/Controller.js") ;

module.exports = Controller.extend({

	process: function(param,out){
		out.write("hello") ;
	}

}) ;