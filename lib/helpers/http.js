var http = require("http") ;
var httputil = require("./_httputil.js") ;

exports.__proto__ = http ;

exports.getString = function(opts,cb) {
    return httputil.getString(http,opts,cb) ;
}


exports.getJSON = function(opts,cb) {
    return httputil.getJSON(http,opts,cb) ;
}

exports.factory = function(app,package,module)
{
    return exports ;
}
