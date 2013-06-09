
var Controller = require("../../mvc/Controller.js") ;
var path = require("path") ;

module.exports = function(application)
{
    this.application = application ;
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

    var router = this ;
    Controller.load(controllerPath,function(err,controller){

        function log(){
            helper.log.info(
                res.statusCode
                , req.method
                , req._parsedUrl.pathname
            ) ;
        }
        function main(controller)
        {
            res.setHeader("Content-Type", "text/html") ;
            res.setHeader("Power-by", "OpenComb") ;

            var earth = controller.createEarth(req,res,this.application) ;
            controller.main(earth) ;
        }

        if(err)
        {
            if( typeof err.code!="undefined" && err.code=='MODULE_NOT_FOUND')
            {
                res.statusCode = '404' ;
                var controllerPath = "404" ;
            }
            else
            {
                res.statusCode = '500' ;
                console.log(err.toString()) ;

                // 500 controller ?
                var controllerPath = "500" ;
            }

            controller = Controller.load(controllerPath,function(err,controller){

                if(err)
                {
                    // 什么？连 404 网页也找不到？？
                    res.write("<h1>500</h1>") ;
                    res.statusCode = '500' ;
                    res.end() ;
                }
                else
                {
                    main(controller) ;
                }

                log() ;
            }) ;
        }

        else
        {
            res.statusCode = '200' ;
            main(controller) ;
            log() ;
        }

    }) ;
}

module.exports.prototype.setDefaultController = function(controllerPath)
{
    this._defaultControllerPath = controllerPath ;
}

module.exports.prototype._defaultControllerPath = "hello" ;


