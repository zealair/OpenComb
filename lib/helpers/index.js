
var Steps = require("ocsteps");
var module = require("module");
var path = require("path");
var assert = require("assert") ;

var application ;

exports.Helper = function(module)
{
    this.module = module ;
    this.package = application.packages.root.locate(module.filename) ;
	//assert.ok(this.package,'can not locale package for module:'+module.filename);
}

exports.Helper.registerHelper = function(name,factory,register,callback){
    exports.Helper.prototype.__defineGetter__(name,function(){
        return factory(application, this.package, this.module) ;
    }) ;

    if(register)
    {
        register(application,callback) ;
    }
    else
    {
        callback && callback() ;
    }
}

///////////////////////////////////////////////

exports.setup = function(app,callback){
    if(global.__ochelpers)
    {
        console.log("helpers.setup() only run once time.") ;
        callback && callback() ;
        return ;
    }

    application = app ;

    global["opencomb/lib/helpers"] = exports ;
    module.wrapper[0]+= "var helper = global[\"opencomb/lib/helpers\"].helperByModule(module) ;" ;

    // buildin helpers
    Steps().each(
        ['_','util','fs','aop','db','log','template','controller',"former"]
        , function(i,name){
		    console.log("setup helper:",name) ;
            var define = require("./"+name) ;
            exports.Helper.registerHelper(name,define.factory,define.onregister,this.holdButThrowError()) ;
        }
    ).done (callback) () ;
}

exports.helper = function(modulepath)
{

}

exports.helperByModule = function(module)
{
    if(!module.helper)
    {
        module.helper = new exports.Helper(module) ;
    }
    return module.helper ;
}
