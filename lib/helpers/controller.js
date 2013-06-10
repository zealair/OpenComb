var ControllerLoader = require('../mvc/ControllerLoader.js') ;

exports.factory = function(app,package,module)
{
    package.helpers || (package.helpers={}) ;

    if(!package.helpers.controller)
    {
        package.helpers.controller = function(define,callback,pathname)
        {
            try{
                define = ControllerLoader.loadDefine(define,pathname) ;
            }
            catch(e)
            {
                callback && callback(e) ;
                return ;
            }
            ControllerLoader.init(define,callback) ;
        }
    }

    return package.helpers.controller ;
}
