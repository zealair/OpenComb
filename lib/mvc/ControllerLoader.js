var utilarr = require("../util/array.js") ;
var Controller = require("./Controller.js") ;
var fs = require("fs") ;
var path = require("path") ;
var module = require("module") ;
var Application = require("../core/Application.js") ;
var helpers = require("../helpers") ;

// for TDD
if(typeof helper=='undefined')
	helper = {
		log: function(){ return this ;}
		, trace: function(){ return this ;}
	}


exports.ControllerPath = function(path,from){
	this.inputpath = path ;
	this.from = from ;
	this.xpath = path.split(":") ;
	try{
		this.fullpath = exports.ControllerPath.resolve( this.xpath.shift(), from ) ;
	}catch(err){
		this.notfound(err) ;
	}
}

exports.ControllerPath.prototype.loadDefine = function(){

	try{
		var define = require(this.fullpath) ;
	}catch(err){
		this.notfound(err) ;
	}

	// 加载自己
	define.fullpath || (define.fullpath=this.fullpath) ;

	// 递归 children & actions
	define = exports.loadDefineRecurse(define) ;

	// get action/child by xpath
	try{
		define=define.childByXPath(this.xpath) ;
	}catch(err){
		this.notfound(err) ;
	}
	define.xpath || (define.xpath=this.xpath) ;

	return define ;
}

exports.ControllerPath.prototype.notfound = function(cause){
	var err = new Error("controllers not found: "+this.inputpath) ;
	err.code = 'MODULE_NOT_FOUND' ;
	if(cause)
		err.cause = cause ;
	throw err ;
}

exports.ControllerPath.resolve = function (path,from) {
	if( path in Controller._controllerAlias )
	{
		path = Controller._controllerAlias[path] ;
	}

	return this.packages().resolve(path,from,'controller') ;
}

exports.ControllerPath.packages = function(){
	if(!this._packages)
	{
		this._packages = Application.singleton.packages ;
	}
	return this._packages ;
}

// for TDD
exports.ControllerPath.setPackages = function(packages){
	this._packages = packages ;
}

// ------------------------------------------------------

exports.loadDefine = function(define,fullname){
	if(typeof define=='string')
		return (new exports.ControllerPath(define)).loadDefine() ;
	else
	{
		define.fullpath || (define.fullpath=fullname) ;
		return exports.loadDefineRecurse(define) ;
	}
}

exports.loadDefineRecurse = function(define){

	if(define.__built)
	{
		helper.log("controller").trace("controller cache hit.") ;
		return define ;
	}

	define.__built = true ;

	if(typeof define=='function')
	{
		// 随后的 __proto__ 设置会导致丢失 apply 等函数
		define.apply = define.apply ;
		define.bind = define.bind ;
		define.call = define.call ;
	}
	define.__proto__ = Controller.Prototype ;
	define.ctor() ;

	// 定义本身是一个函数
	if( typeof define=='function' )
	{
		define.process = define ;
	}

	function loadMemberController(mbrDefine,container,name)
	{
		var innerDefine = typeof mbrDefine!='string' ;


		try{
			var mbrDefine = exports.loadDefine( mbrDefine, innerDefine? define.fullpath: undefined ) ;

			// 继承 layout, view
			var inhert = typeof(mbrDefine)!='string' && name!='layout' ;
			if(inhert)
			{
				if( mbrDefine.layout===undefined && mbrDefine.layout!==define.layout)
				{
					mbrDefine.layout = define.layout ;
				}
				if(mbrDefine.view===undefined)
				{
					mbrDefine.view = define.view ;
				}
				if(mbrDefine.viewIn===undefined)
				{
					mbrDefine.viewIn = define.viewIn ;
				}
				mbrDefine.parentController = define ;
			}

			container[name] = mbrDefine ;

			if(innerDefine)
				mbrDefine.xpath = (define.xpath||[]).concat(name) ;

			return mbrDefine ;

		}catch(err){
			helper.log("controller").error(err) ;
			return null ;
		}
	}

	// layout
	if( define.layout!==null )
	{
		define.layout = loadMemberController( define.layout||'weblayout', define, 'layout' ) ;
	}

	// children
	for( var name in define.children )
	{
		define.children[name] = loadMemberController( define.children[name], define.children, name ) ;
	}

	// actions
	for( var name in define.actions )
	{
		define.actions[name] = loadMemberController( define.actions[name], define.actions, name ) ;
	}


	define._initCallbacks = [] ;
	define._initialized = 0 ;
	define._initializeErr = null ;

	return define ;
}

exports.init = function(controller,callback,sync)
{
	if(controller._initialized==2)
	{
		callback && callback(controller._initializeErr,controller) ;
		return ;
	}

	callback && controller._initCallbacks.push(callback) ;

	if(controller._initialized==1)
	{
        helper.log("controller").trace("waiting controller:",controller.pathname()) ;
		return ;
	}

    helper.log("controller").trace("init controller:",controller.pathname()) ;

	controller._initialized = 1 ;
	controller._depsReady = false ;
	controller._imReady = false ;

	if( !sync )
	{
		sync = exports.Sync.singleton ;
	}

	sync.dep(controller) ;

	// layout
	if( controller.layout )
	{
		this.init(controller.layout,null,sync) ;

		sync.dep(controller.layout) ;
	}

	// children and actions
	for(var prop in {children:1,actions:1})
	{
		if(controller[prop])
		{
			for(var name in controller[prop])
			{
                if(controller[prop][name])
                {
                    this.init(controller[prop][name],null,sync) ;
                    sync.dep(controller[prop][name]) ;
                }
			}
		}
	}

	// parent controller
	if(controller.parentController)
	{
		this.init(controller.parentController,null,sync) ;
		sync.dep(controller.parentController) ;
	}

	this._loadView(controller,function(){

		sync.imReady(controller) ;

		controller._imReady = true ;
		exports._loadDone(controller) ;

	}) ;

	sync.addCallback(function(){
		controller._depsReady = true ;
		exports._loadDone(controller) ;
	}) ;
}



exports._loadView = function _loadView(controller,callback){

	function _loadViewTemplate()
	{
        function _loadViewTplDone(err,tpl){
            controller.viewTpl = tpl ;
            if(err)
            {
                exports._setInitErr(controller,err) ;
            }
            callback(err,controller) ;
        }

        if(module._cache[controller.filepath])
        {
            var controllerHelpers = helpers.helperByModule(module._cache[controller.filepath]) ;
            controllerHelpers.template(controller.view,_loadViewTplDone) ;
        }

        else
        {
            Application.singleton.templates.template(controller.view,_loadViewTplDone) ;
        }
	}

	if( !controller.view )
	{
		var error = null ;

		if( controller.view===undefined )
		{
			var pathname = controller.pathname() ;
			if(pathname)
			{
				var tplname = pathname.substr(0,pathname.length-3) + '.html' ;

				try{

					var viewfullpath = require.resolve(tplname,pathname) ;
					fs.exists(viewfullpath,function(exists){
						if(exists)
						{
							controller.view = tplname ;
							_loadViewTemplate() ;
						}
						else
						{
							controller.viewTpl = null ;
							callback && callback(null,controller) ;
						}
					}) ;

					return ;

				// 仅仅是默认的文件不存在
				}catch(err){
					if(err.code!='MODULE_NOT_FOUND')
					{
						error = err ;
					}
				}
			}
		}

		controller.viewTpl = null ;
		exports._setInitErr(controller,error) ;
		callback && callback(error,controller) ;

		return ;
	}

	else
	{
		if( typeof controller.view!="string" )
		{
			var err = new Error("view property of Controller must be a string") ;
			exports._setInitErr(controller,err) ;
			callback && callback(null,controller) ;
			return ;
		}

		_loadViewTemplate() ;
	}
}

exports._setInitErr = function(controller,err)
{
	if(!err)
	{
		return ;
	}
	err.prev = controller._initializeErr ;
	controller._initializeErr = err ;

    helper.log("controller").error(err) ;
}
exports._loadDone = function(controller)
{
	if( !controller._depsReady || !controller._imReady )
	{
		return ;
	}

    helper.log("controller").trace("loaded controller:",controller.pathname()) ;

	controller._initialized = 2 ;

	// 搜集错误
	if(controller.layout && controller.layout._initializeErr)
	{
		exports._setInitErr(controller,controller.layout._initializeErr) ;
	}

	// children and actions
	for(var prop in {children:1,actions:1})
	{
		if(controller[prop])
		{
			for(var name in controller[prop])
			{
				if(controller[prop][name] && controller[prop][name]._initializeErr)
				{
					exports._setInitErr(controller,controller[prop][name]._initializeErr) ;
				}
			}
		}
	}

	var callback ;
	while( (callback=controller._initCallbacks.shift())!==undefined )
	{
        // controller 内的错误不传递给 router, router 仅处理controller本身找不到的情况
        if(controller._initializeErr)
        {
            helper.log("controller").error(controller._initializeErr) ;
        }
		callback(null,controller) ;
	}
}



exports.Sync = function Sync()
{
	this._deps = [] ;
	this._callbacks = [] ;
}

exports.Sync.prototype.dep = function(dep)
{
	// 列入依赖
	if( !dep._imReady )
	{
		if( utilarr.search(this._deps,dep)===false )
		{
			this._deps.push(dep) ;
		}
	}

//	var arr = [] ;
//	for(var i=0;i<this._deps.length;i++)
//	{
//		arr.push(this._deps[i].pathname) ;
//	}
//	console.log(arr)
}
exports.Sync.prototype.addCallback = function(callback)
{
	if( this._deps.length )
	{
		callback && this._callbacks.push(callback) ;
	}
	else
	{
		callback && callback() ;
	}
}

exports.Sync.prototype.imReady = function(controller)
{
//    app().helper.log.controllerger.trace("constroller ready:",controller.pathname()) ;
//    var _deps = "" ;
//    for(var i=0;i<this._deps.length;i++)
//        _deps+= this._deps[i].pathname + ", " ;
//    app().helper.log.controllerger.debug("remain:",this._deps.length,_deps) ;

	var idx = utilarr.search(this._deps,controller) ;
	if( idx===false )
	{
		return ;
	}

	this._deps.splice(idx,1) ;

	if(!this._deps.length)
	{
		// 通知 callback
		var callback, cblst = this._callbacks.slice() ;
		while( (callback=cblst.shift())!==undefined )
		{
			callback() ;
		}
	}
}

exports.Sync.singleton = new exports.Sync() ;
