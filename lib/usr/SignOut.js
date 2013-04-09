module.exports = {

	process:function (seed, nut, earth)
	{
		nut.model.usernames = earth.req.session.idmgr.usernames() ;
		return true ;
	}

	, actions: {

		"do": function(seed, nut, earth)
		{
			var idmgr = earth.req.session.idmgr ;

			if(!idmgr.id(seed.username))
			{
				nut.message("无效的用户",[],"error") ;
				return true ;
			}

			idmgr.signout(seed.username) ;

			if( idmgr.current() )
			{
				nut.message("用户已退出，切换到%s的身份",[idmgr.current().username],"success") ;
			}

			else
			{
				nut.message("用户已退出",null,"success") ;
			}

			return true ;
		}

	}

	// 在前端执行的函数
	, frontend:
	{
		viewIn: function()
		{
			var view = this ;

			$('#btnSignOut').click(function(){
				var username = $("#selUsername").val() ;
				jQuery.request(

					"/ocplatform/lib/usr/SignOut:do?username="+username

					, {
						target:view

						, callback: function()
						{
							var userPanelView = jQuery("[controller='ocplatform/lib/usr/MiniUserPad.js']")[0] ;
							console.log(userPanelView) ;
							userPanelView && userPanelView.reload() ;
						}
					}

				) ;

			}) ;
		}
	}
}

module.exports.__as_controller = true ;