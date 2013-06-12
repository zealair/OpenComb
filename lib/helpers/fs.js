var fs = require("fs") ;
var path = require("path") ;

exports.__proto__ = fs ;

exports.mv = function(source,destination,callback)
{
    fs.rename( source, destination, function(err){

        // 不同分区中的文件不能使用 rename
        if( err )
        {
            if(err.code=='EXDEV')
            {
                util.pump(
                    fs.createReadStream(source)
                    , fs.createWriteStream(destination)
                    , this.hold(function(err) {
                        if(err)
                        {
                            callback(err) ;
                            return ;
                        }
                        fs.unlink(source,callback) ;
                    })
                );
            }
            else
            {
                callback(err) ;
                return ;
            }
        }
        else
        {
            callback(null) ;
        }
    }) ;
}

exports.mkdirr = function(folder,mode,callback)
{
    fs.exists(folder,function(exists){
        if(exists)
        {
            callback && callback(null) ;
        }
        else
        {
            exports.mkdirr(path.dirname(folder),mode,function(err){
                if(!err)
                {
                    fs.mkdir(folder,mode,callback) ;
                }
                else
                {
                    callback && callback(err) ;
                }
            })
        }
    }) ;
}


exports.mkdirrSync = function(folder,mode)
{
	if(fs.existsSync(folder))
	{
		return ;
	}

	else
	{
		exports.mkdirrSync(path.dirname(folder),mode) ;

		fs.mkdirSync(folder,mode) ;
	}
}

exports.factory = function(app,package,module)
{
    return exports ;
}