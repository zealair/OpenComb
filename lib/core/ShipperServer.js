var fs = require("fs") ;
var _pt = require("path") ;
var Steps = require("ocsteps") ;
var querystring = require("querystring") ;
var utilarr = require("ocframework/lib/util/array.js") ;
var View = require("ocframework/lib/mvc/view/View.js") ;
var tplCaches = require("octemplate") ;
var Application = require("ocframework/lib/core/Application.js") ;

module.exports = function(){
    this._arrAllowPatterns = [] ;
    this._arrAllowFolders = [] ;
    this._moduleCaches = new Caches() ;
    this._frontendFrameworkCode = null ;

    this._ocFrameworkFrontendRequires = [
        "ocframework/public/lib/oc/patchs.js"
        , "octemplate/lib/TemplateCaches.js"
        , "ocframework/lib/mvc/view/ViewTemplateCaches.js"
        , "ocframework/public/lib/oc/mvc/View.js"
        , "ocframework/public/lib/oc/mvc/ViewTemplate.js"
        , "ocframework/public/lib/oc/mvc/Director.js"
        , "ocframework/public/lib/oc/mvc/Switcher.js"
        , "ocframework/lib/mvc/Validator.js"
    ] ;
}

module.exports.prototype.addFrontEntranceFile = function(path)
{
    shipper._ocFrameworkFrontendRequires.push(path) ;
}

module.exports.prototype.middleware = function(req,rspn,next){

    // ------------------------------------------------------------
    // 下载前端框架
    if(req._parsedUrl.pathname=='/opencomb/frontend')
    {
        if( req.headers["if-modified-since"] && new Date(req.headers["if-modified-since"])>=this._frontendFrameworkTime )
        {
            rspn.statusCode = "304" ;
            rspn.end() ;
        }
        else
        {
            rspn.statusCode = "200" ;
            rspn.setHeader("Content-Type","application/javascript") ;
            rspn.setHeader("Last-Modified",this._frontendFrameworkTime.toUTCString())
            rspn.write(this._frontendFrameworkCode) ;
            rspn.end() ;
        }

        return ;
    }

    var res = /^\/shipdown(:([^\/]+))?(\/+(.*))?$/.exec(req._parsedUrl.pathname) ;
    if(!res)
    {
        next() ;
        return ;
    }
    var type = res[2] ;
    var path = res[4] ;

    if(!path)
    {
        rspn.statusCode = err.code || "404" ;
        rspn.write( 'what your want ? There is no path of your request.' ) ;
        rspn.end() ;
    }

    var shipper = this ;

    var type = type || 'module' ;

    // ------------------------------------------------------------
    // frontend view script
    if( type=="viewscript" )
    {
        rspn.setHeader("Content-Type","application/javascript") ;
        var query = querystring.parse(req._parsedUrl.query) ;

        var callwrapper = query.wrapper||"$.shipper.downloaded($err,'viewscript',$path,$deps,$define)";

        helper.controller(path,function(err,controller){
            if(err)
            {
                rspn.statusCode = "404" ;
                rspn.write( "the controller you request has not found.\r\n" ) ;
                rspn.write( err.toString() ) ;
            }
            else
            {
                if( !controller.viewScriptCache )
                {
                    var source = '' ;
                    if( controller.viewIn || controller.viewOut )
                    {
                        var props = ['viewIn','viewOut'] ;
                        for(var i=0;i<props.length;i++)
                        {
                            if( controller[props[i]] )
                            {
                                source+= "\r\nmodule.exports."+props[i]+" = function(){\r\n" ;
                                source+= "	if(!this.$){\r\n" ;
                                source+= "		this.$ = jQuery.sandbox(this) ;\r\n" ;
                                source+= "	}\r\n" ;
                                source+= "	var $ = this.$ ;\r\n" ;
                                source+= "	("+controller[props[i]].toString() + "\r\n";
                                source+= "	).apply(this,arguments)\r\n" ;
                                source+= "} \r\n" ;
                            }
                        }
                    }

                    controller.viewScriptCache = shipper.compileJavascript(source,path) ;
                }

                rspn.write( shipper.wrappe(
                    callwrapper
                    , path
                    , controller.viewScriptCache[0]
                    , controller.viewScriptCache[1]
                    , err
                )
                ) ;
            }
            rspn.end() ;
        }) ;
    }

    // ------------------------------------------------------------
    // ship down nodejs module to browser
    else if( type=='module' )
    {
        rspn.setHeader("Content-Type","application/javascript") ;
        var query = querystring.parse(req._parsedUrl.query) ;

        var callwrapper = query.wrapper||"$.shipper.downloaded($err,'module',$path,$deps,$define)";

        this._moduleCaches.load( path, function(err,cache){

            if(err)
            {
                rspn.statusCode = err.code || "404" ;
                rspn.write( "not found" ) ;
            }
            else if( !shipper.checkShippable(cache.path) )
            {
                rspn.statusCode = "403" ;
                rspn.write( "Forbidden access, this script only run on server side." ) ;
            }
            else
            {
                if( !cache.compiled )
                {
                    var rt = shipper.compileJavascript(cache.source,path) ;
                    cache.deps = rt[0] ;
                    cache.compiled = rt[1] ;
                }
                rspn.write( shipper.wrappe(callwrapper,path,cache.deps,cache.compiled,err) ) ;
            }
            rspn.end() ;
        } ) ;
    }

    // ------------------------------------------------------------
    // ship down html template to browser
    else if( type=='tpl' )
    {
        rspn.setHeader("Content-Type","application/javascript") ;

        tplCaches.template(path,function(err,tpl){
            if(err)
            {
                rspn.statusCode = "404" ;
                rspn.write( shipper.wrappe("$.tplCaches.downloaded($err,$path,$define)",path,null,null,err.toString()) ) ;
                rspn.end() ;
            }
            else
            {
                if( !tpl.renderer )
                {
                    try{
                        tpl.compile(null) ;
                    }catch(err){
                        rspn.statusCode = "500" ;
                        rspn.write( shipper.wrappe("$.tplCaches.downloaded($err,$path,$define)",path,null,null,err.toString()) ) ;
                        rspn.end() ;
                        return ;
                    }
                }

                rspn.statusCode = "200" ;
                rspn.write( shipper.wrappe("$.tplCaches.downloaded(null,$path,$define)",path,[],tpl.exportRenderer()) ) ;
                rspn.end() ;
            }
        }) ;
    }
    else
    {
        rspn.statusCode = "404" ;
        rspn.write( 'i dont know, what is '+type + '? if your writing error?' ) ;
        rspn.end() ;

    }
}

module.exports.prototype.buildFrontendFramework = function(bundle,callback)
{
    var lasterr = null ;
    var shipper = this ;
    this._frontendFrameworkCode = '' ;

    Steps(

        function (){
            fs.readFile( require.resolve("ocframework/public/lib/oc/ShipperClient.js"), this.hold('errShipperClient','buffShipperClient') ) ;
            fs.readFile( require.resolve("ocframework/public/lib/oc/entrance.js"), this.hold() ) ;
        }

        , function (err,buff){
            if(err||this.recv.errShipperClient)
            {
                throw new (err||this.recv.errShipperClient) ;
            }

            shipper._frontendFrameworkCode+= buff.toString() + "\r\n\r\n\r\n" ;
            shipper._frontendFrameworkCode+= this.recv.buffShipperClient.toString() + "\r\n\r\n\r\n" ;
        }

        , function parseRequireDeps(){

            if( !bundle )
            {
                return ;
            }

            var modules = [] ;
            var waitingloads = [] ;
            for(var i=0;i<shipper._ocFrameworkFrontendRequires.length;i++)
            {
                waitingloads.push(shipper._ocFrameworkFrontendRequires[i]) ;
            }

            this.loop(function(err,modulecache){

                if( !waitingloads.length )
                {
                    this.break() ;
                }

                //console.log("bundle ",waitingloads[0]," ...") ;
                shipper._moduleCaches.load( waitingloads[0], this.hold()) ;

                this.step(function(err,modulecache){

                    var path = waitingloads.shift() ;
                    modules[path] = modulecache ;

                    // 编译他们
                    if( !modulecache.compiled )
                    {
                        var rt = shipper.compileJavascript(modulecache.source,path) ;
                        modulecache.deps = rt[0] ;
                        modulecache.compiled = rt[1] ;
                    }

                    // 写入输出文件
                    shipper._frontendFrameworkCode+= "/*-- "+path+" --*/\r\n" ;
                    shipper._frontendFrameworkCode+= shipper.wrappe(
                        "$.shipper.downloaded($err,'module',$path,$deps,$define)"
                        , path
                        , modulecache.deps
                        , modulecache.compiled
                        , err
                    ) ;
                    shipper._frontendFrameworkCode+= "\r\n\r\n\r\n" ;

                    // 得到 deps
                    for(var i=0;i<modulecache.deps.length;i++)
                    {
                        var deppath = modulecache.deps[i] ;
                        if( !modules[deppath] )
                        {
                            waitingloads.push(deppath) ;
                        }
                    }

                    if(err)
                    {
                        throw err ;
                    }
                }) ;
            }) ;

        }

        , function geneRequireModules()
        {
            shipper._frontendFrameworkCode+= "/*---*/window.__ocFrameworkFrontendRequires = "
                + JSON.stringify(shipper._ocFrameworkFrontendRequires)
                + ";\r\n\r\n\r\n" ;
            shipper._frontendFrameworkTime = new Date ;
            shipper._frontendFrameworkTime.setMilliseconds(0) ;
        }
    )
    .done(callback) () ;
}

module.exports.prototype.wrappe = function(callwrapper,path,deps,define,err)
{
    if(err)
    {
        var outerr = '"'+addslashes(err||"")+'"' ;
        var outdeps = 'null' ;
        var outdefine = 'null' ;
    }
    else
    {

        var outerr = 'null' ;
        var outdeps = JSON.stringify(deps||[]) ;
        var outdefine = define ;
    }

    var output = callwrapper.replace("$err",outerr) ;
    output = output.replace("$path",'"'+path+'"') ;
    output = output.replace("$deps",outdeps) ;

    // 直接使用 replace 函数，会受到 $&, $1-99 等形式字符串的干扰
    var pos = output.indexOf('$define') ;
    if(pos>=0)
    {
        output = output.substr(0,pos) + outdefine + output.substr(pos+7) ;
    }

    return output ;
}

module.exports.prototype.compileJavascript = function(source,path)
{
    var compiled = "" ;
    var deps = [] ;

    var regexp = /(^|[^\.])require\s*\((.*?)\)/mg ;
    var res ;
    var lastIndex = 0 ;
    while( res=regexp.exec(source) )
    {
        var res2 = res[2].match(/^\s*["']([^"']*?)["']\s*$/) ;

        // require 中使用变量
        if(!res2)
        {
            continue ;
        }

        // 检查模块是否有效
        if(res2[1][0]!=".")
        {
            try{
                var deppath = require.resolve(res2[1]) ;
                if(!deppath || deppath[0]!="/")
                {
                    continue ;
                }
            } catch(e) {
                // 无法确定模块路径
                continue ;
            }
        }

        var tidypath = makePath(res2[1],path) ;
        compiled+= source.substring(lastIndex,res.index) + res[1]+"require(\"" + tidypath + "\")" ;
        lastIndex = regexp.lastIndex ;

        if( utilarr.search(deps,tidypath)===false )
        {
            deps.push(tidypath) ;
        }
    }

    compiled+= source.substring(lastIndex,source.length) ;
    return [deps,"function(require,module,exports,__dirname,__filename){\r\n\r\n" + compiled + "\r\n\r\n}"];
}

var makePath = function(path,from){

    if(path[0]==".")
    {
        return _pt.normalize(_pt.dirname(from)+"/"+path) ;
    }
    else
    {
        return _pt.normalize(path) ;
    }
}

module.exports.prototype.registerAllowFolder = function(dirpath)
{
    this._arrAllowFolders.push(dirpath) ;
}

module.exports.prototype.registerAllowFilter = function(regexp)
{
    this._arrAllowPatterns.push(regexp) ;
}

module.exports.prototype.checkShippable = function(fullpath)
{
    for(var i=0;i<this._arrAllowFolders.length;i++)
    {
        if( fullpath.substr(0,this._arrAllowFolders[i].length) == this._arrAllowFolders[i] )
        {
            return true ;
        }
    }

    for(var i=0;i<this._arrAllowPatterns.length;i++)
    {
        if( this._arrAllowPatterns[i].constructor===RegExp && this._arrAllowPatterns[i].test(fullpath) )
        {
            return true ;
        }
        else if (typeof this._arrAllowPatterns[i]=="function" && this._arrAllowPatterns[i](fullpath))
        {
            return true ;
        }
    }

    return false ;
}

function Caches()
{
    this._moduleCaches = {} ;
}

Caches.prototype.load = function(path,callback)
{
    var path = require.resolve(path) ;

    if( typeof this._moduleCaches[path]=="undefined" )
    {
        this._moduleCaches[path] = {
            path: path
            , err: null
            , source: ""
            , loading: false
            , loaded: false
            , callbacks: []
        } ;
    }

    if( this._moduleCaches[path].loaded )
    {
        callback( this._moduleCaches[path].err, this._moduleCaches[path] ) ;
        return ;
    }

    this._moduleCaches[path].callbacks.push(callback) ;

    if( !this._moduleCaches[path].loading )
    {
        this._moduleCaches[path].loading = true ;
        var caches = this ;

        fs.readFile(path,function(err,buff){

            caches._moduleCaches[path].loading = false ;
            caches._moduleCaches[path].loaded = true ;

            caches._moduleCaches[path].err = err ;
            caches._moduleCaches[path].source = buff.toString() ;

            while(callback=caches._moduleCaches[path].callbacks.shift())
            {
                callback( caches._moduleCaches[path].err, caches._moduleCaches[path] ) ;
            }

            //
            if( Application.singleton.config.dev.watching.shipdown )
            {
                fs.unwatchFile(path) ;
                fs.watchFile(path,function(){
                    console.log( (new Date).toISOString()+' Shipdown script has changed(auto reload): '+path ) ;
                    delete caches._moduleCaches[path] ;
                }) ;
            }
        }) ;
    }
}


function addslashes(string)
{
    return string
        .replace(/[\\"']/g, '\\$&')
        .replace(/\u0000/g, '\\0') ;
}