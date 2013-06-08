var Template = require("octemplate/lib/Template.js") ;

module.exports = function(){}
module.exports.prototype = new Template ;

module.exports.prototype.load = function(callback)
{
    // 加载、分析 模板
    if(!this.loaded)
    {
        if(callback)
        {
            this.loadCallbacks.push(callback) ;
        }

        if(!this.loading)
        {
            this.loading = true ;
            this._readTemplateFile() ;
        }
    }

    //
    else
    {
        callback && callback(null,this) ;
    }

    return this ;
}

module.exports.prototype.load = _readTemplateFile = function()
{
    var ele = document.createElement("script") ;
    ele.src = "/shipdown:tpl/" + this.filePath ;
    ele.type = "text/javascript" ;
    document.getElementsByTagName("head")[0].appendChild(ele) ;
}


