
exports.buildViewFromTemplate = function(tpl){

}

var TemplateParser = require("ocTemplate/lib/Parser.js") ;

exports.parser = new TemplateParser() ;

var shaderView = require("./shaders/view") ;
exports.parser.registerShaderFunction(shaderView.selector,shaderView.shader) ;