var md5 = require("ocplatform/lib/util/md5.js") ;
var mongodb = require("mongodb") ;

exports.onload = function(platform)
{
	// 数据表 建立索引, 创建默认账号
	platform.on('openDB',function(err,client){

		if(err || !client)
		{
			return ;
		}
		
		// 插入 root 账号
		(new mongodb.Collection(client,'ocplatform/users')).insert(
			{username:'root',password:md5('111111')}
			, {safe:true}
			, function(err)
			{
				if(!err)
				{
					console.log("创建默认账号:root,密码:111111") ;
				}
			}
		) ;

		//
		function callback(err){ err && console.log(err) ; }
		client.ensureIndex('ocplatform/users',{username:-1},  {background: true,unique:true}, callback) ;
		client.ensureIndex('ocplatform/users',{nickname:-1},  {background: true}, callback) ;
		client.ensureIndex('ocplatform/users',{groups:-1},  {background: true}, callback) ;
		client.ensureIndex('ocplatform/groups',{path:-1}, {background: true}, callback) ;
	}) ;

}