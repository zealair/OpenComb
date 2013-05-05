var mongodb = require('mongodb');
var Cursor = require('mongodb/lib/mongodb/cursor').Cursor ;

module.exports = function(dbclient)
{
	this.dbclient = dbclient ;
}

module.exports.prototype.collection = function(name,extname)
{
	if(!this.dbclient)
	{
		throw new Error("not connected to the db yet.") ;
	}

	if(extname)
	{
		name = extname + "/" + name ;
	}

	return new mongodb.Collection(this.dbclient,name) ;
}

module.exports.prototype.objectId = function(stringId)
{
	try{
		return new mongodb.ObjectID(stringId.toString()) ;
	} catch(e) {
		return null ;
	}
}

module.exports.prototype.ref = function(collName,id)
{
	try{
		return new mongodb.DBRef(collName,id) ;
	} catch(e) {
		return null ;
	}
}

module.exports.prototype.autoIncreaseId = function(collName,docQuery,fieldName,callback)
{
	fieldName || (fieldName='id') ;
	if(!callback)
	{
		callback = function() {}
	}

	var inccoll = this.collection("ocplatform/auto_increase_id") ;
	var db = this ;
	inccoll.findOne({_id:collName},function(err,doc){
		if(err)
		{
			callback(err) ;
			return ;
		}

		function setField(){
			var data = {} ;
			data[fieldName] = newid ;
			db.collection(collName).update(docQuery,{$set:data},callback) ;
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

				docs.total = totalcount ;
				docs.lastPage = pages ;
				docs.currentPage = pageNum ;

				callback && callback(err,docs) ;
			}
		) ;

	}) ;
}
