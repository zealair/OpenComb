
(function($){


	function History()
	{
	}

	History.prototype.setup = function($)
	{
		$.history = this ;

		// state 事件
		window.onpopstate = function(e) {

			if(e.state)
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
			},null) ;
		}
	}

	History.prototype.addState = function(ajaxOpt,target)
	{

		// 根据 thenOpt.target 决定是否需要向 history 增加记录
		// thenOpt.target 在某个 layout 内， 则 thenOpt.target 为主视图 或 layout
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
				}
				, null
				, url
			) ;
		}
	}

})(jQuery) ;