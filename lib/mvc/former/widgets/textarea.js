var text = new require("octemplate/lib/shaderfuncs/text.js") ;
var shaderNode = new require("octemplate/lib/shaderfuncs/node.js") ;

module.exports = {

	selector: "textarea"

	, create: function(tpl,former,eleForm,eleWidget){

		var widgetName = tpl.$(eleWidget).attr('name') ;

		former.widgets[widgetName] = {
			name: widgetName
			, datatype: 'string'
		}

		// 安装 shader
		eleWidget.former = former ;
		tpl.applyShader(eleWidget,shader) ;
	}
}

function shader(node,buff,next,generator,tpl)
{
	if(node.former )
	{
		shaderNode.tagShader(node,buff) ;

		var modelVarName = node.former.modelVarName() ;
		var nameExp = text.joinAsString(node.attributes.name,true) ;
		var propertyExp = modelVarName + "[("+nameExp+")]" ;

		buff.write( "if(typeof "+modelVarName +"!='undefined'&&"+ propertyExp +"!==undefined){") ;// + "&&"+ ) ;
		buff.indent(1) ;
		buff.write("buff.write( "+propertyExp+".toString().replace(/\\\\/,'\\\\\\\\').replace(/\\\"/,'\\\\\"') ) ;") ;
		buff.indent(-1) ;
		buff.write("}else{") ;
		buff.indent(1) ;

		generator.makeChildrenSync(node,buff,tpl) ;

		buff.indent(-1) ;
		buff.write("}") ;

		shaderNode.tailTagShader(node,buff) ;
	}

	else
	{
		next() ;
	}
}
