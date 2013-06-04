module.exports = {
	
	layout: "controlpanel"
	, view: "opencomb/templates/usr/GroupList.html"
	, process: function(seed,nut,earth)
	{
		earth.hold().db.collection("opencomb/groups")
			.find()
			.sort({path:-1})
			.toArray(function(err,docs){
				err && console.log(err) ;
				nut.model.groups = docs ;
				earth.release() ;
			}
		) ;
	
		return true ;
	}
	, viewIn: function()
	{
		$(".show-group-id").popover() ;
		
		$(".delete-group").click(function(){
			
			$(this).request(null,function(err,nut){
				err && console.log(err) ;
				nut.message.popup() ;
				if(nut.model.success)
				{
					$(this).remove() ;
				}
			}) ;
			
		}) ;
	}
	
	, actions: {
	
		form: {	
			layout: "controlpanel"
			, view: "opencomb/templates/usr/GroupForm.html"
			, process: function(seed,nut,earth)
			{
				module.exports.action("form").former().load(earth) ;
			
				return true ;
			}
		}
		, save: {
			layout: "controlpanel"
			, process: function(seed,nut,earth)
			{
			
				this.step(function(){
						
				}).step(function(){
					
				}) ;
					
			
				var path = "/" ;
				if( seed.parent )
				{
					earth.hold().db.collection("opencomb/groups").findOne(
						{ _id: earth.db.objectId(seed.parent) }
						,function(err,doc){
							err && console.log(err) ;
							earth.release() ;
						}
					) ;
				}
				else
				{
					
				}
			
				module.exports.action("form").former().save(
					earth
					, function(doc){
					}
				) ;
				return true ;
			}
		}
		
		, del: function(seed,nut,earth)
		{
			if(!seed._id)
			{
				nut.message("missing arg: _id",null,"error") ;
				return true ;
			}
			
			// 检查下级用户组
			// todo
			
			
			earth.hold().db.collection("opencomb/groups").remove(
				{ _id: earth.db.objectId(seed._id) }
				, function(err,aff)
				{
					err && console.log(err) ;
					if(aff)
					{
						nut.message("用户组删除成功") ;
						nut.model.success = true ;
						
						// 清理用户表信息
						// todo
					}
					else
					{
						nut.message("删除用户组时遇到系统错误") ;						
					}
					
					earth.release() ;
				}
			) ;
			
		}
	}
	
}

module.exports.__as_controller = true ;