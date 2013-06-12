exports.md5 = require("../util/md5.js") ;
exports.string = require("../util/string.js") ;
exports.array = require("../util/array.js") ;

exports.factory = function(app,package,module)
{
	return exports ;
}