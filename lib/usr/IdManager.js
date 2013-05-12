
var IdManager = module.exports = function()
{
	this._ids = {} ;
	this._currentUsername = null ;
}

IdManager.prototype.signin = function(docId,asCurrent)
{
	this._ids[ docId.username ] = docId ;
	if(asCurrent)
	{
		this._currentUsername = docId.username ;
	}
}

IdManager.prototype.signout = function(username)
{
	delete this._ids[username] ;
	if(this._currentUsername==username)
	{
		this._currentUsername = Object.keys(this._ids).shift() || null ;
	}
}

IdManager.prototype.id = function(username)
{
	return this._ids[username] ;
}

IdManager.prototype.length = function(){
	return Object.keys(this._ids).length ;
} ;

IdManager.prototype.usernames = function(){
	return Object.keys(this._ids) ;
} ;

IdManager.prototype.current = function(){
	return this._ids[this._currentUsername] ;
} ;


module.exports.middleware = function(req,res,next)
{
	if(!req.session)
	{
		next() ;
		return ;
	}

	// 新建
	if(!req.session.idmgr)
	{
		req.session.idmgr = new IdManager ;
	}

	// 恢复
	else
	{
		req.session.idmgr.__proto__ = IdManager.prototype ;
	}

	next() ;
}