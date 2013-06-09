var log4js = require("log4js") ;

exports.factory = function(app,package,module)
{
    package.helpers || (package.helpers={}) ;

    if(!package.helpers.log)
    {
        var appenderConfig ={
            "type": "file",
            "filename": "log/"+package.name+".log",
            "maxLogSize": 20480,
            "backups": 3
        } ;

        // 使用 package.json 中的定义
        if( package.meta && package.logger && package.logger.appender )
        {
            package.logger.appender.__proto__ = appenderConfig ;
            appenderConfig = package.logger.appender ;
        }

        appenderConfig.category = package.name ;

        if(!package.helpers.log)
        {
            log4js.configure(
                {
                    "appenders": [
                        appenderConfig
                        , {
                            type: "console"
                            , category: package.name
                        }
                    ]
                }
                , {cwd:app.rootdir}
            ) ;
            package.helpers.log = log4js.getLogger(package.name);
        }
    }

    return package.helpers.log ;
}
