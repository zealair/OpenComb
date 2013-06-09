

exports.init = function(caches)
{
    var Application = (require||0)("../../core/Application.js") ;
	var caches = caches || require("octemplate") ;

	// 增加 <view>, <assets>, <msq> 等标签
    caches._generator && caches._generator.registerShaderDefine((require||0)("./shaders/view.js")) ;
    caches._generator && caches._generator.registerShaderDefine((require||0)("./shaders/assets.js")) ;

	// 覆盖 template 方法
	var originTemplateMethod = caches.template ;
	caches.template = function(filename,callback,from)
	{
		var caches = this ;
		return originTemplateMethod.call(this,filename,function(err,tpl,iscache){

			tpl && (tpl.filename=filename) ;

			if( tpl && Application.singleton.config.dev.watching.template && !iscache )
			{
				// 写入文件后，从文件加载，便于bug
				var originCompile = tpl.compile ;
				tpl.compile = function(){
					originCompile.apply(this,arguments) ;

					var _path = require('path') ;
					var fs = require('fs') ;

					var code = this.exportRenderer() ;
					var ocroot = process.cwd() ;
					var path = ocroot + '/bin/' + _path.relative(ocroot+'/node_modules',this.filePath) + '.js' ;

					// 递归创建目录
					(function mkdirRecursion(path)
					{
						if( fs.existsSync(path) )
						{
							return ;
						}
						var parent = _path.dirname(path) ;
						if( !fs.existsSync(parent) )
						{
							mkdirRecursion(parent) ;
						}
						fs.mkdirSync(path) ;
					})(_path.dirname(path)) ;

					// 写入文件
					fs.writeFileSync(path,"module.exports = "+code) ;

					// 重新从文件里加载
					this.renderer = require(path) ;

					//console.log("write template renderer function into file: "+path) ;
				}

				tpl.watching() ;
			}

			callback && callback(err,tpl) ;

		},from) ;
	}

	return caches ;
}


exports.initForFrontend = function(caches)
{
    var caches = caches || require("octemplate") ;

	caches._tempateclass = require("../../../public/lib/oc/mvc/ViewTemplate.js") ;

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