var ControllerLoader = require("../../mvc/ControllerLoader.js") ;
var path = require("path") ;

module.exports = function(application)
{
    this.application = application ;

    this._defaultControllerPath = "hello" ;
    this._publicControllerPaths = [] ;
}


function log(res,req){
    helper.log("access").info(
        res.statusCode
        , req.method
        , req._parsedUrl.pathname
    ) ;
}
function doControllerMain(controllerClass,req,res,next) {
    res.setHeader("Content-Type", "text/html") ;
    res.setHeader("Power-by", "OpenComb") ;

    var controller = controllerClass.instance(req,res) ;
    controller.seed.fillFromReq() ;
    controller.main() ;

    log(res,req) ;
}

function response404(req,res,next,code,msg){

    res.statusCode = code || '404' ;

    helper.controller('404',function(err,controllerClass){

        if(err)
        {
            // 什么？连 404 网页也找不到？？
            res.write("<h1>500</h1>") ;
            res.statusCode = '500' ;
            res.write("I want show you a 404 page, but I can't found 404 page too.") ;
            res.end() ;
        }
        else
        {
            res.setHeader("Content-Type", "text/html") ;
            res.setHeader("Power-by", "OpenComb") ;

            var controller = controllerClass.instance(req,res) ;
            controller.seed.fillFromReq() ;
            controller.seed.message = msg ;
            controller.seed.code = res.statusCode ;
            controller.main() ;
        }

        log(res,req) ;
    }) ;
}

module.exports.prototype.route = function(req,res,next)
{
    var extname = path.extname(req._parsedUrl.pathname) ;
    if( extname && extname.toLowerCase()!='.js' )
    {
        next() ;
        return ;
    }

    var controllerPath = req._parsedUrl.pathname.substr(1,req._parsedUrl.pathname.length-1) || this._defaultControllerPath ;
    if(!controllerPath)
    {
        next() ;
        return ;
    }

    try{
        var ctrlpath = new ControllerLoader.ControllerPath(controllerPath) ;
    }catch(err){
        response404(req,res,next,'404') ;
        return ;
    }

    if( !this.isPublicController(ctrlpath.fullpath) )
    {
        response404(req,res,next,'403','Path you request is not a public controller: '+req._parsedUrl.pathname) ;
        return ;
    }

    try{
        var define = ctrlpath.loadDefine() ;
    }catch(err){
        // helper.log("controller").error(err) ;
        response404(req,res,next,'404') ;
        return ;
    }

    ControllerLoader.init(define,function(err,controllerClass){
        if(err)
            response404(req,res,next,'500') ;
        else
            doControllerMain(controllerClass,req,res,next) ;
    }) ;

}

module.exports.prototype.setDefaultController = function(controllerPath)
{
    this._defaultControllerPath = controllerPath ;
}

module.exports.prototype.regiterPublicController = function(pathPrefix){
    this._publicControllerPaths.push(pathPrefix) ;
}

module.exports.prototype.isPublicController = function(path){
    for(var i=0;i<this._publicControllerPaths.length;i++)
	if( path.substr(0,this._publicControllerPaths[i].length)==this._publicControllerPaths[i] )
	    return true ;
    return false ;
}


