var Class = require("ocClass/lib/Class.js") ;
var TemplateCaches = require("ocTemplate") ;
var path = require("path") ;
var trace = require("stack-trace") ;
var RenderContext = require("./view/RenderContext.js") ;
var view = require("./view/View.js") ;

var Controller = module.exports = Class.extend({

	title: ""
	, description: ""
	, keywords: []
	, view: null
	, viewReal: null
	, layout: null
	, children: {}
	, actions: {}

	, _initCallbacks: []
	, _initialized: 0
	, _initializeErr: null
	, init: function(callback){

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

	, process: function(param,rspn,views){

	}

	, main: function(req,rspn)
	{
		rspn.wait() ;

		// build view render contexts
		RenderContext.buildContextHeap(this,rspn) ;

		// 执行自己
		rspn.wait() ;
		if( this.process(req,rspn)===true )
		{
			rspn.end() ;
		}

		// 执行 layout
		if( this.layout )
		{
			if( this.layout.process(req,rspn)===true )
			{
				rspn.end() ;
			}
		}

		// 执行子控制器
		for(var name in this.children)
		{
			rspn.wait() ;
			if( this.children[name].process(req,rspn)===true )
			{
				rspn.end() ;
			}
		}


		// render and output views
		if(rspn.rootView)
		{
			rspn.wait() ;
			rspn.rootView.render(function(err){
				rspn.write( rspn.rootView.buff.toString() ) ;
				// console.log(rspn.rootView.buff.toString()) ;
				rspn.end() ;

				rspn.rootView.buff.destroy() ;
			}) ;
		}


		rspn.end() ;
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

		if( !this.view )
		{
			callback(null,this) ;
			this.view = null ;
			return ;
		}

		if( typeof this.view!="string" )
		{
			callback(new Error("view property of Controller must be a string")) ;
			return ;
		}

		var viewrReal = view.resolve(this.view) ;
		var controller = this ;

		TemplateCaches.singleton.load(viewrReal,null,function(err,tpl){
			controller.view = tpl ;
			if(err)
			{
				callback(err,controller) ;
			}
			else
			{
				view.buildViewFromTemplate(tpl,viewrReal,function(err){
					callback(err,controller) ;
				}) ;
			}
		},view.parser) ;
	}

	, _initLayout: function(callback){

		if( !this.layout )
		{
			callback(null,this) ;
			this.layout = null ;
			return ;
		}

		var controller = this ;
		Controller.load(this.layout,function(err,layout){
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
			Controller.load(controller[type][name],function(err,child){
				controller[type][name] = child ;
				if(err)
				{
					callback(err,controller) ;
				}
				else
				{
					loadChild() ;
				}
			})
		}
		loadChild() ;
	}

	, _initActions: function(callback){
		this._initChildren(callback,"actions") ;
	}

}

// define static members, variable "this" is point to the class -------------
,{
	load: function(define,callback){

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
				define = Controller.resolve(define) || define ;
			}catch(e){
				callback(e) ;
				return ;
			}

			define = require(define) || define ;
		}

		var self = this ;
		var createControllerClass = function(module)
		{
			return (typeof module.Class=="undefined")? self.extend(module): module.Class ;
		}

		switch ( typeof define )
		{
			case "object" :
				define = define.Class = createControllerClass(define) ;
				break ;

			case "function" :
				if( !Class.isA(define,Controller) )
				{
					define = define.Class = createControllerClass({ process: define }) ;
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

Controller._controllerAlias = {

	// layouts
	"webpage": "ocPlatform/lib/mvc/layout/WebPage.js"
	, "front": "ocPlatform/lib/mvc/layout/LayoutWebBrowse.js"
	, "controllpanel": "ocPlatform/lib/mvc/layout/LayoutControllPanel.js"
	, "desktop": "ocPlatform/lib/mvc/layout/LayoutDesktop.js"

	// controllers
	, "hello": "ocPlatform/Hello.js"
}


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
	path = path.replace(/^\/+/,"").replace(/\/+/g,"/") ;

	var subnames = path.split("/") ;
	if(subnames.length<2 || !subnames[1])
	{
		return require.resolve(path) ;
	}

	subnames.splice(1,0,"controllers") ;
	path = subnames.join("/") ;

	return require.resolve(path) ;
}
