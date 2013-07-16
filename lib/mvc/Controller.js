var trace = require("stack-trace") ;
var ControllerInstance = require("./ControllerInstance.js") ;

exports.Prototype = {

	title: ""
	, description: ""
	, view: undefined
	, viewReal: null
	, viewTpl: null
	, layout: undefined
	, pathname: null
	, _isInstance: false
	, _isClass: true
	, _formerCache: {}

	, ctor: function()
	{
        if(!this.keywords)
            this.keywords = [] ;
        if(!this.children)
            this.children = {} ;
        if(!this.actions)
            this.actions = {} ;
    }

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

	, childByXPath: function(xpath,actionFirst){

		if(!xpath)
			return undefined ;

		var method = actionFirst? 'action': 'child' ;
		var controller = this ;
		for(var i=0;i<xpath.length;i++) {

			controller = controller[method] (xpath[i],true) ;
			if(!controller)
			{
				return undefined ;
			}
		}

		return controller ;
	}
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
    exports._controllerAlias[alisa] = controllerpath ;
}