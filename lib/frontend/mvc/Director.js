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

			var direct = $(this).attr("direct") || "lazy" ;
			switch(direct)
			{
				case 'view' :
					director._targetview = $(this).parents(".ocview")[0] ;
					director.request(href,{"@layout":false}) ;
					break ;


				case 'top' :
					director._targetview = $($(this).parents(".oclayout")[0])
													.find(".ocview")[0] ;
					director.request(href,{"@layout":false}) ;
					break ;


				case 'lazy' :
					var sumsigns = [] ;
					$("[sumsign]").each(function(){
						sumsigns.push( $(this).attr("sumsign") ) ;
					}) ;
					director._targetview = null ;
					director.request(href,{"@sumsigns":sumsigns}) ;
					break ;

				case 'none' :
				default :
					console.log("warning: "+this.tagName+"标签的direct无效",this) ;
					return ;
			}
		}) ;
	}

	, request: function(controller,data)
	{
		data = data || {}
		data["@render"] = false ;

		if(this._request)
		{
			this._request.abort() ;
		}

		var director = this ;
		$.ajax({
			url: controller
			, data: data
			, dataType: "json"
			, success: function(output)
			{
				Controller.Output.restore(output,function(err,output){
					if(err)
					{
						throw err ;
					}

					console.log(output) ;

					if( !director._targetview )
					{
						director._targetview = (function findAvailLayout( output )
						{
							if( output._children && output._children.layout )
							{
								var $layout = $("[sumsign="+output._children.layout.sumsign+"]") ;
								// bingo !
								if( $layout.length )
								{
									if( output._children.layout._children && output._children.layout._children.layout)
									{
										output._children.layout._children.layout = undefined ;
									}

									// just here !
									return $layout[0] ;
								}
								else
								{
									return findAvailLayout(output._children.layout) ;
								}
							}

							return null ;
						}) (output) ;
					}

					if(!director._targetview)
					{
						// 最上层的 ocview
						director._targetview = $(".ocview")[0] ;
					}

					output.assembleView().render(function(err,buff){

						// 创建视图
						var $view = $(buff.toString()) ;
						View.buildView($view[0]) ;

						Switch.replacein($view[0],targetview) ;
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