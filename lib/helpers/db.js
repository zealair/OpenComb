var mongodb = require('mongodb');
var Cursor = require('mongodb/lib/mongodb/cursor').Cursor ;

exports.DB = function(client,collprefix)
{
    this.client = client ;
    this.collprefix = collprefix ;
}

exports.DB.prototype.coll = function(name)
{
	if(!this.client)
	{
		throw new Error("not connected to the db yet.") ;
	}
	return new mongodb.Collection(this.client,this.collectionName(name)) ;
}

exports.DB.prototype.id = function(stringId)
{
	try{
		return new mongodb.ObjectID(stringId.toString()) ;
	} catch(e) {
		return null ;
	}
}

exports.DB.prototype.ref = function(collName,id)
{
	try{
		return new mongodb.DBRef(this.collectionName(collName),id) ;
	} catch(e) {
		return null ;
	}
}

exports.DB.prototype.collectionName = function(name)
{
	if(name.search('/')<0)
	{
		return this.collprefix + name ;
	}
	else
	{
		return name ;
	}
}
exports.DB.prototype.autoIncreaseId = function(collName,docQuery,fieldName,callback)
{
	fieldName || (fieldName='id') ;
	if(!callback)
	{
		callback = function() {}
	}

	var inccoll = this.coll("ocframework/auto_increase_id") ;
	var db = this ;
	inccoll.findOne({_id:this.collectionName(collName)},function(err,doc){
		if(err)
		{
			callback && callback(err) ;
			return ;
		}

		function setField(){
			var data = {} ;
			data[fieldName] = newid ;
			db.coll(collName).update(docQuery,{$set:data},function(err,aff){
				callback && callback(err,newid) ;
			}) ;
		}

		if(doc)
		{
			var newid = ++doc.assigned ;
			inccoll.update({_id:collName},{$set:{assigned:newid}},setField) ;
		}
		else
		{
			var newid = 0 ;
			inccoll.insert({_id:collName,assigned:newid},setField) ;
		}

	}) ;
}

Cursor.prototype.page = function(perPage,pageNum,callback)
{
	pageNum || (pageNum=1) ;
	var cursor = this ;

	this.count(function(err,totalcount){

		if(err)
		{
			callback && callback(err) ;
			return ;
		}

		var pages = Math.ceil(totalcount/perPage) ;

		cursor.limit(perPage)
			.skip((pageNum-1)*perPage)
			.toArray(function(err,docs){
				if(err)
				{
					callback && callback(err) ;
					return ;
				}

				var page = {
					lastPage: pages
					, currentPage: pageNum
					, docs: docs
				}

				callback && callback(err,page) ;
			}
		) ;

	}) ;
}



exports.factory = function(app,package,module)
{
    package._helpers || (package._helpers={}) ;

    if(!package._helpers.db)
    {
        package._helpers.db = new exports.DB(exports._client,package.name+"/") ;
    }

    return package._helpers.db ;
}

exports.onregister = function(app,callback){

    if(!app.config.db || !app.config.db.server)
    {
        throw new Error("缺少数据库配置") ;
    }
    else
    {
        exports._dbserver = new mongodb.Server(app.config.db.server, app.config.db.port||27017) ;

	    console.log("connecting to database ...") ;
        (new mongodb.Db(app.config.db.name,exports._dbserver,{w:1})).open(function(err,client){

            if( err )
            {
                throw new Error("无法链接到数据库："+err) ;
            }

            exports._client =client ;

            callback && callback() ;
        }) ;

    }
}