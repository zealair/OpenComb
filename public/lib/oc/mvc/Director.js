var Class = require("occlass/lib/Class.js") ;
var View = require("ocplatform/public/lib/oc/mvc/View.js") ;
var Nut = require("ocplatform/lib/mvc/controller/Nut.js") ;
var Step = require("step") ;
var utilstr = require("ocplatform/lib/util/string.js") ;

(function(jQuery){

	function Director($document)
	{
		this.$document = $document || jQuery(document) ;
		this._request = null ;
	}

	Director.prototype.setup = function($)
	{
		var director = this ;

		// 当前网页中的元素事件
		function onRequestElement()
		{
			window.event && (window.event.returnValue=false) ;

			jQuery(this).request() ;

			// 取消浏览器默认行为
			return false ;
		}

		// for link(a tag)
		this.$document.on("click","a[direct]",onRequestElement) ;

		// for form
		this.$document.on("submit","form[direct]",onRequestElement) ;

		// state 事件
		window.onpopstate = function(e) {

			if(e.state && e.state.ocstate)
			{
				director.request(
					{
						url: e.state.url
						, data: e.state.data || {}
					}
					, {
						target: 'lazy'
						, history: false
					}
				) ;
			}
		} ;

		// 处理首次请求
		if( window.history.replaceState )
		{
			window.history.replaceState({
				url: location.pathname
				, data: queryStrings(location.search)
				, ocstate: true
			},null) ;
		}
	}

	/**
	 * 根据传入的 "then" 参数，构建 ajax 对象
	 */
	Director.buildParamThen = function(then,element)
	{
		if(then===undefined)
		{
			then = 'lazy' ;
		}

		var type = typeof then ;
		if( type=='string' )
		{
			then = {
				target: then || 'direct'
			}
		}
		else if( type=='function' )
		{
			then = {
				callback: then
			}
		}

		// 一个document中的有效元素
		else if( then && then.ownerDocument )
		{
			then = {
				target: then
			}
		}
		else if( type!='object' )
		{
			console.log("you give me a inavlid param 'then'") ;
			return {} ;
		}

		if( typeof then.target=='string' )
		{
			switch(then.target)
			{
				case 'view' :
					if(element)
					{
						then.target = jQuery(element).parents(".ocview")[0] || null ;
					}
					else
					{
						then.target = null ;
					}
					break ;

				case 'top' :
					then.target = jQuery(jQuery(ele).parents(".oclayout")[0]).find(".ocview")[0] || null ;
					break ;

				case 'lazy' :
				case 'direct' :
				case 'default' :
					then.target = null ;
					break ;

				// selector
				default:
					then.target = jQuery(then.target)[0] || null ;
					break ;
			}
		}

		return then ;
	}

	/**
	 * 向服务器发送请求，并从服务器取回 nut 对象
	 */
	Director.prototype.request = function(ajaxOptions,thenOptions)
	{
		if(!ajaxOptions)
		{
			throw new Error("missing param ajaxOptions") ;
		}
		if(typeof ajaxOptions=='string')
		{
			ajaxOptions = {
				url: ajaxOptions
			}
		}
		if(!ajaxOptions.url || ajaxOptions.url[0]=='#')
		{
			console.log("ignore a empty url request") ;
			return ;
		}
		// 将 controllerpath 形式，转换为"/"开头的url绝对路径
		if( ! /^(https?:\/\/|\/)/.test(ajaxOptions.url) )
		{
			ajaxOptions.url = '/' + ajaxOptions.url ;
		}

		var director = this ;

		// 构建 then 参数
		thenOptions = Director.buildParamThen(thenOptions) ;

		var ajax = ajaxOptions || {} ;
		ajax.dataType = 'json' ;
		ajax.beforeSend = function(req)
		{
			// 一次只请求一个视图
			if(director._request)
			{
				director._request.abort() ;
			}

			// 显示 loading
			director.showViewLoading() ;

			// this time
			director._request = req ;
		} ;

		// ajax data
		ajax.data = ajax.data || {} ;
		if( ajax.data.constructor===Array )
		{
			var data = {} ;

			// 来自 jQuery.serializeArray() 返回的数组
			if( ajax.data.length && typeof ajax.data[0].name && typeof ajax.data[0].value )
			{
				jQuery.each( ajax.data, function(i, field){
					data[field.name] = field.value ;
				});
			}

			for(var name in ajax.data)
			{
				// include length property of Array
				if( ! /^[0-9]+$/.test(name) )
				{
					data[name] = ajax.data[name] ;
				}
			}

			ajax.data = data ;
		}

		// 根据 thenOptions.target 为 lazy 模式，且 ajaxOptions中未指定 @layout
		if( thenOptions.target!==null && !ajax.data["@layout"] )
		{
			ajax.data["@layout"] = false ;
		}

		// 如果需要执行 layout, 则提供 sumsign
		if( ajax.data["@layout"]!==false )
		{
			ajax.data["@sumsigns"] = [] ;
			jQuery(".oclayout[sumsign]").each(function(){
				ajax.data["@sumsigns"].push( jQuery(this).attr("sumsign") ) ;
			}) ;
			ajax.data["@sumsigns"] = ajax.data["@sumsigns"].length? ajax.data["@sumsigns"].join(','): undefined ;
		}

		ajax.data["@render"] = false ;

		var callback = ajax.success ;
		ajax.success = function(nut)
		{
			callback && callback.apply(this,arguments) ;

			Nut.restore(nut,function(err,nut){

				if(err)
				{
					thenOptions.callback && thenOptions.callback(err) ;
					throw err ;
				}

				director.then(nut,thenOptions,ajax) ;
			}) ;
		}

		var cusComplete = ajax.complete ;
		ajax.complete = function()
		{
			// 关闭 loading
			director.hideViewLoading() ;

			cusComplete && cusComplete.apply(this,arguments) ;
		}

		ajax.error = function(err)
		{
			callback && callback.apply(this,arguments) ;
		}



		// 发送请求
		return jQuery.ajax(ajax) ;
	}


	/**
	 * 在 Director.request() 从服务器取得 nut 后，
	 * 接着处理后续事务
	 */
	Director.prototype.then = function(nut,thenOpt,ajaxReq)
	{
		if(thenOpt.target===null)
		{
			thenOpt.target = this.compareLayoutStruct(nut) ;
		}

		// 根据 thenOpt.target 决定是否需要向 history 增加记录
		// thenOpt.target 在某个 layout 内， 则 thenOpt.target 为主视图 或 layout
		// （todo:这个部分应该专门设计一个对象来负责）
		if( thenOpt.history!==false && thenOpt.target && jQuery(thenOpt.target).parent().hasClass('oclayout-container') )
		{
			// console.log(ajaxReq) ;
			var info = utilstr.parseUrl(ajaxReq.url) ;
			var search = [] ;
			for(var name in info.params)
			{
				if(name[0]!='@')
				{
					search.push( name+'='+info.params[name] ) ;
				}
			}
			if(ajaxReq.data)
			{
				for(var name in ajaxReq.data)
				{
					if(name[0]!='@')
					{
						search.push( name+'='+ajaxReq.data[name] ) ;
					}
				}
			}
			var url = info.protocol + '://' + info.host + (info.port? (':'+info.port):'') + info.path ;
			if( search.length )
			{
				url+= '?' + search.join('&') ;
			}
			// console.log("history",ajaxReq.url,ajaxReq.data,'=>',url) ;

			window.history.pushState && window.history.pushState(
				{
					url: url
					, data: ajaxReq.data
					, type: ajaxReq.type
					, ocstate: true
				}
				, null
				, url
			) ;
		}


		// 剥开果壳 :)
		nut.crack(function(err,html){
			if(err)
			{
				console.log(err.message) ;
				console.log(err.stack) ;

				thenOpt.callback && thenOpt.callback(err,nut) ;
				return ;
			}

			// 导入视图中引用的 css
			var assets = nut.view.assets ;
			for(var i=0;i<assets.css.length;i++)
			{
				var selector = "link[href='"+assets.css[i]+"']" ;
				if( !jQuery(selector).length )
				{
					jQuery(document.head).append('<link type="text/css" href="'+assets.css[i]+'" rel="stylesheet">') ;
				}
			}

			// 创建视图
			var $rootview = jQuery(html,document.ownerDocument) ;
			Step(
				function buildViews(){
					var group = this.group() ;

					$rootview.find('.ocview').andSelf().each(function(){
						View.buildView(this,jQuery.shipper,group()) ;
						this.nut = nut ;
						this.ajaxOpt = ajaxReq ;
					}) ;
				}
				, function placeInViews(err){
					if(err)
					{
						console.log(err) ;
						thenOpt.callback && thenOpt.callback(err,nut,$rootview) ;
					}

					// 切换视图
					if( thenOpt.target )
					{
						$.switcher.replacein(undefined,$rootview[0],thenOpt.target,this) ;
					}
					else
					{
						return 1 ;
					}
				}

				, function done(err){
					if(err)
					{
						console.log(err.stack) ;
					}
					thenOpt.callback && thenOpt.callback(err,nut,$rootview) ;
				}
			)

		}) ;
	}

	/**
	 * 比较 nut 中的layout结构 和 当前浏览器中的layout结构，
	 * 确定哪些 layout 不需要被更新，
	 * 一旦确定，无需更新的layout信息会从 nut 中移除，
	 * 返回需要更新的最外层视图
	 */
	Director.prototype.compareLayoutStruct = function(nut)
	{
		var target = (function findAvailLayout( nut )
		{
			if( nut._children && nut._children.layout )
			{
				var $layout = jQuery("[sumsign="+nut._children.layout.model['$sumsign']+"]") ;
				// bingo !
				if( $layout.length )
				{
					delete nut._children.layout ;

					// just here !
					return $layout.find(".oclayout-container>.ocview")[0] ;
				}
				else
				{
					return findAvailLayout(nut._children.layout) ;
				}
			}

			return null ;
		}) (nut) ;

		// 返回找到的，或最上层的 ocview
		return target || jQuery(".ocview")[0] ;
	}

	Director.prototype.showViewLoading = function()
	{
		this.viewLoadingWidget().show() ;
		return this ;
	}

	Director.prototype.hideViewLoading = function()
	{
		this.viewLoadingWidget().hide() ;
		return this ;
	}

	Director.prototype.viewLoadingWidget = function()
	{
		var $widget = jQuery(".ocview-loading") ;
		return $widget.length? $widget: this.createViewLoading() ;
	}

	Director.prototype.createViewLoading = function()
	{
		var $widget = jQuery('<div class="ocview-loading" style="position: fixed; z-index: 1000"><img src="/ocplatform/public/style/images/loader_light.gif" ></div>')
						.appendTo(document.body) ;

		function loadingPlace()
		{
			$widget.css({
				left: '10px'
				, top: (jQuery(window).height() - $widget.height() - 25 ) + 'px'
			}) ;
		}

		loadingPlace () ;
		jQuery(window).resize(loadingPlace) ;

		return $widget ;
	}

	var queryStrings=function(query) {
		var params=query,reg=/(?:^\?|&)(.*?)=(.*?)(?=&|$)/g,temp,args={};
		while((temp=reg.exec(params))!=null) args[temp[1]]=decodeURIComponent(temp[2]);
		return args;
	};



	// -----------------------------------------------------------------
	// jQuery plugin functions
	//
	jQuery.director = new Director() ;

	/**
	 * jQuery.director.request() 的别名
	 */
	jQuery.request = function()
	{
		return this.director.request.apply(this.director,arguments) ;
	}

	jQuery.controller = function(url,data,thenOpts)
	{
		var ajaxOpts = typeof url=='string'? {url:url}: (url||{}) ;
		ajaxOpts.data = data ;

		jQuery.request(ajaxOpts,thenOpts) ;
	}

	jQuery.action = function(url,data,thenOpts)
	{
		if(!thenOpts)
		{
			thenOpts = {
				callback: function(err,nut)
				{
					if(err)
					{
						console.log(err) ;
					}
					nut.msgqueue && nut.msgqueue.popup() ;
				}
			}
		}
		else if( typeof thenOpts=='string' )
		{
			var selector = thenOpts ;
			thenOpts = {
				callback: function(err,nut)
				{
					if(err)
					{
						console.log(err) ;
					}
					nut.msgqueue && nut.msgqueue.renderAndAppendTo(selector) ;
				}
			}
		}

		var ajaxOpts = typeof url=='string'? {url:url}: (url||{}) ;
		ajaxOpts.data = data ;

		jQuery.request(ajaxOpts,thenOpts) ;
	}

	/**
	 * 这是一个 jQuery 函数
	 * use: jQuery('selector').request() ;
	 */
	jQuery.fn.request = function(ajaxOptions,thenOptions,asForm)
	{
		if( !this.length )
		{
			return ;
		}
		if( this.constructor!==jQuery )
		{
			throw new Error("$.fn.request() only called on a jQuery array") ;
			return ;
		}

		ajaxOptions = ajaxOptions || {} ;
		thenOptions = Director.buildParamThen(
						thenOptions || this.attr("direct")
						, this[0]
					) ;

		var tagName = this[0].tagName.toUpperCase() ;

		// 链接
		if( tagName == 'A' )
		{
			ajaxOptions.url = this.attr("href") || ajaxOptions.url ;
		}

		// 表单
		else if( tagName == 'FORM' || asForm || this.hasClass('form') )
		{
			ajaxOptions.url = this.attr("action") || ajaxOptions.url ;
			ajaxOptions.type = this.attr("method") || ajaxOptions.type || 'GET' ;
			ajaxOptions.contentType = this.attr("enctype") || ajaxOptions.contentType || "application/x-www-form-urlencoded" ;

			// jQuery.serializeArray() 仅对 form 有效
			ajaxOptions.data =  ajaxOptions.data || {} ;
			this.find('input[name],select[name],textarea[name],checkbox[name][checked]').each(function(){
				ajaxOptions.data[ jQuery(this).attr('name') ] = jQuery(this).val() ;
			}) ;
		}

		else
		{
			throw new Error("$.fn.request() only call as a method of A or FORM element") ;
			return ;
		}

		jQuery.director.request( ajaxOptions, thenOptions ) ;
	}



}) (jQuery) ;
