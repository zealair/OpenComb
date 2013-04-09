
module.exports = {

	process: function(seed,nut,earth)
	{
		nut.model.currentId = earth.req.session.idmgr.current() ;
		nut.model.usernames = earth.req.session.idmgr.usernames() ;

		return true ;
	}

	// 在前端执行的函数
	, frontend: {

		viewIn: function()
		{
			console.log('view in:',__filename) ;

			var view = this ;

			$(".miniuserpad-btn-signin").click(function(){
				$(".miniuserpad-login").request(
					{
						url: 'ocplatform/lib/usr/SignIn:submit'
						, type: 'post'
					}
					, function(err,nut){
						if(err)
						{
							console.log(err) ;
						}

						nut.msgqueue.popup() ;

						// 触发 userIdChanged 事件
						if( nut.model.signined )
						{
							$(window).trigger('userIdChanged',{
								before: nut.model.before
								, now: nut.model.now
							}) ;
						}
					}
				) ;
			}) ;

			// 用户退出点击
			$(".logout-username").click(function(){

				$(this).request({},function(err,nut){
					if(err)
					{
						console.log(err) ;
					}

					nut.msgqueue.popup() ;

					// 触发 userIdChanged 事件
					$(window).trigger('userIdChanged',{
						before: nut.model.before
						, now: nut.model.now
					}) ;
				}) ;

				return false ;
			})

			// 用户身份更换事件
			var userIdChangedHandle = function(data)
			{
				console.log(arguments)
				view.reload() ;
			}
			$(this).data('userIdChangedHandle',userIdChangedHandle) ;
			$(window).on('userIdChanged',userIdChangedHandle) ;
		}

		, viewOut: function()
		{
			var utilstring = require('ocplatform/lib/util/string.js') ;
			console.log('view out:',__filename,utilstring.sprintf("xxx,%d",2)) ;


			// 注销事件
			var userIdChangedHandle = $(this).data('userIdChangedHandle') ;
			$(window).off('userIdChanged',userIdChangedHandle) ;

		}

	}
}

module.exports.__as_controller = true ;