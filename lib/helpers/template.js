var tplCaches = require('octemplate') ;
var Application = require("../core/Application.js") ;

exports.factory = function(app,package,module)
{
    module._helpers || (module._helpers={}) ;

    if(!module._helpers.template)
    {
        module._helpers.template = function(tplFilename,callback)
        {
            try{
                var tplPath = Application.singleton.packages.resolve(tplFilename,module.filename,'template') ;
            }catch(err){
                callback && callback(err) ;
                return ;
            }

            var tpl = tplCaches.template(tplPath,callback) ;
	        tpl.pathname = tplFilename ;
	        return tpl ;
        }
    }

    return module._helpers.template ;
}
