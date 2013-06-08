var RenderBuffer = require("./RenderBuffer.js") ;
var utilarray = require("../../util/array.js") ;


module.exports =function(){
    this.css = [] ;
}

module.exports.prototype = new RenderBuffer ;

module.exports.prototype.putin = function(url)
{
    if( !utilarray.search(this.css,url) )
    {
        this.css.push(url) ;
    }
}

module.exports.prototype.toString = function()
{
    var html = '' ;
    for(var i=0;i<this.css.length;i++)
    {
        html+= '	<link type="text/css" href="'+this.css[i]+'" rel="stylesheet">\r\n' ;
    }
    return html ;
}
