var strutil = require("../util/string.js") ;
var View = require("./view/View.js") ;

var MessageQueue = module.exports = function()
{}
MessageQueue.prototype = [] ;

MessageQueue.prototype.createMessage = function(sentence,args,type,title)
{
	this.push(new MessageQueue.Message(sentence,args,type,title)) ;
}

MessageQueue.prototype.render = function(callback,tplname)
{
	var i = -1 ;
	var queue = this ;
	var msgbuffs = [] ;

	(function step(err,buff)
	{
		if(buff)
		{
			msgbuffs.push(buff) ;
		}

		if( err || (++i)>=queue.length )
		{
			callback(err,msgbuffs) ;
			return ;
		}

		queue[i].render( arguments.callee, tplname ) ;
	}) () ;
}

MessageQueue.prototype.renderAndAppendTo = function(eleOrSelector,callback,tplname)
{
	if(typeof window=='undefined')
	{
		throw new Error("MessageQueue.renderAndAppendTo() 只能在前端调用") ;
	}

	var ele = typeof(eleOrSelector)=="string"? $(eleOrSelector)[0]: eleOrSelector ;
	if(!ele)
	{
		console.log("参数无效：eleOrSelector") ;
		return ;
	}

	this.render(function(err,buffs){

		if(err)
		{
			console.log(err.message) ;
			console.log(err.stack) ;
			return ;
		}

		for(var i=0;i<buffs.length;i++)
		{
			$(ele).append( buffs[i].toString() ) ;
		}

		callback && callback() ;
	},tplname) ;
}

MessageQueue.prototype.popup = function(tplname)
{
	if(typeof window=='undefined')
	{
		throw new Error("MessageQueue::popup only call in frontend.") ;
	}

	for(var i=0;i<this.length;i++)
	{
		this[i].popup.apply(this[i],arguments) ;
	}
}

MessageQueue.restore = function(lst)
{
	for(var name in MessageQueue.prototype)
	{
		lst[name] = MessageQueue.prototype[name] ;
	}

	for(var i=0;i<lst.length;i++)
	{
		for(var name in MessageQueue.Message.prototype)
		{
			lst[i][name] = MessageQueue.Message.prototype[name] ;
		}
	}
}


// ------------------------------------------------

MessageQueue.Message = function(sentence,args,type,title)
{
	this.type = type || 'warning' ;
	this.sentence = sentence ;
	this.args = args || [] ;
	this.title = title ;
	this.buff = null ;
}

MessageQueue.Message.prototype.cleanup = function()
{
	this.buff = null ;
}

MessageQueue.Message.prototype.toString = function()
{
	return strutil.sprintf(this.sentence,this.args) ;
}


MessageQueue.Message.prototype.popup = function(opt)
{
	if(typeof window=='undefined')
	{
		throw new Error("MessageQueue::popup only call in frontend.") ;
	}

	opt = opt || {} ;
	opt.message = this.toString() ;
	opt.type = this.type ;

	if( opt.showCloseButton!==false )
	{
		opt.showCloseButton = true ;
	}

	if(this.popupMessage)
	{
		this.popupMessage.update(opt);
	}
	else
	{
		this.popupMessage = jQuery.globalMessenger().post(opt);
	}
}

MessageQueue.Message.prototype.render = function(callback,tplname){

	if( this.buff )
	{
		callback && callback(null,this.buff) ;
		return ;
	}

	var message = this ;

	((typeof window=='undefined')? helper: $.tplCaches).template( tplname||MessageQueue.Message.defautlTplName, function(err,tpl){

		if(err)
		{
			callback && callback(err) ;
			return ;
		}

		tpl.render({message:message},function(err,buff){

			callback && callback(err,buff) ;

		}) ;

	} )
}

MessageQueue.Message.defautlTplName = "ocframework/templates/message.bootstrap.html" ;

MessageQueue.Message.types = {
	success: "success"
	, error: "error"
	, danger: "danger"
	, info: "info"
	, warning: "warning"
}
MessageQueue.Message.defaultTitles = {
	success: "Success!"
	, error: "Error!"
	, danger: "Danger!"
	, info: "Information!"
	, warning: "Warning!"
}