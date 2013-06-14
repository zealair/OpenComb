
exports.former ;

exports.onregister = function(app,callback)
{
	exports.former = require("../mvc/former") ;
	exports.former.setup(app.templates) ;

	callback && callback() ;
}

exports.factory = function(app,package,module)
{
	module._helpers || (module._helpers={}) ;

	if(!module._helpers.former)
	{
		module._helpers.former = function(tplname,formname){
			if(tplname)
			{
				module._helpers.template(tplname) ;
			}
			else
			{
				module._helpers.template(tplname)
			}
		}
	}

	return module._helpers.former ;
}