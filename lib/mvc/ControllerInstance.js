var md5 = require("../util/md5.js") ;
var utilarray = require("../util/array.js") ;
var Nut = require("./Nut.js") ;
var querystring = require("querystring") ;
var Steps = require("ocsteps") ;
var Former = require("./former/Former.js") ;
var Application = require("../core/Application.js") ;

module.exports = function(req,res,cls)
{
    this.__proto__ = cls ;

    this.req = req ;
    this.res = res ;
    this.nut = new Nut(this) ;
    this.children = {__proto__:cls.children} ;
    this._layout ;
    this._isInstance = true ;
    this._isClass = false ;

    this.seed = {
        fillFromReq: function(){

            // get params
            var params = querystring.parse(req._parsedUrl && req._parsedUrl.query||"") ;
            for(var key in params)
            {
		if(params[key]=='undefined')
		    delete params[key] ;
	    }

            // files
            if(req.files)
            {
                for(var name in req.files)
                {
                    if( req.files[name].name )
                    {
                        params[name] = req.files[name] ;
                    }
                }
            }

            // post params
            if(req.body)
            {
                params.__proto__ = req.body ;
            }

            this.__proto__ = params ;
        }

        , bool: function(name,defval)
        {
            if( typeof this[name]=='undefined' )
            {
                return defval ;
            }
            return !this[name].toString().match(/^(0|false)$/i) ;
        }
    }

    // 由于使用了 __proto__ ... ...
    for(var name in module.exports.prototype)
    {
        this[name] = module.exports.prototype[name] ;
    }

    // auto create layout instance
    this.__defineGetter__("layout",function(){

        if(!this._layout && this.__proto__.layout)
        {
            this._layout = this.__proto__.layout ;
        }

        if(this._layout && !this._layout._isInstance)
        {
            this._layout = this._layout.instance(this.req,this.res) ;
        }

        return this._layout ;
    }) ;
    this.__defineSetter__("layout",function(layout){
        this._layout = layout ;
    }) ;
}

module.exports.prototype.destroy = function(){

    this.req = null ;
    this.res = null ;

    for(var name in this._children)
    {
        if(this._children[name])
        {
            this._children[name].destroy() ;
        }
        delete this._children[name] ;
        delete this.seed['$'+name] ;
    }
    this._children = null ;

    this.nut.destroy() ;
    this.nut = null ;
    this.seed = null ;
}


module.exports.prototype._processController = function(layout,sumsigns,callback)
{
    // 计算摘要签名
    this.evalSummarySignature(this.seed,this.nut) ;

    var steps = Steps().done(function(err){
	helper.log("controller").trace("_processController() callback:",this.pathname()) ;
	callback && callback(err) ;
    }).bind(this) ;

    // 1. 执行自己
    // 检查客户端缓存签名
    if( utilarray.search(sumsigns,this.nut.model.$sumsign)===false )
    {
        steps.step( function doControllerProcess(){

	    helper.log("controller").trace("before call controller process():",this.pathname()) ;

	    this.process(this.seed,this.nut) ;

	    helper.log("controller").trace("after call controller process():",this.pathname()) ;
        } ) ;
    }

    // 2. 执行children
    steps.step(
        function(){
            this.each(this.children,function(name){
                var child = this._link(name) ;
                if(child)
                {
	            helper.log("controller").trace("process child:",child.pathname()) ;

                    child._processController(false,sumsigns,this.hold(function(err){
	                helper.log("controller").trace("child processed:",child.pathname()) ;

                        if(err) throw err ;
                    })) ;
                }
            }) ;
        }
    ) ;


    steps.step(function(){
        if( this.nut.disabled )
            this.terminate() ;
    }) ;


    // 3. 执行layout
    if(layout) // 是否要求执行 layout
    {
        steps.step(
            function(){
                if(layout===true)
                {
                    return this.layout ;
                }
                else
                {
                    helper.controller(layout,sumsigns,function(err,cls){
                        if(err) throw err ;
                        return cls.instance(this.req,this.res) ;
                    }) ;
                }
            }

            , function(layoutController){
                if( layoutController )
                {
	            helper.log("controller").trace("process layout:",layoutController.pathname()) ;

                    this._link('layout',layoutController) ;
                    layoutController.nut.view.wrapperClasses.push("oclayout") ;
                    layoutController._processController(true,sumsigns,this.hold(function(err){

	                helper.log("controller").trace("layout processed:",layoutController.pathname()) ;

                        if(err) throw err ;
                    })) ;
                }
            }
        ) ;
    }

    
    // 开始执行
    steps() ;

    return this ;
}

module.exports.prototype.main = function(callback)
{
    var controller = this ;

    // 执行主控制器
    this._processController(

        paramLayout(this.seed["$layout"])

        , this.seed["$sumsigns"]? this.seed["$sumsigns"].toString().split(","): []

        // 执行完毕
        , (function(err){

            if(this.nut.disabled)
            {
                helper.log("controller").trace("nut has disabled.") ;
                this.res.end() ;
                this.destroy() ;
                return ;
            }

	    helper.log("controller").trace("main callback:",controller.pathname()) ;

            if(err)
            {
                helper.log("controller").error(err) ;

                this.res.statusCode = "500" ;
	        this.res.write("<h1>Server Side Error</h1>") ;

	        if( Application.singleton.config.dev.outputControllerError )
		    this.res.write("<pre>"+err.toString()+"</pre>") ;

                this.res.end() ;

                return ;
            }

            // render and nut views
            if( this.seed.bool("$render",true) )
            {
	        helper.log("controller").trace("before nut crack():",controller.pathname()) ;
                this.nut.crack(function(err,html){

	            helper.log("controller").trace("after nut crack():",controller.pathname()) ;

	            if(err)
		        helper.log("controller").error( err ) ;

                    // 输出
                    controller.res.write( html ) ;

                    callback && callback(controller) ;

                    // 销毁对象
                    controller.res.end() ;
                    controller.destroy() ;

                },true) ;
            }
            else
            {
                helper.log('controller').trace("before output json",controller.pathname()) ;
                var json = JSON.stringify( this.nut.cleanup() ) ;

                this.res.setHeader("Content-Type","application/javascript") ;
                this.res.write( json ) ;

                callback && callback(this) ;

                // 销毁对象
                this.res.end() ;
                this.destroy() ;
            }
        }).bind(this)
    ) ;
}

module.exports.prototype.evalSummarySignature = function(params,nut)
{
    // 把params内容排序
    function sortParamsForSumsign(params)
    {
        var validnames = [] ;
        for(var name in params)
        {
            if(name[0]=="$"||name[0]=="$"||name=='req')	// '$','$'
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

module.exports.prototype.child = function(name)
{
    if( !this.children[name] )
    {
        return ;
    }

    // create instance from class
    if(!this.children[name]._isInstance)
    {
        this.children[name] = this.children[name].instance(this.req,this.res) ;
    }

    return this.children[name] ;
}

module.exports.prototype._link = function(name,child)
{
    if( !child && !(child=this.child(name)) )
        return ;

    this.nut._children[name] = child.nut ;

    var key = '$' + name ;
    if(this.seed[key])
    {
        this.seed[key].__proto__ = child.seed ;
        child.seed = this.seed[key] ;
    }

    return child ;
}

module.exports.prototype.former = function()
{
    if(this.viewTpl && this.viewTpl.formMetas)
    {
	return new Former(this,this.viewTpl) ;
    }
}

module.exports.prototype.location = function(url,waitingsec)
{
    this.nut.model.locatioUrl = url || '/' ;
    this.nut.model.waitingsec = waitingsec||3 ;
    this.nut.createViewFromTemplate("opencomb/templates/Relocation.html",this.hold()) ;
}

module.exports.prototype.application = function()
{
    return Application.singleton ;
}
