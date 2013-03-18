var _pt = require("path") ;
var fs = require("fs") ;

exports.buildViewFromTemplate = function(tpl,tplPath,callback){

	var extname = _pt.extname(tplPath) ;
	var onshowScript = tplPath.substring(0,tplPath.length-extname.length) + ".js" ;

	tpl.useWrapper = true ;

	try{
		require.resolve(onshowScript) ;
		tpl.onshowScript = onshowScript ;
	}catch(e){
		tpl.onshowScript = null ;
	}

	callback(null,tpl) ;
}

var TemplateParser = require("ocTemplate/lib/Parser.js") ;

exports.parser = new TemplateParser() ;

var shaderView = require("./shaders/view") ;
exports.parser.registerShaderFunction(shaderView.selector,shaderView.shader) ;


exports.resolve = function(path)
{
	if(/^[\.\/]/.test(path))
	{
		return path ;
	}

	// 连续的斜线 并切割
	var subnames = path.replace(/\/+/g,"/").split("/") ;
	if(subnames.length<2 || !subnames[1])
	{
		return path ;
	}

	subnames.splice(1,0,"templates") ;
	return subnames.join("/") ;
}