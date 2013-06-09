var Store = require('connect/lib/middleware/session/store');

module.exports = function()
{}

module.exports.prototype.__proto__ = Store.prototype ;

module.exports.prototype.get = function(sid,callback)
{
    helper.db.coll("sessions").find({'_id':sid},function(err,cursor){
		if(err)
		{
			callback && callback(err) ;
			return ;
		}
		cursor.toArray(function(err,docs){
			if(err)
			{
				callback && callback(err) ;
				return ;
			}

			callback && callback(null,docs[0]) ;
		}) ;
	}) ;
}

module.exports.prototype.set = function(sid, session, callback)
{
	session._id = sid ;

    helper.db.coll("sessions").save(session, {safe:true}, callback);
}

module.exports.prototype.destroy = function(sid, callback)
{
    helper.db.coll("sessions").findAndRemove({_id:sid}, {safe:true}, callback);
}