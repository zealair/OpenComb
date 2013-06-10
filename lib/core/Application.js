module.exports = function(rootdir,config){

    if(!module.exports.singleton)
    {
        module.exports.singleton = this ;
    }

    this.rootdir = rootdir||process.cwd() ;

    this.connect = null ;
    this.shipper = null ;
    this.router = null ;
    this.templates = null ;
    this.packages = null ;
    this.db = null ;
    this.config = config ;
    this.sessionStore ;
    this._connetBaseMiddlewares = {} ;
}
module.exports.singleton = null ;

// ------

var _pt = require("path") ;
var fs = require("fs") ;
var http = require('http');
var url = require('url');
var mongodb = require('mongodb');
var EventEmitter = require('events').EventEmitter ;
var ViewTemplateCaches = require('../mvc/view/ViewTemplateCaches.js') ;
var Steps = require("ocsteps") ;
var PackagesManager = require("./packages/PackagesManager.js") ;
var browserify = require('browserify') ;
var connect = require('connect') ;

if(typeof window!='undefined')
{
	throw new Error(__filename+'can not run under browser.') ;
}




module.exports.prototype = new EventEmitter ;

module.exports.prototype._loadStartupConfig = function(application)
{}

module.exports.prototype._createBaseModules = function(application){

	// 初始化 template caches
	application.templates = ViewTemplateCaches.init() ;
	
	application
		._createConnect(application)			// 创建 connect
        ._createShipper(application)			// 创建 shipper
		._createRouter(application)				// 创建路由

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
    this.shipper.registerAllowFolder( frameworkfolder+"/lib/mvc/Nut.js" ) ;
    this.shipper.registerAllowFolder( frameworkfolder+"/lib/mvc/view" ) ;
    this.shipper.registerAllowFolder( frameworkfolder+"/lib/mvc/MessageQueue.js" ) ;
    this.shipper.registerAllowFolder( frameworkfolder+"/lib/mvc/Validator.js" ) ;
    this.shipper.registerAllowFolder( frameworkfolder+"/lib/util/" ) ;
    this.shipper.registerAllowFolder( _pt.dirname(require.resolve("octemplate/package.json")) ) ;
    this.shipper.registerAllowFolder( _pt.dirname(require.resolve("step/package.json"))+"/lib/" ) ;
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
	this.packages = new PackagesManager ;
	this.packages.root.load( application.rootdir, this.hold(function(err){
		if(err) throw err ;
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
				var moddir = modulesdir + files[i] ;
				var extscript = moddir + "/extension.js" ;

				this.step(

					// 注册 public 目录 -------
					[moddir], function(moddir){
						fs.exists(moddir+"/public",this.hold('exists')) ;
					}
					, [moddir,files[i]], function(moddir,foldername){
						if(this.recv.exists)
						{
							pubs.push({
								root: moddir+"/public"
								, urlroot: "/"+foldername+'/public'
							}) ;
						}
					}

					// 执行 onload 函数 -------
					, [extscript], function(extscript){
						fs.exists(extscript,this.hold('exists')) ;
					}
					, [extscript,files[i]], function(extscript,extname){
						if(!this.recv.exists)
						{
							return ;
						}

                        helper.log.info("loading extension script: "+extscript) ;
						var extension = require(extscript) ;

						this.try() ;
						
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
						
						this.catch(function(err){
							var error = new Error("蜂巢在执行扩展"+extname+"的 extension.js 文件的时候遇到了错误") ;
							error.cause = err ;
							throw error ;
						}) ;
					}
				) ;
			}
		}
	) ;

}

module.exports.prototype._createFrontendFramework = function(){
    helper.log.info("frontend.bundle:",this.config.dev.frontend.bundle) ;
    this.shipper.buildFrontendFramework(this.config.dev.frontend.bundle,this.hold(function(err){
        if(err)
        {
            var error = new Error("初始化前端框架时遇到了错误") ;
            error.cause = err ;
            throw error ;
        }
    })) ;
}


module.exports.prototype._createBaseMiddlewares = function(application){

    var public = require("./router/middleware/public.js") ;
    var DocViewer = require('../mvc/controllers/DocViewer.js') ;

	for(var i=0;i<pubs.length;i++)
	{
        helper.log.info("public folder: "+pubs[i].urlroot+" >> "+pubs[i].root) ;
		application.connect.use(public(pubs[i].root,pubs[i].urlroot)) ;
	}

	application._connetBaseMiddlewares = {
        "shipper": application.shipper.middleware.bind(application.shipper)
		, "favicon": connect.favicon()
		, "cookie": connect.cookieParser()
		, "session": connect.session({ secret: 'opencomb application', cookie: { maxAge: 1800000 }, store: application.sessionStore })
		, "body": connect.bodyParser()
		, "doc": DocViewer.middleware
		, "router": application.router.route.bind(application.router)
		, "notfound": function(req,rspn){
			rspn.statusCode = "404" ;
			rspn.write("<h1>404</h1>") ;
			rspn.end() ;
		}
	}
	for(var name in application._connetBaseMiddlewares)
	{
		application.emit('use-connect-middleware.before',name,application.connect,application) ;
	
		application.connect.use( application._connetBaseMiddlewares[name] ) ;
	
		application.emit('use-connect-middleware.after',name,application.connect,application) ;
	}
}


module.exports.prototype._createHttpPortServer = function(){
	var port = this.config.server? (this.config.server.port || 6060): 6060 ;
	http.createServer(this.connect).listen(port,this.hold());
}

module.exports.prototype.startup = function(callback){
	Steps(
	
		// 载入启动配置
		[this], this._loadStartupConfig

		// 加载 packages
		, [this], this._loadPackages

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

