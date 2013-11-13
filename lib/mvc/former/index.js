exports.setup = function(tplCaches)
{
    this.widgetClasses = [
	require('./widgets/value.js')
	, require('./widgets/selectable.js')
	, require('./widgets/textarea.js')
	, require('./widgets/file.js')
    ] ;

    tplCaches.generator.parsers.push( TemplateParser ) ;
    tplCaches.renderHelper.former = {
	datatypes: require("./datatypes")
    } ;
}


module.exports.FormMetasPrototype = {

    _first: null

    , formMeta: function(name)
    {
	if(name===undefined)
	{
	    return this[this._first] ;
	}
	else
	{
	    return this[name] ;
	}
    }
}

function TemplateParser(tpl,generator){

    tpl.formMetas = { __proto__: module.exports.FormMetasPrototype } ;

    tpl.$('form').each(function(idx){

	$form = tpl.$(this) ;

	var formname = $form.attr('name') || '' ;
	var formMate = {
	    name: formname
	    , collection: $form.attr('collection') || undefined
	    , keys: ($form.attr('keys')||"_id").split(',')
	    , autoIncreaseId: $form.attr('autoIncreaseId') || undefined
	    , widgets: {}
	    , modelVarName: function() {
		return 'formModel$'+this.name ;
	    }
	} ;
	tpl.formMetas[formname] = formMate ;

	helper.log("former").trace("former for tpl:",tpl.filePath) ;

	// first
	if(idx==0)
	    tpl.formMetas._first = formname ;

	var eleForm = this ;

	for(var i=0;i<exports.widgetClasses.length;i++) {
	    tpl.$(exports.widgetClasses[i].selector).each(function(){
		if(!tpl.$(this).attr('name'))
		    return ;
		exports.widgetClasses[i].create(tpl,formMate,eleForm,this) ;
	    }) ;
	}
    }) ;
}
