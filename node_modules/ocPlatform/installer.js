module.exports = {

	process: function(seed,nut,app){

		// 建立索引
		app.db.collection("users","ocPlatform").ensureIndex({username:1},{unique:true}) ;

		nut.model.completed = true ;

		return ;
	}

}