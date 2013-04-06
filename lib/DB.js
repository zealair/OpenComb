var mongodb = require('mongodb');

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