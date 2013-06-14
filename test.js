var m = require("module") ;

var ful = require.resolve("./test-b.js") ;
var b = require("./test-b.js") ;
delete require.cache[ful] ;
var b = require("./test-b.js") ;
delete require.cache[ful] ;

var b = require("./test-b.js") ;