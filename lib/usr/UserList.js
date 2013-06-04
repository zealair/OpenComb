module.exports = {
	
	layout: "controlpanel"
	, view: "opencomb/templates/usr/UserList.html"
	, process: function(seed,nut,earth)
	{
		return true ;
	}

	, children: {
		
		page: {
			layout: "controlpanel"
			, view: "opencomb/templates/usr/UserListPage.html"
			, process: function(seed,nut,earth)
			{
				var condition = module.exports.former().doc(seed) ;
				for(var name in condition)
				{
					if(!condition[name])
					{
						delete condition[name] ;
					}
				}
			
				earth.hold().db.collection("opencomb/users").find(condition).page(20,seed.page,function(err,page){
					if(err)
					{
						console.log(err) ;
					}
					nut.model.page = page || {} ;
					earth.release() ;
				}) ;
				
				return true ;
			}
			
			, viewIn: function()
			{
				$(".show-user-id").popover({placement:"top"}) ;
				
				
				$(".show-user-detail").each(function(){
					$(this).popover({
						placement:"left"
						, html: true
						, title: "用户信息"
						, content: $(".user-detail[_id="+$(this).attr("_id")+"]").html()
					}) ;
				})
			}
		}
	}
	
	, actions: {
		
		view: {
			
			layout: "controlpanel"
			, view: "opencomb/templates/usr/UserView.html"
			, process: function(seed,nut,earth)
			{
				if(!seed._id)
				{
					nut.message("missing arg: _id",null,"error") ;
					nut.view.disable() ;
					return true ;
				}
				
				earth.hold().db.collection("opencomb/users")
						.findOne({_id:earth.db.objectId(seed._id)},function(err,doc){
							nut.model.user = doc ;
							earth.release() ;
						}
				) ;
				
				
				return true ;
				
			}
			
		}
		
	}
	
}

module.exports.__as_controller = true ;