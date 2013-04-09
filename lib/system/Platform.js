
var Class = require("occlass/lib/Class.js") ;
var _pt = require("path") ;
var fs = require("fs") ;
var http = require('http');
var url = require('url');
var IdManager = require('ocplatform/lib/usr/IdManager.js');
var connect = require('connect') ;
var mongodb = require('mongodb');
var Router = require("./Router.js") ;
var ShipperServer = require("ocplatform/lib/system/ShipperServer.js") ;
var public = require("./middleware/public.js") ;
var SessionStore = require("./SessionStore.js") ;
var DB = require("ocplatform/lib/DB.js") ;
var EventEmitter = require('events').EventEmitter ;
var MdViewer = require('ocplatform/lib/mvc/controller/MarkdownViewer.js') ;


if(typeof window!='undefined')
{
	throw new Error(__filename+'can not run under browser.') ;
}



module.exports = function(){

	if(!module.exports.singleton)
	{
		module.exports.singleton = this ;
		global.$opencomb = this ;
	}

	// parent 构造函数
	EventEmitter.apply(this,arguments) ;

	var platform = this ;
	this.rootdir = process.cwd() ;

	this.connect = null ;
	this.shipper = null ;
	this.router = null ;
	this.db = null ;
	this.config = {} ;
	this.sessionStore = new SessionStore(this) ;
	this._connetBaseMiddlewares = {} ;
}

module.exports.prototype.__proto__ = EventEmitter.prototype ;

module.exports.prototype._loadStartupConfig = function(err,callback)
{
	this.config = require(this.rootdir+"/config.json") ;

	// 关闭所有 dev 选项
	if( !this.config.enableDev && typeof this.config.dev=='object')
	{
		(function disableOption(configs)
		{
			for(var name in configs)
			{
				var type = typeof configs[name] ;
				if( type=='object' )
				{
					disableOption(configs[name]) ;
				}
				else if(type!='function')
				{
					configs[name] = false ;
				}
			}
		}) (this.config.dev) ;
	}

	console.log("config: ",this.config) ;

	callback && callback(null) ;
}

module.exports.prototype._createBaseModules = function(err,callback){

	if(err)
	{
		throw err ;
	}

	this
		._createConnect()				// 创建 connect
		._createShipper()				// 创建 shipper
		._createRouter()				// 创建路由

	for(var i=0;i<pubs.length;i++)
	{
		this.connect.use(public(pubs[i].root,pubs[i].urlroot)) ;
	}

	this._connetBaseMiddlewares = {
		"shipper": this.shipper.middleware.bind(this.shipper)
		, "favicon": connect.favicon()
		, "cookie": connect.cookieParser()
		, "session": connect.session({ secret: 'opencomb platform', cookie: { maxAge: 1800000 }, store: this.sessionStore })
		, "idmgr": IdManager.middleware
		, "body": connect.bodyParser()
		, "doc": MdViewer.middleware
		, "router": this.router.route.bind(this.router)
		, "notfound": function(req,rspn){
			rspn.write("<h1>404</h1>") ;
			rspn.end() ;
		}
	}
	for(var name in this._connetBaseMiddlewares)
	{
		this._loadConnectBaseMiddleware(name) ;
	}

	callback && callback(null) ;
}

module.exports.prototype._loadConnectBaseMiddleware = function(name){
	this.connect.use( this._connetBaseMiddlewares[name] ) ;
}

module.exports.prototype._createRouter = function(){
	this.router = new Router(this) ;
}
module.exports.prototype._createShipper = function()
{
	this.shipper = new ShipperServer() ;

	var platformfolder = _pt.dirname(require.resolve("ocplatform/package.json")) ;
	this.shipper.registerAllowFolder( platformfolder+"/public/" ) ;
	this.shipper.registerAllowFolder( platformfolder+"/lib/mvc/controller/Nut.js" ) ;
	this.shipper.registerAllowFolder( platformfolder+"/lib/mvc/view" ) ;
	this.shipper.registerAllowFolder( platformfolder+"/lib/mvc/MessageQueue.js" ) ;
	this.shipper.registerAllowFolder( platformfolder+"/lib/util/" ) ;
	this.shipper.registerAllowFolder( _pt.dirname(require.resolve("occlass/package.json"))+"/lib/" ) ;
	this.shipper.registerAllowFolder( _pt.dirname(require.resolve("ochtmlparser/package.json"))+"/lib/" ) ;
	this.shipper.registerAllowFolder( _pt.dirname(require.resolve("octemplate/package.json"))+"/lib/" ) ;
	this.shipper.registerAllowFolder( _pt.dirname(require.resolve("stack-trace/package.json"))+"/lib/" ) ;
	this.shipper.registerAllowFolder( _pt.dirname(require.resolve("step/package.json"))+"/lib/" ) ;
	return this ;
}

module.exports.prototype._createConnect = function(pubs){
	this.connect = connect() ;
	return this ;
}

module.exports.prototype._loadExtensions = function(err,callback){
	pubs = [] ;
	var modulesdir = process.cwd() + "/node_modules/" ;
	var platform = this ;
	fs.readdir(modulesdir,function(err,files){
		if(err)
		{
			throw err ;
		}

		for(var i=0;i<files.length;i++)
		{
			var moddir = modulesdir + files[i] ;

			try{
				var extension = require( moddir + "/extension.js" ) ;

				// 执行 onload 事件
				if( typeof extension=='function' )
				{
					extension(platform) ;
				}
				else if( typeof extension.onload=='function' )
				{
					extension.onload(platform) ;
				}

			}catch(e){}

			if( fs.existsSync(moddir+"/public") )
			{
				console.log("public folder: "+moddir+"/public") ;
				pubs.push({
					root: moddir+"/public"
					, urlroot: "/"+files[i]+'/public'
				}) ;
			}
		}

		callback(err,pubs) ;
	})
}

module.exports.prototype._connectDatabase = function(err,callback){

	var platform = this ;

	if(!this.config.db || !this.config.db.server)
	{
		console.log("missing database configs") ;
		return ;
	}
	else
	{
		(new mongodb.Db("opencomb",mongodb.Server(this.config.db.server, this.config.db.port||27017, {}),{w:1}))
			.open(function(err,client){

				platform.emit("openDB",err,client) ;

				platform.db = new DB(client) ;
				callback(err,this) ;
			}) ;
	}
}

module.exports.prototype._createHttpPortServer = function(err,callback){
	var platform = this ;
	var port = this.config.server? (this.config.server.port || 6060): 6060 ;

	http.createServer(this.connect).listen(port,function(err){
		callback(err,platform) ;
	});
}

module.exports.prototype.startup = function(callback){
	var onestep, steps = [

		// 载入启动配置
		this._loadStartupConfig.bind(this)

		// 加载扩展
		, this._loadExtensions.bind(this)

		// 创建基础功能对象
		, this._createBaseModules.bind(this)

		// 连接数据库
		, this._connectDatabase.bind(this)

		// 创建 http 端口服务器
		, this._createHttpPortServer.bind(this)

		// 为前端框架生成代码
		, (function(err,callback){
			if(err)
			{
				throw err ;
			}
			this.shipper.buildFrontendFramework(callback) ;
		}).bind(this)

	] ;
	(function step(err)
	{
		if(err)
		{
			throw err ;
		}
		if( !(onestep=steps.shift()) )
		{
			// 完成
			callback(null,this) ;
		}
		else
		{
			onestep( err, arguments.callee )
		}
	}) () ;
}

