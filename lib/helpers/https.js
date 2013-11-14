var https = require("https") ;
var httputil = require("./_httputil.js") ;

exports.getString = function(opts,cb) {
    return httputil.getString(https,opts,cb) ;
}

exports.getJSON = function(opts,cb) {
    return httputil.getJSON(https,opts,cb) ;
}

exports.factory = function(app,package,module)
{
    return exports ;
}
