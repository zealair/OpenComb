
if( typeof window=="undefined" )
{
	var path = require("path") ;
	var fs = require("fs") ;
}
var Class = require("occlass/lib/Class.js") ;
var trace = require("stack-trace") ;
var md5 = require("ocplatform/lib/util/md5.js") ;
var utilarray = require("ocplatform/lib/util/array.js") ;
var Earth = require("./Earth.js") ;
var ControllerLoader = require("./ControllerLoader.js") ;
var Step = require("step") ;

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

	, process: function(req,res){
		return true ;
	}

	, main: function(earth,callback)
	{
		var processController = function(earth,layout,callback)
		{
			var controller = this ;
			var processChildren = true ;

			// 计算摘要签名
			this.evalSummarySignature(earth.seed,earth.nut) ;

			Step(

				function processSelf()
				{
					// 检查客户端缓存签名
					if( utilarray.search(sumsigns,earth.nut.model.$sumsign)===false )
					{
						earth.onReduceTo(null,this).hold() ;

						// 执行自己
						if( controller.process(earth.seed,earth.nut,earth)===true )
						{
							earth.release() ;
						}
					}
					else
					{
						processChildren = false ;
						return true ;
					}
				}

				, function processLayout(err)
				{
					// 执行 layout
					if( layout && controller.layout )
					{
						var otherEarth = earth.createChild("layout",controller.layout) ;
						otherEarth.nut.view.wrapperClasses.push("oclayout") ;

						processController.call(
								controller.layout
								, otherEarth
								, true
								, this
						) ;
					}
					else
					{
						return true ;
					}
				}

				, function processChildren(err)
				{
					var group = this.group() ;
					var waitingChildren = 0 ;

					// 执行子控制器
					if( processChildren )
					{
						for(var name in controller.children)
						{
							var otherEarth = earth.createChild(name,controller.children[name]) ;

							processController.call(
								controller.children[name]
								, otherEarth
								, false
								, group()
							) ;

							waitingChildren ++ ;
						}
					}

					if(!waitingChildren)
					{
						return true ;
					}
				}

				, function done(err)
				{
					callback && callback() ;
				}
			) ;

			return earth ;
		}

		var sumsigns = earth.seed["@sumsigns"]? earth.seed["@sumsigns"].split(","): [] ;

		// 执行主控制器
		var controller = this ;
		processController.call(
			this
			, earth
			, boolean(earth.seed,"@layout",true)

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
	return !model[name].match(/^(0|false)$/i) ;
}

exports.load = function(define,callback,pathname)
{
	var controller = ControllerLoader.loadDefine(define,pathname) ;
	ControllerLoader.init(controller,callback) ;

	return controller ;
}

exports._controllerAlias = {

	// layouts
	"webpage": "ocplatform/lib/mvc/controllers/layout/WebPage.js"
	, "weblayout": "ocplatform/lib/mvc/controllers/layout/WebLayout.js"
	, "controllpanel": "ocplatform/lib/mvc/controllers/layout/LayoutControllPanel.js"
	, "desktop": "ocplatform/lib/mvc/controllers/layout/LayoutDesktop.js"

	// controllers
	, "hello": "ocplatform/lib/mvc/controllers/Hello.js"
	, "signin": "ocplatform/lib/usr/SignIn.js"
	, "signout": "ocplatform/lib/usr/SignOut.js"
	, "signup": "ocplatform/lib/usr/SignUp.js"
}

exports.registerAlias = function(alisa,controllerpath)
{
	Controller._controllerAlias[alisa] = controllerpath ;
}