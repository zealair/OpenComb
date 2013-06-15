exports.setup = function(tplCaches)
{
	this.widgetClasses = [
		require('./widgets/value.js')
		, require('./widgets/textarea.js')
		, require('./widgets/file.js')
	] ;

	tplCaches.generator.parsers.push( TemplateParser ) ;
	tplCaches.renderHelper.former = {
		datatypes: require("./datatypes")
	} ;
}


module.exports.FormersPrototype = {

	_first: null

	, former: function(name)
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


var Former = require("./Former.js") ;

function TemplateParser(tpl,generator){

	tpl.formers = { __proto__: module.exports.FormersPrototype } ;

	tpl.$('form').each(function(idx){

		$form = tpl.$(this) ;

		var formname = $form.attr('name') || '' ;
		var collection = $form.attr('collection') || undefined;
		var keys = ($form.attr('keys')||"_id").split(',') ;

		var former = new Former(formname,collection,keys) ;
		tpl.formers[formname] = former ;

		helper.log("former").trace("former for tpl:",tpl.filePath) ;

		// first
		if(idx==0)
		{
			tpl.formers._first = formname ;
		}

		var eleForm = this ;

		for(var i=0;i<exports.widgetClasses.length;i++)
		{
			tpl.$(exports.widgetClasses[i].selector).each(function(){

				if(!tpl.$(this).attr('name'))
					return ;

				exports.widgetClasses[i].create(tpl,former,eleForm,this) ;
			}) ;
		}
	}) ;
}