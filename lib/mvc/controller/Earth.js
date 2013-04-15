var querystring = require("querystring") ;
var Nut = require("./Nut.js") ;
var assert = require("assert") ;
var events = require("events") ;

module.exports = function(controller,req,rsp,platform)
{
	this.req = req ;
	this.rsp = rsp ;
	this.platform = platform || $opencomb || require('ocplatform/lib/system/Platform.js').singleton ;
	this.db = this.platform && this.platform.db ;

	// 创建并初始化 nut
	this.nut = new Nut(controller) ;

	// 创建 seed
	this.seed = {} ;

	this._holdCounter = 0 ;
	this._holdEventEmitter = new events.EventEmitter ;

	this._children = {} ;
}
//
//module.exports.buildControllerResponse = function(httpRspn){
//
//	if( httpRspn._isControllerResponse )
//	{
//		return httpRspn ;
//	}
//
//	httpRspn._isControllerResponse = true ;
//	httpRspn._locks = 0 ;
//
//	httpRspn.pause = function()
//	{
//		httpRspn._locks ++ ;
//	}
//	httpRspn.resume = function()
//	{
//		assert(httpRspn._locks>=1,"httpRspn._locks must be >0") ;
//
//		if( (--httpRspn._locks)<=0 )
//		{
//			this.emit("complete") ;
//		}
//	}
//
//	return httpRspn ;
//}

/**
 * 用http request 里的 Get/Post 数据填充 seed
 */
module.exports.prototype.fillSeedByReq = function()
{
	// get params
	var getparams = querystring.parse(this.req._parsedUrl.query||"") ;

	// post params
	if(this.req.body)
	{
		getparams.__proto__ = this.req.body ;
	}

	this.seed.__proto__ = getparams ;

	return this ;
}

module.exports.prototype.createChild = function(name,childController)
{
	var child = new module.exports(childController,this.req,this.rsp,this.platform) ;
	this._children[name] = child ;

	// 连接 nut
	this.nut._children[name] = child.nut ;

	// 从自己的seed 分离出 child 的seed
	child.seed = this.seed['@'+name] || {} ;

	return child ;
}

module.exports.prototype.collection = function(name,extname)
{
	if(!this.platform.db)
	{
		throw new Error("not connected to the db yet.") ;
	}
	return this.db.collection(name,extname) ;
}

module.exports.prototype.holdCount = function()
{
	return this._holdCounter ;
}
module.exports.prototype.hold = function()
{
	this._holdCounter ++ ;
	return this ;
}
module.exports.prototype.release = function()
{
	this._holdCounter -- ;

	if(this._holdCounter<0)
	{
		throw new Error("Earth.release() 调用次数多余 Earth.hold()") ;
	}
	else if(this._holdCounter==0)
	{
		this._holdEventEmitter.emit("complete",this) ;
	}

	this._holdEventEmitter.emit("_reduceTo"+this._holdCounter,this) ;

	return this ;
}
module.exports.prototype.onComplete = function(listener)
{
	this._holdEventEmitter.addListener("complete",listener) ;
	return this ;
}
module.exports.prototype.onReduceTo = function(counter,listener)
{
	this._holdEventEmitter.addListener("_reduceTo"+(counter===null?this._holdCounter:counter),listener) ;
	return this ;
}


module.exports.prototype.destroy = function()
{
	this.req = null ;
	this.rsp = null ;
	this.platform = null ;

	for(var name in this._children)
	{
		this._children[name].destroy() ;
		this._children[name] = null ;

		this.seed['$'+name] = null ;
	}
	this._children = null ;



	this.nut.destroy() ;
	this.nut = null ;
	this.seed = null ;
}