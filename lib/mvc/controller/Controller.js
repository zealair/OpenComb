
if( typeof window=="undefined" )
{
	var path = require("path") ;
	var fs = require("fs") ;
}
var Class = require("occlass/lib/Class.js") ;
var trace = require("stack-trace") ;
var ViewTemplateCaches = require("../view/ViewTemplateCaches.js") ;
var md5 = require("ocplatform/lib/util/md5.js") ;
var utilarray = require("ocplatform/lib/util/array.js") ;
var Earth = require("./Earth.js") ;

var Controller = module.exports = Class.extend({

	title: ""
	, description: ""
	, keywords: []
	, view: null
	, viewReal: null
	, viewTpl: null
	, layout: null
	, children: {}
	, actions: {}
	, _msgqueue: null

	, _initCallbacks: []
	, _initialized: 0
	, _initializeErr: null
	, init: function(callback){

		// console.log(this.constructor.pathname+".init()") ;

		if(this._initialized==2)
		{
			callback(this._initializeErr,this) ;
			return ;
		}

		this._initCallbacks.push(callback) ;

		if(this._initialized==1)
		{
			return ;
		}

		this._initialized==1 ;


		var controller = this ;
		var waterfall = [
			this._loadView
			, this._initLayout
			, this._initChildren
			, this._initActions
		] ;

		var runstep = function ()
		{
			if(waterfall.length<=0)
			{
				// complete
				controller._emitInitCallbacks(null) ;
				return ;
			}

			var step = waterfall.shift() ;

			step.call( controller, function(err){
				if(err)
				{
					controller._emitInitCallbacks(err) ;
					return ;
				}

				// next step
				runstep() ;
			} );
		}

		// start
		runstep() ;
	}
	, _emitInitCallbacks: function(err){
		this._initialized = 2 ;
		this._initializeErr = err ;

		var callback ;
		while( callback=this._initCallbacks.shift() )
		{
			callback(this._initializeErr,this) ;
		}
	}

	, process: function(req,rsp){
		return true ;
	}

	, main: function(earth)
	{
		var processController = function(earth,layout)
		{
			var processChildren = true ;

			// 计算摘要签名
			this.evalSummarySignature(earth.seed,earth.nut) ;

			// 检查客户端缓存签名
			if( utilarray.search(sumsigns,earth.nut.model.$sumsign)===false )
			{
				// 执行自己
				earth.hold() ;
				if( this.process(earth.seed,earth.nut,earth)===true )
				{
					earth.release() ;
				}
			}
			else
			{
				processChildren = false ;
			}

			// 执行 layout
			if( layout && this.layout )
			{
				var otherEarth = earth.createChild("layout",this.layout) ;
				otherEarth.nut.view.wrapperClasses.push("oclayout") ;

				arguments.callee.call(this.layout,otherEarth,true) ;
			}

			// 执行子控制器
			if( processChildren )
			{
				for(var name in this.children)
				{
					var otherEarth = earth.createChild(name,this.children[name]) ;
					arguments.callee.call(this.children[name],otherEarth,false) ;
				}
			}

			return earth ;
		}

		var sumsigns = earth.seed["@sumsigns"]? earth.seed["@sumsigns"].split(","): [] ;

		earth.rsp.on("complete",function(){

			// render and nut views
			if( boolean(earth.seed,"@render",true) )
			{
				earth.nut.crack(function(err,html){
					if(err)
					{
						console.log( err.toString() ) ;
					}

					// 输出
					earth.rsp.write( html ) ;

					//
					earth.rsp.end() ;
					earth.destroy() ;
				},true) ;
			}
			else
			{
				var json = JSON.stringify( earth.nut.cleanup() ) ;

				earth.rsp.setHeader("Content-Type","application/javascript") ;
				earth.rsp.write( json ) ;

				earth.rsp.end() ;
				earth.destroy() ;
			}

		}) ;

		// 执行主控制器
		processController
			.call(
				this
				, earth.hold()
				, boolean(earth.seed,"@layout",true)
			)
			.release() ;



	}

	, createEarth: function(req,rsp,platform)
	{
		return (new Earth(this,req,rsp,platform))
					.fillSeedByReq() ;
	}

	, child: function(name,includeAction){
		if( typeof this.children[name]!="undefined" )
		{
			return this.children[name] ;
		}
		else if(includeAction && typeof this.actions[name]!="undefined")
		{
			return this.actions[name] ;
		}
		else
		{
			return null ;
		}
	}

	, action: function(name,includeChild){
		if( typeof this.actions[name]!="undefined" )
		{
			return this.actions[name] ;
		}
		else if(includeChild && typeof this.children[name]!="undefined")
		{
			return this.children[name] ;
		}
		else
		{
			return null ;
		}
	}


	, _loadView: function(callback){

		var controller = this ;

		if( !this.view )
		{
			if(this.constructor.pathname)
			{
				var tplname = this.constructor.pathname.substr(0,this.constructor.pathname.length-3) + '.html' ;
				try{

					var viewfullpath = require.resolve(tplname,this.constructor.pathname) ;

					fs.exists(viewfullpath,function(exists){
						if(exists)
						{
							controller.view = tplname ;
							ViewTemplateCaches.singleton().template(controller.view,function(err,tpl){
								controller.viewTpl = tpl ;
								callback(err,controller) ;
							}) ;
						}
						else
						{
							callback && callback(null,this) ;
							this.viewTpl = null ;
						}
					}) ;

					return ;

				}catch(err){}
			}

			callback && callback(null,this) ;
			this.viewTpl = null ;

			return ;
		}

		if( typeof this.view!="string" )
		{
			callback(new Error("view property of Controller must be a string")) ;
			return ;
		}

		ViewTemplateCaches.singleton().template(this.view,function(err,tpl){
			controller.viewTpl = tpl ;
			callback(err,controller) ;
		}) ;
	}

	, _initLayout: function(callback){

		if( this.layout===null )
		{
			callback(null,this) ;
			this.layout = null ;
			return ;
		}

		var controller = this ;
		Controller.load(this.layout||'weblayout',function(err,layout){
			controller.layout = layout ;
			callback(err,controller) ;
		})
	}

	, _initChildren: function(callback,type){

		var type = type || "children" ;

		var childNames = [] ;
		for( var name in this[type] )
		{
			childNames.push(name) ;
		}

		var controller = this ;
		var loadChild = function()
		{
			if( childNames.length<=0 )
			{
				callback(null,controller) ;
				return ;
			}

			var name = childNames.shift() ;
			Controller.load(
				controller[type][name]
				, function(err,child){
					controller[type][name] = child ;
					if(err)
					{
						callback(err,controller) ;
					}
					else
					{
						loadChild() ;
					}
				}
				, typeof controller[type][name]!="string"?
						controller.constructor.pathname+":"+name :
						undefined
			)
		}
		loadChild() ;
	}

	, _initActions: function(callback){
		this._initChildren(callback,"actions") ;
	}

	, evalSummarySignature: function(params,nut)
	{
		// 把params内容排序
		function sortParamsForSumsign(params)
		{
			var validnames = [] ;
			for(var name in params)
			{
				if(name[0]=="$"||name[0]=="@"||name=='req')	// '$','@'
				{
					continue ;
				}
				else if( typeof params[name]!="function" )
				{
					insertInOrder(validnames,name) ;
				}
			}
			var sorted = {} ;
			for(var i=0;i<validnames.length;i++)
			{
				sorted[validnames[i]] = typeof params[validnames[i]]=="object"?
							sortParamsForSumsign(params[validnames[i]]):
							params[validnames[i]] ;
			}
			return sorted ;
		}
		function insertInOrder(arr,name)
		{
			for(var i=arr.length-1;i>=0;i--)
			{
				if( arr[i] < name )
				{
					arr.splice(i+1,0,name) ;
					return ;
				}
			}
			arr.unshift(name) ;
		}

		var src = nut.model.$controllerpath ;
		src+= JSON.stringify( sortParamsForSumsign(params) ) ;

		nut.model.$sumsign = md5(src) ;
	}
}

// define static members, variable "this" is point to the class -------------
,{
	pathname: null

	, invoke: function(controllerPath,args,callback,req,rsp)
	{
		Controller.load(controllerPath,function(err,controller){
			if(err)
			{
				callback && callback(err) ;
				return ;
			}

			// create seed, nut, earth
			// todo ...
		}) ;
	}

	, load: function(define,callback,pathname){

		callback = callback || function(){} ;

		if(typeof define=="string")
		{
			// 处理 action/child 格式
			var names = define.split(":") ;
			if(names.length>1)
			{
				return this.load(names[0],function(err,controller){
					if(err)
					{
						callback(err) ;
						return ;
					}

					for(var i=1;i<names.length;i++)
					{
						var controller = controller.action(names[i],true) ;
						if(!controller)
						{
							callback(new Error("cound not found controller by path: "+names.slice(0,i+1).join(":"))) ;
							return ;
						}
					}

					callback(null,controller) ;
				}) ;
			}

			try{
				var fullpath = Controller.resolve(define) || define ;
			}catch(e){
				callback(e) ;
				return ;
			}

			define = require(fullpath) ;

			if(!pathname)
			{
				pathname = path.relative(process.cwd()+"/node_modules",fullpath) ;
			}
		}

		if( define.Class )
		{
			return define.Class.singleton(callback) ;
		}

		switch ( typeof define )
		{
			case "object" :
				define = define.Class = this.extend(define,{pathname:pathname}) ;
				break ;

			case "function" :
				if( !Class.isA(define,Controller) )
				{
					define = define.Class = this.extend({process:define},{pathname:pathname}) ;
				}
				break ;
			default :
				throw new Error("文件没有返回有效的控制器定义："+arguments[0]) ;
				break ;
		}

		return define.singleton(callback) ;
	}

	, singleton: function(callback){

		if(!this._singleton)
		{
			this._singleton = new this ;
			this._singleton.init(callback) ;
		}
		else
		{
			callback(null,this._singleton) ;
		}

		return this._singleton ;
	}

	, _singleton: null

	, extend: function(dynamicMembers,staticMembers){
		if( typeof dynamicMembers.config!=="undefined" )
		{
			// 和父类的 config 属性合并
			dynamicMembers.config = this.mergeObject(null,this.prototype.config,dynamicMembers.config) ;
		}

		return this._super(dynamicMembers,staticMembers) ;
	}

}) ;



// not inherists static members -------------
Controller.resolve = function (path)
{
	if( path in Controller._controllerAlias )
	{
		path = Controller._controllerAlias[path] ;
	}

	try{
		return require.resolve(path) ;
	}catch(err){
		if( typeof err.code=="undefined" || err.code!="MODULE_NOT_FOUND" )
		{
			throw err ;
		}
	}

	// 清理开头的斜线 和 连续的斜线
	var subnames = path.replace(/^\/+/,"").replace(/\/+/g,"/").split("/") ;
	subnames.splice(1,0,"lib") ;
	path = subnames.join("/") ;

	return require.resolve(path) ;
}




var boolean = function(model,name,defval)
{
	if( typeof model[name]=='undefined' )
	{
		return defval ;
	}
	return !model[name].match(/^(0|false)$/i) ;
}



Controller._controllerAlias = {

	// layouts
	"webpage": "ocplatform/lib/mvc/controller/layout/WebPage.js"
	, "weblayout": "ocplatform/lib/mvc/controller/layout/WebLayout.js"
	, "controllpanel": "ocplatform/lib/mvc/controller/layout/LayoutControllPanel.js"
	, "desktop": "ocplatform/lib/mvc/controller/layout/LayoutDesktop.js"

	// controllers
	, "hello": "ocplatform/lib/mvc/controller/Hello.js"
	, "signin": "ocplatform/lib/usr/SignIn.js"
	, "signout": "ocplatform/lib/usr/SignOut.js"
	, "signup": "ocplatform/lib/usr/SignUp.js"
}