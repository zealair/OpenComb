var Template = require("ocTemplate/lib/Template.js") ;
var ViewTemplateCaches = require("ocPlatform/lib/mvc/view/ViewTemplateCaches.js") ;

module.exports = Template.extend({

	load: function(callback)
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

	, _readTemplateFile: function()
	{
		var ele = document.createElement("script") ;
		ele.src = "/shipdown:tpl/" + this.filePath ;
		ele.type = "text/javascript" ;
		document.head.appendChild(ele) ;
	}

}) ;



// caches ---------------------------
module.exports.Caches = ViewTemplateCaches.extend({

	ctor: function(){
		this._super.apply(this,arguments) ;
		this._tempateclass = module.exports ;
	}

	, resolve: function(filename)
	{
		return filename ;
	}

	, downloaded: function(err,path,renderer)
	{
		var tpl = this.cache(path) ;
		if(!tpl)
		{
			throw new Error("服务器返回了无效的模板："+path) ;
		}

		tpl.renderer = renderer ;
		tpl._loadDone(err) ;
	}

}) ;


// module.exports.Caches.singleton = new module.exports.Caches ;


module.exports.__SHIPPABLE = true ;
