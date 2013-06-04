var md5 = require("opencomb/lib/util/md5.js") ;

module.exports = {

	view: "opencomb/templates/usr/ModifyPassword.html"
	, process: function()
	{
		return true ;
	}
	
	, actions: {
		
		save: {
			process: function(seed,nut,earth)
			{
				var id = earth.req.session.idmgr.current() ;
				if(!id)
				{
					nut.message("请先登陆",null,"error") ;
					return true ;
				}
				
				var coll = earth.db.collection("opencomb/users") ;
				
				// 更新
				earth.hold() ;
				coll.findOne({_id:earth.db.objectId(id._id)},function(err,doc){
					if(err)
					{
						console.log(err) ;
					}
					
					if( !doc || md5(seed.oriPassword)!=doc.password )
					{
						nut.message("旧密码输入错误",null,"error") ;
					}
					
					else
					{
						earth.hold() ;	
						coll.update(
							{_id:earth.db.objectId(id._id)}
							, {$set:{password:md5(seed.password)}}
							, function(err,aff)
							{
								if(err)
								{
									console.log(err) ;
								}
								if(!aff)
								{
									nut.message("密码修改成功",null,"success") ;
								}
								else
								{
									nut.message("密码修改成功",null,"success") ;
								}
								earth.release() ;
							}
						)
					}
					
					earth.release() ;
				}) ;
						
				return true ;
			}
		}
	}
}

module.exports.__as_controller = true ;
