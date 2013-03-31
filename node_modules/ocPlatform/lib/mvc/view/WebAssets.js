var RenderBuffer = require("./RenderBuffer.js") ;
var Class = require("ocClass") ;
var utilarray = require("ocPlatform/lib/util/array.js") ;


module.exports = RenderBuffer.extend({

	ctor: function(){
		this.css = [] ;
		this._super() ;
	}

	, putin: function(url)
	{
		if( !utilarray.search(this.css,url) )
		{
			this.css.push(url) ;
		}
	}

	, toString: function()
	{
		var html = '' ;
		for(var i=0;i<this.css.length;i++)
		{
			html+= '	<link type="text/css" href="'+this.css[i]+'" rel="stylesheet">\r\n' ;
		}
		return html ;
	}

}) ;