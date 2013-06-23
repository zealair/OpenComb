
var utilarr = require("../util/array.js") ;
var Controller = require("./Controller.js") ;
var fs = require("fs") ;
var path = require("path") ;
var module = require("module") ;
var Application = require("../core/Application.js") ;
var helpers = require("../helpers") ;


exports.loadDefine = function(define,pathname,parentDefine)
{
	// 路径
	if( typeof define=="string")
	{
		// 处理 action/child 格式
		var names = define.split(":") ;
		if(names.length>1)
		{
			var define = this.loadDefine(names[0]) ;

			for(var i=1;i<names.length;i++)
			{
				var define = define.action(names[i],true) ;
				if(!define)
				{
                    helper.log("controller").trace("action not exists:",names[i]) ;

					throw new Error("cound not found controller by path: "+names.slice(0,i+1).join(":")) ;
					return ;
				}
			}
		}

		// --- ---
		else
		{

			// 会抛异常
			var fullpath = this.resolve(define) || define ;

			// 加载定义文件
            helper.log("controller").trace("load controller fle:",fullpath) ;

			define = require(fullpath) ;
            define.filepath = fullpath ;

			// 检查 __as_controller
			if( !define.__as_controller )
			{
				throw new Error(fullpath+"文件没有声明 module.exports.__as_controller=true ，不能被视作控制器。") ;
			}

			if(!pathname)
			{
				pathname = path.relative(process.cwd()+"/node_modules",fullpath).replace(/\\/g,'/') ;
			}
		}
	}

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
	define.pathname = pathname || undefined ;
	define.ctor() ;

	// 定义本身是一个函数
	if( typeof define=='function' )
	{
		define.process = define ;
	}

	function loadMemberController(mbrDefine,name)
	{
		var mbrPathname = typeof mbrDefine=='string'? undefined: pathname+':'+name ;
		try{
			return exports.loadDefine( mbrDefine, mbrPathname, typeof mbrDefine!='string'? define: undefined ) ;
		}catch(err){
			console.log(err) ;
			return null ;
		}
	}

	// 继承 layout, view
	if(parentDefine && define.layout===undefined && define.layout!==parentDefine.layout)
	{
		define.layout = parentDefine.layout ;
	}
	if(parentDefine && define.view===undefined)
	{
		define.view = parentDefine.view ;
	}
	if(parentDefine && define.viewIn===undefined)
	{
		define.viewIn = parentDefine.viewIn ;
	}
	define.parentController = parentDefine ;


	// layout
	if( define.layout!==null )
	{
		define.layout = loadMemberController( define.layout||'weblayout', 'layout' ) ;
	}

	// children
	for( var name in define.children )
	{
		define.children[name] = loadMemberController( define.children[name], name ) ;
	}

	// actions
	for( var name in define.actions )
	{
		define.actions[name] = loadMemberController( define.actions[name], name ) ;
	}


	define._initCallbacks = [] ;
	define._initialized = 0 ;
	define._initializeErr = null ;

	return define ;
}

exports.resolve = function (path,from)
{
	if( path in Controller._controllerAlias )
	{
		path = Controller._controllerAlias[path] ;
	}

    return Application.singleton.packages.resolve(path,from,'controller') ;
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
        helper.log("controller").trace("waiting controller:",controller.pathname) ;
		return ;
	}

    helper.log("controller").trace("init controller:",controller.pathname) ;

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

		if(controller.pathname)
		{
			var tplname = controller.pathname.substr(0,controller.pathname.length-3) + '.html' ;

			try{

				var viewfullpath = require.resolve(tplname,controller.pathname) ;
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

    helper.log("controller").trace("loaded controller:",controller.pathname) ;

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
//    app().helper.log.controllerger.trace("constroller ready:",controller.pathname) ;
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
