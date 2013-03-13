//
//var UIExpression = require("../UIExpression.js") ;
var util = require("ocTemplate/lib/shaderfuncs/util.js") ;
var RenderBuffer = require("ocPlatform/lib/mvc/view/RenderBuffer.js") ;
//var path = require("path") ;

module.exports = {

	selector: ["view","views"]

	, shader: function(uiobject,context,model){

		if( typeof uiobject.headTag.namedAttributes.name!=="undefined" )
		{
			var name = util.evalAttrExp(uiobject.headTag.namedAttributes.name,context,model) ;
			var mode = util.evalAttrExpEx(uiobject.headTag,"mode","soft",context,model) ;
		}
		else
		{
			var name = "*" ;
			var mode = util.evalAttrExpEx(uiobject.headTag,"mode","weak",context,model) ;
		}

		if( name=="*" )
		{
			for(var name in context._children)
			{
				context.buff.write(context._children[name].buff,mode) ;
			}
		}
		else
		{
			if( typeof context._children[name]=="undefined" )
			{
				context.buff.write("not found view named: "+name) ;
			}
			else
			{
				context.buff.write(context._children[name].buff,mode) ;
			}
		}


		context.stopShaderSeq() ;
	}

}