var RenderBuffer = require("./RenderBuffer.js") ;
var utilarray = require("../../util/array.js") ;

module.exports =function(){
    this.css = [] ;
    this.script = [] ;
}

module.exports.prototype.putin = function(url,type)
{
    type || (type = "css") ;
    if( !utilarray.search(this[type],url) )
        this[type].push(url) ;
}


module.exports.prototype.buffer = function(type)
{
    var buff = new RenderBuffer ;
    var assets = this[ type || (type='css') ] ;

    buff.toString = function()
    {
        var html = '' ;
        for(var i=0;i<assets.length;i++){
            if(type=='css')
                html+= '	<link type="text/css" href="'+assets[i]+'" rel="stylesheet">\r\n' ;
            else if(type=='script')
                html+= '	<script type="text/javascript" src="'+assets[i]+"\"></script>\r\n" ;
        }

        return html ;
    }

    return buff ;
}

