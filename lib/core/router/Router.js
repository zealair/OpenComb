
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

    helper.controller(controllerPath,function(err,controllerClass){

        function log(){
            helper.log.info(
                res.statusCode
                , req.method
                , req._parsedUrl.pathname
            ) ;
        }
        function main(controllerClass)
        {
            res.setHeader("Content-Type", "text/html") ;
            res.setHeader("Power-by", "OpenComb") ;

            var controller = controllerClass.instance(req,res) ;
            controller.seed.fillFromReq() ;
            controller.main() ;
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
                helper.log.error(err) ;
                res.statusCode = '500' ;

                // 500 controller ?
                var controllerPath = "500" ;
            }

            helper.controller(controllerPath,function(err,controllerClass){

                if(err)
                {
                    // 什么？连 404 网页也找不到？？
                    res.write("<h1>500</h1>") ;
                    res.statusCode = '500' ;
                    res.end() ;
                }
                else
                {
                    main(controllerClass) ;
                }

                log() ;
            }) ;
        }

        else
        {
            res.statusCode = '200' ;
            main( controllerClass) ;
            log() ;
        }

    }) ;
}

module.exports.prototype.setDefaultController = function(controllerPath)
{
    this._defaultControllerPath = controllerPath ;
}

module.exports.prototype._defaultControllerPath = "hello" ;


