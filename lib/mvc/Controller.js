
if( typeof window=="undefined" )
{
	var path = require("path") ;
	var fs = require("fs") ;
}
var trace = require("stack-trace") ;
var md5 = require("../util/md5.js") ;
var utilarray = require("../util/array.js") ;
var Earth = require("./Earth.js") ;
var ControllerLoader = require("./ControllerLoader.js") ;
var Step = require("step") ;
var ocSteps = require("ocsteps") ;
var Former = require("./Former.js") ;

exports.Prototype = {

	title: ""
	, description: ""
	, keywords: []
	, view: null
	, viewReal: null
	, viewTpl: null
	, layout: undefined
	, children: {}
	, actions: {}
	, pathname: null
	, formers: { __proto__: Former.FormersPrototype }

	, ctor: function()
	{}

	, process: function(req,res){
		return true ;
	}

	, main: function(earth,callback)
	{
		var processController = function(earth,layout,callback)
		{
			var controller = this ;
			var childNames = Object.keys(controller.children) ;

			// 计算摘要签名
			this.evalSummarySignature(earth.seed,earth.nut) ;

			(function processSelf()
			{
				// 检查客户端缓存签名
				if( utilarray.search(sumsigns,earth.nut.model.$sumsign)===false )
				{
					earth.onReduceTo(null,makesureLayout).hold() ;

					// 执行自己
					if( controller.process(earth.seed,earth.nut,earth)===true )
					{
						earth.release() ;
					}
				}
				else
				{
					childNames = [] ;
					makesureLayout(null) ;
				}
			}) () ;

			function makesureLayout(err)
			{
				// 要求不执行layout
				if(!layout)
				{
					processChild(null) ;
				}

				// 控制器定义中的 layout
				else if(layout===true)
				{
					processLayout(controller.layout) ;
				}

				// 要求指定的layout
				else
				{
					exports.load(layout,function(err,controller){
						if(err)
						{
							console.log(err) ;
						}
						processLayout(controller) ;
					}) ;
				}
			}

			function processLayout(layoutController)
			{
				if(layoutController)
				{
					var layoutController = {__proto__:layoutController} ;
					var otherEarth = earth.createChild("layout",layoutController) ;
					otherEarth.nut.view.wrapperClasses.push("oclayout") ;

					processController.call(
						layoutController
						, otherEarth
						, true
						, processChild
					) ;
				}
				else
				{
					processChild(null) ;
				}
			}

			function processChild(err)
			{
				if( !childNames.length )
				{
					callback && callback() ;
					return ;
				}

				// 执行子控制器
				var name = childNames.shift() ;
				var childController = {__proto__:controller.children[name]} ;

				var otherEarth = earth.createChild(name,childController) ;
				processController.call(
					childController
					, otherEarth
					, false
					, processChild
				) ;
			}

			return earth ;
		}

		if(earth.seed["@sumsigns"] && !earth.seed["@sumsigns"].split) console.log('sumsigns: ',typeof earth.seed["@sumsigns"],earth.seed["@sumsigns"]) ;

		var sumsigns = earth.seed["@sumsigns"]? earth.seed["@sumsigns"].toString().split(","): [] ;

		// 执行主控制器
		var controller = {__proto__:this} ;
		processController.call(
			controller
			, earth
			, paramLayout(earth.seed["@layout"])

			// 执行完毕
			, function(){

				// render and nut views
				if( boolean(earth.seed,"@render",true) )
				{
					earth.nut.crack(function(err,html){
						if(err)
						{
							console.log( err.toString() ) ;
						}

						// 输出
						earth.res.write( html ) ;

						callback && callback(controller,earth) ;

						// 销毁 earth 对象
						earth.res.end() ;
						earth.destroy() ;

					},true) ;
				}
				else
				{
					var json = JSON.stringify( earth.nut.cleanup() ) ;

					earth.res.setHeader("Content-Type","application/javascript") ;
					earth.res.write( json ) ;

					callback && callback(controller,earth) ;

					// 销毁 earth 对象
					earth.res.end() ;
					earth.destroy() ;
				}
			}
		) ;
	}

	, createEarth: function(req,res,platform)
	{
		return (new Earth(this,req,res,platform))
			.fillSeedByReq() ;
	}

	, mockupEarth: function(req,res,platform)
	{
		var mock = require("mocks") ;

		var req = new mock.http.ServerRequest({url:"http://127.0.0.1/hello"}) ;
		var res = new mock.http.ServerResponse ;
		res._buff = '' ;
		res.write = function(txt)
		{
			this._buff+= txt ;
		}
		res.end = function(){}

		return this.createEarth(req,res) ;
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

	, former: function(name)
	{
		return this.formers.former(name) ;
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

exports.append = function(parentpath,childpath,childname,callback)
{
	Controller.load(parentpath,function(err,parent){
		if(err)
		{
			var error = new Error("执行Controller.append()时，加载控制器出错："+parentpath) ;
			error.prev = err ;
			callback && callback(error) ;
			return ;
		}

		// 加载 MiniUserPad
		Controller.load(childpath,function(err,child){
			if(err)
			{
				var error = new Error("执行Controller.append()时，加载控制器出错："+childpath) ;
				error.prev = err ;

				callback && callback(error) ;
				return ;
			}

			parent.children[childname] = child ;

			callback && callback(null,parent,child,childname) ;
		}) ;
	}) ;
}

var boolean = function(model,name,defval)
{
	if( typeof model[name]=='undefined' )
	{
		return defval ;
	}
	return !model[name].toString().match(/^(0|false)$/i) ;
}
var paramLayout = function(value)
{
	// 默认值
	if(!value)
	{
		return true ;
	}

	(typeof value!='string') && (value=value.toString()) ;

	if( value.match(/^(0|false)$/i) )
	{
		return false ;
	}
	else if( value.match(/^(1|true)$/i) )
	{
		return true ;
	}
	else
	{
		return value ;
	}
}

exports.load = function(define,callback,pathname)
{
	try{
		define = ControllerLoader.loadDefine(define,pathname) ;
	}
	catch(e)
	{
		callback && callback(e) ;
		return ;
	}
	ControllerLoader.init(define,callback) ;
}

exports._controllerAlias = {

	// layouts
	"weblayout": "ocframework/lib/mvc/controllers/layout/WebLayout.js"
	, "controlpanel": "ocframework/lib/mvc/controllers/layout/ControlPanel.js"
	, "desktop": "ocframework/lib/mvc/controllers/layout/Desktop.js"

	// controllers
    , "hello": "ocframework/lib/mvc/controllers/Hello.js"
    , "404": "ocframework/lib/mvc/controllers/MissController.js"
    , "500": "ocframework/lib/mvc/controllers/MissController.js"
}

exports.registerAlias = function(alisa,controllerpath)
{
	Controller._controllerAlias[alisa] = controllerpath ;
}