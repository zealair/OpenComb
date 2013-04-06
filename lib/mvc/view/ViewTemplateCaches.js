var Class = require("ocClass/lib/Class.js") ;
var Template = require("ocTemplate/lib/Template.js") ;
var TemplateCaches = require("ocTemplate/lib/TemplateCaches.js") ;


module.exports = TemplateCaches.extend({
	ctor: function(templateClass,parser,generator)
	{
		if( typeof(window)=="undefined" )
		{
			var Platform = module['r'+'equire']("ocPlatform/lib/system/Platform.js") ;
			this.platformConfig = Platform.singleton? Platform.singleton.config: {} ;
		}
		else
		{
			this.platformConfig = {} ;
		}

		this._super( templateClass, parser||module.exports.parser, generator||module.exports.generator ) ;
	}

	, template: function(filename,callback,from)
	{
		var caches = this ;
		return this._super(filename,function(err,tpl,iscache){

			tpl && (tpl.filename=filename) ;

			if( tpl && caches.platformConfig.dev && caches.platformConfig.dev.watching.template && !iscache )
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

					console.log("write template renderer function into file: "+path) ;
				}

				tpl.watching() ;
			}

			callback && callback(err,tpl) ;

		},from) ;
	}
}) ;

// Parser ------------

var Parser = require("ocTemplate/lib/Parser.js") ;
var htmlParserConfig = Class.cloneObject(null,Parser.htmlParserFactoryConfig) ;
htmlParserConfig.stateMachines.StateTag.properties.emptyTags.view = 1 ;
htmlParserConfig.stateMachines.StateTag.properties.emptyTags.assets = 1 ;

module.exports.parser = new Parser(htmlParserConfig) ;


// Generator ------------
var Generator = require("ocTemplate/lib/Generator.js") ;
module.exports.generator = new Generator ;
module.exports.generator.registerShaderDefine(require("./shaders/view.js")) ;
module.exports.generator.registerShaderDefine(require("./shaders/assets.js")) ;



// singleton -----------
module.exports.singleton = function(instance)
{
	if(instance)
	{
		module.exports._singleton = instance ;
	}

	// 推迟到第一次访问的时候创建 singleton 对象
	// 避免在 “初始require链” 中过早创建对象
	if(!module.exports._singleton)
	{
		module.exports._singleton = new module.exports() ;
	}

	return module.exports._singleton ;
} ;


module.exports.__SHIPPABLE = true ;