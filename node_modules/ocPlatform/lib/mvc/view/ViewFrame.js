var Class = require("ocClass") ;

module.exports = Class.extend({},{

	createFromTemplate: function(tplRenderCtx){

		tplRenderCtx._children = {} ;
		tplRenderCtx.addView = function(view,name){

		}

		return tplRenderCtx ;
	}

}) ;