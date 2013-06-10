var trace = require("stack-trace") ;
var Former = require("./Former.js") ;
var ControllerInstance = require("./ControllerInstance.js") ;

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


    // controller instance
    , instance: function(req,res){
        return new ControllerInstance(req,res,this) ;
    }

    , mockup: function()
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

		return this.instance(req,res) ;
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