module.exports = function(rootdir,config){

    if(!module.exports.singleton)
        module.exports.singleton = this ;

    this.rootdir = rootdir||process.cwd() ;

    this.helpers = null ;
    this.connect = null ;
    this.shipper = null ;
    this.router = null ;
    this.templates = null ;
    this.packages = null ;
    this.db = null ;
    this.sessionStore ;
    this._connetBaseMiddlewares = {} ;


    // config ----------------------------------------------
    var tplConfig = require("../../config.tpl.json") ;
    // 递归建立 __proto__ 链
    (function(newobj,protobj){
        newobj.__proto__ = protobj ;
        for(var name in newobj){
            if(typeof newobj[name]=='object' && newobj[name]!=protobj[name])
                arguments.callee(newobj[name],protobj[name]) ;
        }
    }) (config,tplConfig) ;

    // 关闭所有 config.dev 里的设置
    if( !config.dev.enable ) {
        (function(cfgobj,tplCfgobj){

            for(var name in cfgobj) {
                if(typeof cfgobj[name]=='object')
                    arguments.callee(cfgobj[name],tplCfgobj[name]) ;
                else if(typeof tplCfgobj[name]=='boolean')
                    cfgobj[name] = false ;
            }
        }) (config.dev,tplConfig.dev) ;
    }

    this.config = config ;
}
module.exports.singleton = null ;

// ------
var _pt = require("path") ;
var fs = require("fs") ;
var http = require('http');
var url = require('url');
var mongodb = require('mongodb');
var EventEmitter = require('events').EventEmitter ;
var Steps = require("ocsteps") ;
var PackagesManager = require("./packages/PackagesManager.js") ;
var connect = require('connect') ;

if(typeof window!='undefined')
{
    throw new Error(__filename+'can not run under browser.') ;
}




module.exports.prototype = new EventEmitter ;

module.exports.prototype._createBaseModules = function(application){

    // 初始化 templates
    application.templates = require('../mvc/view/ViewTemplateCaches.js').init() ;

    // 初始化 former
    require("../mvc/former").setup(application.templates) ;

    application
        ._createConnect(application)                    // 创建 connect
        ._createShipper(application)                    // 创建 shipper
        ._createRouter(application)                             // 创建路由

    // session
    var SessionStore = require("./SessionStore.js") ;
    this.sessionStore = new SessionStore(this) ;
}


module.exports.prototype._createShipper = function(application)
{
    var ShipperServer = require("./ShipperServer") ;

    this.shipper = new ShipperServer() ;

    var frameworkfolder = _pt.dirname(require.resolve("../../package.json")) ;
    this.shipper.registerAllowFolder( frameworkfolder+"/public/" ) ;
    this.shipper.registerAllowFolder( frameworkfolder+"/lib/core/reset.js" ) ;
    this.shipper.registerAllowFolder( frameworkfolder+"/lib/mvc/Nut.js" ) ;
    this.shipper.registerAllowFolder( frameworkfolder+"/lib/mvc/view" ) ;
    this.shipper.registerAllowFolder( frameworkfolder+"/lib/mvc/MessageQueue.js" ) ;
    this.shipper.registerAllowFolder( frameworkfolder+"/lib/mvc/Validator.js" ) ;
    this.shipper.registerAllowFolder( frameworkfolder+"/lib/util/" ) ;
    this.shipper.registerAllowFolder( _pt.dirname(require.resolve("octemplate/package.json")) ) ;
    this.shipper.registerAllowFolder( _pt.dirname(require.resolve("ocsteps/index.js")) ) ;
    this.shipper.registerAllowFolder( _pt.dirname(require.resolve("stack-trace/package.json"))+"/lib/" ) ;
    return this ;
}

module.exports.prototype._createConnect = function(application){
    application.connect = connect() ;
    return this ;
}
module.exports.prototype._createRouter = function(application){
    application.router = new (require("./router/Router.js")) (application) ;
    return this ;
}

module.exports.prototype._loadPackages = function(application){
    console.log("reading package tree") ;
    this.packages = new PackagesManager ;
    this.packages.root.load( application.rootdir, this.hold(function(err){
        if(err) throw err ;
        console.log("package tree readed") ;
    }) ) ;
}

var helper ;
module.exports.prototype._createHelpers = function(application){
    this.helpers = require("../helpers") ;
    this.helpers.setup(application,this.hold(function(err){
        if(err) throw err ;
        // 设置自己的 helpers
        helper = new (this.helpers.Helper) (module) ;
    })) ;
}


// todo 这个过程应该 packages 包中实现
module.exports.prototype._loadExtensions = function(application){
    pubs = [] ;
    var modulesdir = this.rootdir + "/node_modules/" ;
    var application = this ;


    helper.log.info("root dir:"+this.rootdir) ;

    this.step(

        // 注册 opencomb/public 目录
        function(){
            fs.exists(this.rootdir+"/public",this.hold()) ;
        }
        , function(exists)
        {
            if( exists )
            {
                pubs.push({
                    root: this.rootdir+"/public"
                    , urlroot: "/public"
                }) ;
            }
        }

        // 各个扩展目录
        , function(){
            // 读取 node_modules 目录
            fs.readdir(modulesdir,this.hold()) ;
        }
        , function(err,files){
            err && this.terminate() ;

            if(!files || !files.length)
            {
                return ;
            }

            for(var i=0;i<files.length;i++)
            {

                (function(foldername){

                    var moddir = modulesdir + foldername ;
                    var extscript = moddir + "/extension.js" ;

                    this.step(

                        // 注册 public 目录 -------
                        function(){
                            fs.exists(moddir+"/public",this.hold()) ;
                        }
                        , function(exists){
                            if(exists)
                            {
                                pubs.push({
                                    root: moddir+"/public"
                                    , urlroot: "/"+foldername+'/public'
                                }) ;
                            }
                        }

                        // 注册 controllers 目录 --------
                        , function(){
                            fs.exists(moddir+"/controllers",this.hold()) ;
                        }
                        , function(exists){
                            if(exists)
                            {
                                helper.log.info("public controllers folder: "+moddir+_pt.sep+'controllers'+_pt.sep) ;
                                application.router.regiterPublicController(moddir+_pt.sep+'controllers'+_pt.sep) ;
                            }
                        }

                        // 执行 onload 函数 -------
                        , function(){
                            fs.exists(extscript,this.hold()) ;
                        }
                        , function(exists){
                            if(!exists)
                                return ;

                            helper.log.info("loading extension script: "+extscript) ;
                            var extension = require(extscript) ;

                            this.try() ;
                            // {
			    // 执行 onload 事件
			    if( typeof extension=='function' )
			    {
				this.step([application],extension) ;
			    }
			    else if( typeof extension.onload=='function' )
			    {
				this.step([application],extension.onload) ;
			    }
			    else
			    {
				throw new Error("导出的内容代码无效："+extscript) ;
			    }
			    // }
			    this.catch(function(err){
				var error = new Error("蜂巢在执行扩展"+foldername+"的 extension.js 文件的时候遇到了错误") ;
				error.cause = err ;
				throw error ;
			    }) ;
			}
		    ) ;

		}).bind(this) (files[i]) ;
	    }
	}
    ) ;

}

module.exports.prototype._createFrontendFramework = function(){
    helper.log.info("frontend.notBundle:",this.config.dev.frontend.notBundle) ;
    this.shipper.buildFrontendFramework(!this.config.dev.frontend.notBundle,this.hold(function(err){
        if(err)
        {
            var error = new Error("初始化前端框架时遇到了错误") ;
            error.cause = err ;
            throw error ;
        }
    })) ;
}


module.exports.prototype._createBaseMiddlewares = function(application)application


module.exports.prototype._createHttpPortServer = function(){

    var port = this.config.server? (this.config.server.port || 6060): 6060 ;

    this.httpServer = http.createServer(this.connect) ;
    this.emit('createServer',this,this.httpServer) ;

    this.httpServer.listen(port,this.holdButThrowError(function(err){
	this.emit('listenServer',err,this,this.httpServer) ;
    }));
}

module.exports.prototype.startup = function(callback){
    Steps(

	// 加载 packages
	[this], this._loadPackages

        // 创建Helprs功能对象
        , [this], this._createHelpers

        // 创建基础功能对象
        , [this], this._createBaseModules

        // 为前端框架生成代码
        , [this], this._createFrontendFramework

	// 加载扩展
	, [this], this._loadExtensions

	// 创建基础中间件
	, [this], this._createBaseMiddlewares

	// 创建 http 端口服务器
	, [this], this._createHttpPortServer

	
    ).done(function(err){
	callback && callback(err,this) ;
    }).bind(this) () ;
}

