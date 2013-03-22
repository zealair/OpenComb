var Class = require("ocClass/lib/Class.js") ;
var Controller = require("ocPlatform/lib/mvc/Controller.js") ;
var View = require("ocPlatform/lib/frontend/mvc/View.js") ;
var Switch = require("ocPlatform/lib/frontend/mvc/Switch.js") ;

var Director = module.exports = Class.extend({

	ctor: function($document)
	{
		this.$document = $document || $(document) ;
		this._request = null ;
		this._targetview = null ;
	}

	, setup: function(selector,eventName)
	{
		// ----
		var director = this ;
		this.$document.on(eventName||"click",selector,function(){
			// 脚本
			var href = $(this).attr("href") ;
			if( /^\s*javascript\s*:/i.test(href) )
			{
				return ;
			}

			var direct = $(this).attr("direct") ;
			switch(direct)
			{
				case '_view' :
					director._targetview = $(this).parents(".ocview")[0] ;
					break ;

				case '_layout' :
					director._targetview = $($(this).parents(".oclayout")[0])
													.find(".ocview")[0] ;
					break ;

				case '_smart' :

					break ;

				// nothing todo ...
				default :
					return ;
			}

			if(director._targetview)
			{
				director.request(href) ;
				return false ;
			}
			else
			{
				console.log("warning: "+this.tagName+"标签的direct无效",this) ;
			}
		}) ;
	}

	, request: function(controller)
	{
		if(this._request)
		{
			this._request.abort() ;
		}

		var director = this ;
		$.ajax({
			url: controller
			, data: "@render=false&@layout=false"
			, dataType: "json"
			, success: function(output)
			{
				Controller.Output.restore(output,function(err,output){
					if(err)
					{
						throw err ;
					}

					console.log(output) ;
					output.assembleView().render(function(err,buff){

						// 创建视图
						var view = $(buff.toString()) ;
						View.buildView(view) ;

						Switch.replacein(view[0],director._targetview) ;
					}) ;
				}) ;
			}
			, beforeSend: function(req)
			{
				director._request = req ;
			}
		}) ;
	}

},{


}) ;