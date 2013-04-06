var md5 = require("ocPlatform/lib/util/md5.js") ;

module.exports = {
	layout: "weblayout"
	, view: "ocPlatform/templates/usr/SignIn.html"
	, process: function(seed,nut,earth)
	{
		return true ;
	}

	, actions: {
		submit: function(seed,nut,earth)
		{
			nut.write("hi, "+seed.username) ;

			earth.collection("users","ocPlatform")
				.find({username:seed.username})
				.toArray(function(err,docs){

					if(err)
					{
						nut.message("系统遇到了错误。",null,'error') ;
						console.log(err.message) ;
						console.log(err.stack) ;

						earth.release() ;
						return ;
					}

					if(!docs.length)
					{
						nut.message("输入的用户名无效。",null,'error') ;
						earth.release() ;
						return ;
					}

					if( (docs[0].password||'') != (seed.password? md5(seed.password): '') )
					{
						nut.message("输入的密码不正确",null,'error') ;
						earth.release() ;
						return ;
					}

					earth.req.session.idmgr.signin(docs[0],true) ;

					nut.message("登陆成功 :)",null,'success') ;
					nut.model.signined = docs[0] ;

					earth.release() ;

				}) ;
		}
	}
}


module.exports.__as_a_controller = true ;