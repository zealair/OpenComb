var log4js = require("log4js") ;

exports.factory = function(app,package,module)
{
    package.helpers || (package.helpers={}) ;

    if(!package.helpers.log)
    {
        package.helpers.log = log4js.getLogger(package.name);
    }

    return package.helpers.log ;
}

exports.onregister = function(app,callback)
{
    var configure = {
        appenders:[]
    }

    var setupeds = {} ;

    app.packages.eachPackage(function(package){
        if(setupeds[package.name])
        {
            return ;
        }
        setupeds[package.name] = 1 ;

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

        //
        configure.appenders.push(appenderConfig) ;
        configure.appenders.push({
            type: "console"
            , category: package.name
        }) ;
    }) ;

    log4js.configure(configure) ;
    callback() ;
}