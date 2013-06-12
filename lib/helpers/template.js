var tplCaches = require('octemplate') ;
var Application = require("../core/Application.js") ;

exports.factory = function(app,package,module)
{
    module.helpers || (module.helpers={}) ;

    if(!module.helpers.template)
    {
        module.helpers.template = function(tplFilename,callback)
        {
            try{
                var tplPath = Application.singleton.packages.resolve(tplFilename,module.filename,'template') ;
            }catch(err){
                callback && callback(err) ;
                return ;
            }

            tplCaches.template(tplPath,function(err,tpl){
                if(tpl)
                    tpl.filename = tplFilename ;

                callback && callback(err,tpl)
            }) ;
        }
    }

    return module.helpers.template ;
}
