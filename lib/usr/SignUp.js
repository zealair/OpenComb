var md5 = require("opencomb/lib/util/md5.js") ;

module.exports = {

	view: "opencomb/templates/usr/SignUp.html"

	, actions:
	{
		save: function(seed,nut,earth)
		{
			if(!seed.username || !seed.password)
			{
				nut.message("请输入用户名和密码。",[],"error") ;
				return true ;
			}
			if( seed.password!=seed['password_repeat'])
			{
				nut.message("两次密码输入不一致",[],"error") ;
				return true ;
			}

			// 检查重复
			earth.hold().db.collection("opencomb/users").findOne({username:seed.username},function(err,doc){

				if(err)
				{
					nut.message("系统遇到了错误，无法完成用户注册程序",[],"error") ;
					console.log(err) ;
				}

				else
				{
					if(doc)
					{
						nut.message("用户名已经存在，请换用其他的用户名。",[],"error") ;
					}
					else
					{
						earth.hold() ;

						module.exports.former().save(
							earth
							,function(doc){
								delete doc['password_repeat'] ;
								doc.password = md5(doc.password) ;
								doc.nickname || (doc.nickname=doc.username) ;
								doc.createTime = (new Date()).toISOString() ;
							}
							, function(err,doc){
								if(err)
								{
									console.log(err) ;
								}
								if(doc)
								{
									nut.message("注册成功",[],"success") ;
								}
								else
								{
									nut.message("用户注册遇到了错误",[],"error") ;
								}

								earth.release() ;
							}
						) ;
					}
				}

				earth.release() ;
			})
			return true ;
		}
	}
}


module.exports.__as_controller = true ;