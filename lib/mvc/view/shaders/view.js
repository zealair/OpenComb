var text = new require("octemplate/lib/shaderfuncs/text.js") ;

module.exports = {

	selector: ["view","views"]

	, shader: function(uiobject,buff,next,generator,tpl){

		var name = uiobject.headTag.namedAttributes.name?
			text.joinAsString(uiobject.headTag.namedAttributes.name.text): "'*'" ;
		var mode = uiobject.headTag.namedAttributes.mode?
			text.joinAsString(uiobject.headTag.namedAttributes.mode.text): "undefined" ;

		buff.write("var name = "+name+" ;") ;
		buff.write("var mode = "+mode+" ;") ;
		buff.write("// 连接所有子视图") ;
		buff.write("if(name=='*')") ;
		buff.write("{") ;
		buff.indent(1) ;
		buff.output("<div class=\"oclayout-container\">") ;
		buff.write("for(var name in $model.$view._children)") ;
		buff.write("{") ;
		buff.indent(1) ;
		buff.write("buff.write($model.$view._children[name].buff,mode||'weak') ;") ;
		buff.indent(-1) ;
		buff.write("}") ;
		buff.output("</div>") ;
		buff.indent(-1) ;
		buff.write("}") ;

		buff.write("// 连接指定的视图") ;
		buff.write("else") ;
		buff.write("{") ;
		buff.indent(1) ;
		buff.write("if(!$model.$view._children[name])") ;
		buff.write("{") ;
		buff.indent(1) ;
		buff.write("buff.write(\"not found view named: \"+name) ;") ;
		buff.indent(-1) ;
		buff.write("}else{") ;
		buff.indent(1) ;
		buff.write("buff.write($model.$view._children[name].buff,mode||'soft') ;") ;
		buff.indent(-1) ;
		buff.write("}") ;
		buff.indent(-1) ;
		buff.write("}") ;
	}
}




module.exports.__SHIPPABLE = true ;