exports.init = function(caches)
{
    //helper.log.trace("templates init, from:",module.parent.filename) ;

    var Application = (require||0)("../../core/Application.js") ;
    var caches = caches || require("octemplate") ;

    // 增加 <view>, <assets>, <msq> 等标签
    caches.generator && caches.generator.registerShaderDefine((require||0)("./shaders/view.js")) ;
    caches.generator && caches.generator.registerShaderDefine((require||0)("./shaders/assets.js")) ;

    // 增加 underscore render helper
    caches.renderHelper._ = (require||0)("underscore") ;

    // 覆盖 createTemplate 方法
    caches.createTemplate = helper.aop.around(caches.createTemplate,function(){

	var tpl = arguments.callee.pointcuts.apply(this,arguments) ;

	// compiled event
	tpl.on('compiled',function(tpl){

	    if( Application.singleton.config.dev.watching.template )
	    {
		// 写入文件后，从文件加载，便于bug
		var fs = (require||Function.__proto__)('fs') ;
		var path = (require||Function.__proto__)('path') ;

		var code = tpl.exportRenderer() ;
		var compiledPath = Application.singleton.rootdir + '/bin/'
			+ path.relative(Application.singleton.rootdir+'/node_modules',tpl.filePath) + '.js' ;

		try{

		    // 递归创建目录
		    helper.fs.mkdirrSync(path.dirname(compiledPath)) ;

		    // 检查最后修改时间，写入文件
		    //helper.log.trace("update template compiled:",compiledPath) ;
		    fs.writeFileSync(compiledPath,"module.exports = "+code) ;

		    // 重新从文件里加载
		    //console.log(tpl.renderer.toString()) ;
		    compiledPath = path.normalize(compiledPath)
		    delete require.cache[compiledPath] ;
		    tpl.renderer = require(compiledPath) ;

                    tpl.watching() ;

		} catch (e) {
		    helper.log.error(e) ;
		}
	    }

	    // 监视变化，重新加载
	    // tpl.watching() ;
	}) ;

	return tpl ;
    }) ;

    return caches ;
}


exports.initForFrontend = function(caches)
{
    var caches = caches || require("octemplate") ;

    caches._tempateclass = require("../../../public/lib/oc/mvc/ViewTemplate.js") ;

    // helper for underscore
    caches.renderHelper._ = _ ;

    caches.resolve = function(filename)
    {
	return filename ;
    }

    caches.downloaded = function(err,path,renderer)
    {

	var tpl = this.cache(path) ;
	if(!tpl)
	{
	    throw new Error("服务器返回了无效的模板："+path) ;
	}

        tpl.loaded = true ;
        tpl.loading = false ;

	tpl.renderer = renderer ;
        tpl.emit("loaded",err,tpl) ;
    }

    // 设置到 jquery 上
    jQuery.tplCaches = caches ;

    return caches ;
}
