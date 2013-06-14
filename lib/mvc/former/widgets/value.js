var text = new require("octemplate/lib/shaderfuncs/text.js") ;

module.exports = {

	selector: "input"
		+ ":not([type=file])"
		+ ":not([type=radio])"
		+ ":not([type=checkbox])"
		+ ":not([type=button])"
		+ ":not([type=reset])"
		+ ":not([type=submit])"
		+ ":not([type=image])"

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
	if(node.former && node.attributes.name)
	{
		if( node.attributes.value )
		{
			var oriValueExp = text.joinAsString(node.attributes.value,true) ;
		}
		else
		{
			var oriValueExp = '""' ;
		}

		var modelVarName = node.former.modelVarName() ;
		var nameExp = text.joinAsString(node.attributes.name,true) ;
		var propertyExp = modelVarName + "[("+nameExp+")]" ;

		var value = "@ (typeof " + modelVarName +'!="undefined"&&'+ propertyExp + "!==undefined)? ("+propertyExp+".toString().replace(/\\\\/,'\\\\\\\\').replace(/\\\"/,'\\\\\"')): ("+oriValueExp+")" ;
		tpl.$(node).removeAttr('value').attr('value',value) ;
	}

	next() ;
}
