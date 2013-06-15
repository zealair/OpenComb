var text = new require("octemplate/lib/shaderfuncs/text.js") ;

module.exports = {

	selector: "input[type=file]"

	, create: function(tpl,former,eleForm,eleWidget){
		var widgetName = tpl.$(eleWidget).attr('name') ;
		former.widgets[widgetName] = {
			name: widgetName
			, datatype: 'file'
		}
	}
}
