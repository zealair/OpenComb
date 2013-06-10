
var Steps = require("ocsteps");
var module = require("module");

var factories = {} ;
var application ;

exports.Helper = function(module)
{
    this.module = module ;
    this.package = application.packages.root.locate(module.filename) ;
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


exports.setup = function(app,callback){
    if(global.__ochelpers)
    {
        console.log("helpers.setup() only run once time.") ;
        callback && callback() ;
        return ;
    }

    application = app ;

    global.__oc_Helper = exports.Helper ;
    module.wrapper[0]+= "var helper = new global.__oc_Helper(module) ;" ;

    // buildin helpers
    Steps().each(
        ['db','log','template','controller']
        , function(i,name){
            var define = require("./"+name) ;
            exports.Helper.registerHelper(name,define.factory,define.onregister,this.hold()) ;
        }
    ).done (callback) () ;
}