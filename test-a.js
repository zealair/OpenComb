var m = 'module' ;
var module = require(m);


var indent = 0 ;



String.prototype.repeat = function(num) {
	var tmpArr = [];
	for ( var i = 0; i < num; i++)
		tmpArr.push(this);
	return tmpArr.join("");
}


function around(object,objname,funcname)
{
	var nativefunc = object[funcname] ;
	object[funcname] = function(){

		console.log(">>") ;
		console.log("...;".repeat(++indent)+objname+funcname+"()") ;
		var rt = nativefunc.apply(this,arguments) ;
		console.log("...;".repeat(indent--)+objname+funcname+"() return ") ;

		return rt ;
	}
}


for(var name in module)
{
	if(typeof module[name]=='function')
	{
		around(module,'',name) ;
	}
}
for(var name in module.prototype)
{
	if(typeof module.prototype[name]=='function')
	{
		around(module.prototype,'prot.',name) ;
	}
}

//var nativeRequire = module.prototype.require ;
//module.prototype.require = function(){
//	console.log(arguments) ;
//	return nativeRequire.apply(this,arguments) ;
//}
//
//
//var nativeRequireRepl = module.requireRepl ;
//module.requireRepl = function(){
//	console.log("requireRepl()",arguments) ;
//	return nativeRequireRepl.apply(this,arguments) ;
//}
//
//
var nativeLoad = module.prototype.load ;
module.prototype.load = function(){
	var rt = nativeLoad.apply(this,arguments) ;
	console.log("load()",arguments,rt) ;
	return rt ;
}
//
//var nativeResolveFilename = module._resolveFilename ;
//module._resolveFilename = function(){
//	console.log("_resolveFilename()") ;
//	var rt = nativeResolveFilename.apply(this,arguments) ;
//	console.log(rt) ;
//	return rt ;
//}
//
//
//var native_resolveLookupPaths = module._resolveLookupPaths ;
//module._resolveLookupPaths = function(){
//	var rt = native_resolveLookupPaths.apply(this,arguments) ;
//	console.log("_resolveLookupPaths()",rt) ;
//	return rt ;
//}
//
//
//
var native_load = module._load ;
module._load = function(){
	var rt = native_load.apply(this,arguments) ;
	console.log("_load()",arguments,rt) ;
	return rt ;
}
//
//
//var native_warp = module.wrap ;
//module.wrap = function(){
//	var rt = native_warp.apply(this,arguments) ;
//	console.log("wrap()",arguments,rt) ;
//	return rt ;
//}




//var native_nodeModulePaths = module._nodeModulePaths ;
//module._nodeModulePaths = function(){
//	var rt = native_nodeModulePaths.apply(this,arguments) ;
//	console.log("_nodeModulePaths()",arguments,rt) ;
//	return rt ;
//}



var native_compile = module.prototype._compile ;
module.prototype._compile = function(){

	global.hi = 123 ;

	var rt = native_compile.apply(this,arguments) ;
	console.log("_compile()",arguments,rt) ;
	return rt ;
}

console.log("-----------------------------") ;
require("./test-b.js") ;
console.log("-----------------------------") ;
require("./test-b.js") ;