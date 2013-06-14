var _datatypes = [] ;
for(var i=0;i<_datatypes.length;i++)
	exports[_datatypes[i]] = require("./"+_datatypes[i]+".js") ;