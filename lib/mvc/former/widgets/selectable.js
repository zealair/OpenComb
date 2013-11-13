var text = new require("octemplate/lib/shaderfuncs/text.js") ;

module.exports = {

    selector: "select"

    , create: function(tpl,former,eleForm,eleWidget){

	var widgetName = tpl.$(eleWidget).attr('name') ;

	former.widgets[widgetName] = {
	    name: widgetName
	    , datatype: tpl.$(eleWidget).attr('multiple')? 'array': 'string'
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
	var isMultiple = tpl.$(node).attr('multiple') ;

	// for options
	tpl.$(node).find("option").each(function(){

	    if( this.attributes.value )
		var oriValueExp = text.joinAsString(this.attributes.value,true) || '""' ;
	    else
		var oriValueExp = '""' ;

	    var modelVarName = node.former.modelVarName() ;
	    var nameExp = text.joinAsString(node.attributes.name,true) ;
	    var propertyExp = modelVarName + "[("+nameExp+")]" ;
	    if(isMultiple)
		var value = "@ ( $model."+modelVarName+" && $helper._.indexOf("+propertyExp+","+oriValueExp+")<0 )? '':'selected' " ; 
	    else
		var value = "@ ( $model."+modelVarName+" && ("+propertyExp+")==("+oriValueExp+") )? 'selected': ''" ;

	    tpl.$(this).removeAttr('selected').attr('selected?',value) ;

	}) ;
    }

    next() ;
}
