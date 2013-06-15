var fs = require("./fs") ;
var path = require("path") ;

exports.factory = function(app,package,module)
{
	package._helpers || (package._helpers={}) ;

	if(!package._helpers.log)
	{
		// 清理 log4js 模块缓存以便创建独立的log4js模块
		var log4jsfullpath = require.resolve("log4js") ;
		var oriModCache = require.cache[log4jsfullpath] ;
		delete require.cache[log4jsfullpath] ;

		var log4js = require("log4js") ;

		// 还原模块缓存
		if(oriModCache)
		{
			require.cache[log4jsfullpath] = oriModCache ;
		}

		var defaultAppender = {
			"type": "file",
			"filename": "log/"+package.name+".log",
			"maxLogSize": 20480,
			"backups": 3,
			"category": package.name
		}


		// 使用 package.json 中的定义
		if( package.meta && package.meta.logger )
			config = package.meta.logger

		// default
		else
		{
			config = {
				appenders: [
					{
						"type": "console"
						, "category": package.name
					}
					, defaultAppender
				]
			}
		}

		// 搜集 config 中的 category
		var categories = {} ;
		if(config.appenders)
		{
			for(var i=0;i<config.appenders.length;i++)
			{
				// 创建 log 目录
				if(config.appenders[i].filename)
				{
					var logfile = app.rootdir + "/" + config.appenders[i].filename ;
					fs.mkdirrSync( path.dirname(logfile), 0777 ) ;
				}

				if(typeof config.appenders[i].category=='string')
				{
					categories[config.appenders[i].category] = 1 ;
				}
				else if(config.appenders[i].category && config.appenders[i].category.constructor===Array)
				{
					for(var l=0;l<config.appenders[i].category.length;l++)
					{
						categories[config.appenders[i].category[i]] = 1 ;
					}
				}
			}
		}

		// 默认 category
		if(!categories[package.name])
		{
			config.appenderss.push(defaultAppender) ;
		}

		// congirure
		log4js.configure(config) ;

		// create 默认 category
		package._helpers.log = function(categoryName){
			if( !package._helpers.log[categoryName] )
			{
				package._helpers.log[categoryName] = log4js.getLogger(categoryName) ;
			}
			return package._helpers.log[categoryName] ;
		}
		package._helpers.log.__proto__ = log4js.getLogger(package.name) ;
		delete categories[package.name] ;

		// create 其他 category
		for(var name in categories)
			package._helpers.log[name] = log4js.getLogger(name) ;

		package._helpers.log.log4js = log4js ;
	}

	return package._helpers.log ;
}
