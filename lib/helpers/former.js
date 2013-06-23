var Former = require("../mvc/former/Former.js") ;

exports.factory = function(app,package,module)
{
	module._helpers || (module._helpers={}) ;

	if(!module._helpers.former)
	{
		/**
		 *
		 * function(controllerInstance,tplname[[,formName][,options],calllback]) ;
		 */
		module._helpers.former = function(controllerInstance,tplname,formName,options,callback){
			var _arguments = arguments ;
			app.helpers.helperByModule(module).template(tplname,controllerInstance.hold(function(err,tpl){
				if(err || !tpl)
				{
					this.step([err,null],callback) ;;
					return ;
				}

				if(_arguments.length==3)
				{
					callback = _arguments[2] ;
					options = undefined ;
					formName = undefined ;
				}
				else if(_arguments.length==4)
				{
					callback = _arguments[3] ;
					if(typeof _arguments[2]=='string')
					{
						formName = _arguments[2] ;
						options = undefined ;
					}
					else
					{
						options = _arguments[2] ;
						formName = undefined ;
					}
				}

				this.step([err,new Former(controllerInstance,tpl,formName)],callback) ;
			})) ;
		}
	}

	return module._helpers.former ;
}