var trace = require("stack-trace") ;
var ControllerInstance = require("./ControllerInstance.js") ;
var path = require("path") ;
var Application = require("../core/Application.js") ;

exports.Prototype = {

    title: ""
    , description: ""
    , view: undefined
    , viewReal: null
    , viewTpl: null
    , layout: undefined
    , _fullpath: undefined
    , _parentDefine: undefined
    , _asChildName: undefined
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

        this.__defineGetter__('fullpath',this.reflectFullpath) ;
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
	    return this ;

	var method = actionFirst? 'action': 'child' ;
	var controller = this ;
	for(var i=0;i<xpath.length;i++) {

	    if(!(controller=controller[method] (xpath[i],true)))
		throw new Error("can not found controller xpath: "+xpath.slice(0,i+1).join(":")) ;
	}

	return controller ;
    }

    , appendChild: function(name,controllerClass){
	this.children[name] = controllerClass ;
    }
    , appendAction: function(name,controllerClass){
	this.children[name] = controllerClass ;
    }

    , setParentDefine: function(parentDefine,myName){
        this._parentDefine = parentDefine ;
        this._asChildName = myName ;
    }

    , reflectFullpath: function() {
        if(this._fullpath)
            return this._fullpath ;
        if(this._parentDefine)
            return this._parentDefine.fullpath ;
    }

    , pathname: function(packages){
        if(this._parentDefine)
            return this._parentDefine.pathname() + ':' + this._asChildName ;
        else
            return exports.makeControllerPathame(this.fullpath,packages) ;
    }

    , xpath: function(){
        if(this._parentDefine)
            return (this._parentDefine.xpath()||[]).concat( this._asChildName ) ;
        else
            return [] ;
    }
}

exports.makeControllerPathame = function(fullpath,packages){
    if(!fullpath)
	return null ;

    packages || (packages=Application.singleton && Application.singleton.packages) ;

    var pathname = packages.pathname(fullpath) ;
    if(!pathname)
	return null ;

    // 省略文件扩展名
    if(pathname.substr(-3).toLowerCase()=='.js')
	pathname = pathname.substr(0,pathname.length-3) ;

    var slices = pathname.replace('\\','/').split('/') ;
    if( slices[1] == 'controllers' )
	slices.splice(1,1) ;

    return slices.join('/') ;
}

exports._controllerAlias = {

    // layouts
    "weblayout": "ocframework/layout/WebLayout.js"
    , "controlpanel": "ocframework/layout/ControlPanel.js"
    , "desktop": "ocframework/layout/Desktop.js"

    // controllers
    , "hello": "ocframework/Hello.js"
    , "404": "ocframework/MissController.js"
    , "500": "ocframework/MissController.js"
}

exports.registerAlias = function(alisa,controllerpath)
{
    exports._controllerAlias[alisa] = controllerpath ;
}
