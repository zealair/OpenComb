global._ = require("./public/lib/3party/underscore-1.4.4.js") ;
require("./lib/core/reset.js") ;
var Application = require("./lib/core/Application.js") ;

exports.createApplication = function(rootFolder,config){
    return new Application(rootFolder||process.cwd(),config) ;
}