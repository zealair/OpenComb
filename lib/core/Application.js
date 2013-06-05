
var _pt = require("path") ;
var fs = require("fs") ;
var http = require('http');
var url = require('url');
var connect = require('connect') ;
var mongodb = require('mongodb');
var Router = require("./router/Router.js") ;
var public = require("./router/middleware/public.js") ;
var SessionStore = require("./SessionStore.js") ;
var DB = require("../helper/DB.js") ;
var EventEmitter = require('events').EventEmitter ;
var DocViewer = require('../mvc/controllers/DocViewer.js') ;
var ViewTemplateCaches = require('../mvc/view/ViewTemplateCaches.js') ;
var IdManager = require("../usr/IdManager.js") ;
var Step = require('step') ;
var Steps = require("ocsteps") ;
var PackagesManager = require("./packages/PackagesManager.js") ;
var log4js = require('log4js') ;

if(typeof window!='undefined')
{
	throw new Error(__filename+'can not run under browser.') ;
}



module.exports = function(rootdir){

	if(!module.exports.singleton)
	{
		module.exports.singleton = this ;
	}

	// parent 构造函数
	EventEmitter.apply(this,arguments) ;

	var application = this ;
	this.rootdir = rootdir||process.cwd() ;

	this.connect = null ;
	this.shipper = null ;
	this.router = null ;
	this.templates = null ;
	this.packages = null ;
	this.db = null ;
	this.config = {} ;
	this.sessionStore = new SessionStore(this) ;
	this._connetBaseMiddlewares = {} ;
    this.helper = {} ;
}

module.exports.prototype.__proto__ = EventEmitter.prototype ;

module.exports.prototype._loadStartupConfig = function(application)
{
    try{
	    application.config = require(application.rootdir+"/config.json") ;
    }catch(e){
        if( e.code=="MODULE_NOT_FOUND" )
        {
            application.config = require(application.rootdir+"/config.tpl.json") ;
        }
        else
        {
            throw e ;
        }
    }
}

module.exports.prototype._createBaseModules = function(application){

	// 初始化 template caches
	application.templates = ViewTemplateCaches.init() ;
	
	application
		._createConnect(application)			// 创建 connect
		._createLogger(application)				// 创建 log4js
		._createRouter(application)				// 创建路由
}

module.exports.prototype._createConnect = function(application){
	application.connect = connect() ;
	return this ;
}
module.exports.prototype._createRouter = function(application){
	application.router = new Router(application) ;
	return this ;
}
module.exports.prototype._createLogger = function(application)
{
    log4js.configure(this.config.logger,{cwd:this.rootdir}) ;
    this.helper.logger = log4js.getLogger('opencomb');
    this.helper.logger.access = log4js.getLogger("opencomb.access") ;
	return this ;
}


module.exports.prototype._loadPackages = function(application){
	application.packages = new PackagesManager ;
	application.packages.root.addInnerPackage( application.rootdir, this.hold(function(err){
		if(err) throw err ;
	}) ) ;
}

module.exports.prototype._loadExtensions = function(application){
	pubs = [] ;
	var modulesdir = this.rootdir + "/node_modules/" ;
	var application = this ;


    this.helper.logger.info("root dir:"+this.c) ;

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

                        this.helper.logger.info("loading extension script: "+extscript) ;
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



module.exports.prototype._createBaseMiddlewares = function(application){
	
	for(var i=0;i<pubs.length;i++)
	{
        this.helper.logger.info("public folder: "+pubs[i].urlroot+" >> "+pubs[i].root) ;
		application.connect.use(public(pubs[i].root,pubs[i].urlroot)) ;
	}

	application._connetBaseMiddlewares = {
		//"shipper": application.shipper.middleware.bind(application.shipper)
		"favicon": connect.favicon()
		, "cookie": connect.cookieParser()
		, "session": connect.session({ secret: 'opencomb application', cookie: { maxAge: 1800000 }, store: application.sessionStore })
		, "IdManager": IdManager.middleware
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
		application.emit('beforeLoadConnectBaseMiddleware',name,application.connect,application) ;
	
		application.connect.use( application._connetBaseMiddlewares[name] ) ;
	
		application.emit('afterLoadConnectBaseMiddleware',name,application.connect,application) ;
	}
}

module.exports.prototype._connectDatabase = function(application){

	if(!this.config.db || !this.config.db.server)
	{
		this.helper.logger.error("missing database configs") ;
		throw new Error("缺少数据库配置") ;
	}
	else
	{
		var server = new mongodb.Server(this.config.db.server, this.config.db.port||27017) ;
		
		(new mongodb.Db("opencomb",server,{w:1})).open(this.hold()) ;
		
		this.step(function(err,client){
		
			if( err )
			{
				throw new Error("无法链接到数据库："+err) ;
			}

			if(client)
			{
				application.emit("openDB",err,client) ;
				application.db = new DB(client) ;
			}
		}) ;
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
		
		// 创建基础功能对象
		, [this], this._createBaseModules

		// 加载 packages
		, [this], this._loadPackages
		
		// 加载扩展
		, [this], this._loadExtensions
		
		// 创建基础中间件
		, [this], this._createBaseMiddlewares

		// 连接数据库
		, [this], this._connectDatabase

		// 创建 http 端口服务器
		, [this], this._createHttpPortServer

		// 为前端框架生成代码
		, function(){
			//this.shipper.buildFrontendFramework(this.config.dev.frontend.bundle,this.hold()) ;
			this.step(function(err){
				if(err)
				{
					var error = new Error("初始化前端框架时遇到了错误") ;
					error.cause = err ;
					throw error ;
				}
			}) ;
		}
		
	).on("done",function(err){
		callback && callback(err,this) ;
	}).bind(this) () ;
}

