var ControllerLoader = require('../mvc/ControllerLoader.js') ;
var Application = require("../core/Application.js") ;

exports.factory = function(app,package,module)
{
    module.helpers || (module.helpers={}) ;

    if(!module.helpers.controller)
    {
        module.helpers.controller = function(define,callback)
        {
            try{
                define = ControllerLoader.loadDefine(define) ;
            }
            catch(e)
            {
	            helper.log.controller.trace("controller not found:",define) ;
	            helper.log.error(e) ;
                callback && callback(e) ;
                return ;
            }
            ControllerLoader.init(define,function(err,cls){
                callback.apply(this,arguments) ;
            }) ;
        }


        module.helpers.controller.append = function(parentpath,childpath,childname,callback)
        {
            module.helpers.controller(parentpath,function(err,parent){
                if(err)
                {
                    var error = new Error("执行Controller.append()时，加载控制器出错："+parentpath) ;
                    error.prev = err ;
                    callback && callback(error) ;
                    return ;
                }

                // 加载 MiniUserPad
                module.helpers.controller(childpath,function(err,child){
                    if(err)
                    {
                        var error = new Error("执行Controller.append()时，加载控制器出错："+childpath) ;
                        error.prev = err ;

                        callback && callback(error) ;
                        return ;
                    }

                    parent.children[childname] = child ;

                    callback && callback(null,parent,child,childname) ;
                }) ;
            }) ;
        }
    }

    return module.helpers.controller ;
}
