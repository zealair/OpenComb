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
		return new mongodb.ObjectID(stringId) ;
	} catch(e) {
		return null ;
	}
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

				docs.total = pages ;
				docs.current = pageNum ;

				callback && callback(err,docs) ;
			}
		) ;

	}) ;
}