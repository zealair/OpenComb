var md5 = require("ocplatform/lib/util/md5.js") ;

module.exports = {

	view: "ocplatform/templates/usr/SignIn.html"

	, process: function(seed,nut,earth)
	{
		return true ;
	}

	, actions: {
		submit: function(seed,nut,earth)
		{
			nut.write("hi, "+seed.username) ;

			earth.collection("users","ocplatform")
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

					nut.model.before = earth.req.session.idmgr.current() ;

					earth.req.session.idmgr.signin(docs[0],true) ;

					nut.message("登陆成功 :)",null,'success') ;
					nut.model.signined = docs[0] ;
					nut.model.now = earth.req.session.idmgr.current() ;

					earth.release() ;

				}) ;
		}
	}
}


module.exports.__as_controller = true ;