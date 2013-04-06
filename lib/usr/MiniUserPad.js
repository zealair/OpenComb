
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

				var data = $(".miniuserpad-login").serializeArray() ;

				$.request(
					{
						url: 'ocPlatform/lib/usr/SignIn:submit'
						, data: data
						, type: 'post'
					}
					, function(err,nut){
						if(err)
						{
							console.log(err) ;
						}

						nut.msgqueue.popup() ;

						if( nut.model.signined )
						{
							view.reload() ;
						}
					}
				) ;

			}) ;
		}

		, viewOut: function()
		{
			var utilstring = require('ocPlatform/lib/util/string.js') ;
			console.log('view out:',__filename,utilstring.sprintf("xxx,%d",2)) ;
		}

	}
}