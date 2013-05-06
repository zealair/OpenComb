var RenderBuffer = require("./RenderBuffer.js") ;

module.exports = function(tpl,model)
{
	this.tpl = tpl ;
	this.wrapperClasses = ["ocview"] ;
	this._enable = true ;
	this.viewscript = false ;
	this.model = model || {$view:this} ;

	this._init() ;
}

module.exports.prototype._init = function()
{
	this._children = {} ;
	this._name = "" ;
	this.buff = new RenderBuffer ;
}

module.exports.prototype.disable = function()
{
	this._enable = false ;
}

module.exports.prototype.enable = function()
{
	this._enable = true ;
}

module.exports.prototype.render = function(callback)
{
	if( this.tpl && this._enable )
	{
		var view = this ;
		this.tpl.render( this.model, function(err){
			callback && callback(err,view) ;
		}, this.buff ) ;
	}
	else
	{
		callback && callback(null,this) ;
	}
}

module.exports.prototype.createWrapperHead = function(tagName)
{
	var html = "<"+ (tagName||'div') +' class="'+this.wrapperClasses.join(' ')+'"' ;
	html+= ' controller="'+(this.model.$controllerpath||"")+'"' ;
	html+= ' view="'+(this.model.$viewname||"")+'"' ;
	html+= ' sumsign="'+(this.model.$sumsign||"...")+'"' ;
	if(this.viewscript)
	{
		html+= ' script' ;
	}
	html+= ">" ;

	return html ;
}

/**
 * 在前端恢复对象
 */
module.exports.restore = function(view,callback)
{
	for(var name in module.exports.prototype)
	{
		view[name] = module.exports.prototype[name] ;
	}
	view._init() ;

	if(view.tpl)
	{
		$.tplCaches.template(view.tpl,function(err,tpl){
			view.tpl = tpl ;
			callback && callback(err,view) ;
		}) ;
	}
	else
	{
		callback && callback(null,view) ;
	}
}

/**
 * 清理多余的对象引用，为输出到前端做准备
 */
module.exports.prototype.cleanup = function()
{
	if(this.tpl)
	{
		this.tpl = this.tpl.filename ;
	}

	if(this.buff)
	{
		this.buff.destroy() ;
	}
	delete this.buff ;
	delete this._children ;
	delete this._name ;
	delete this.model.$view ;
	delete this.model ;
}

module.exports.prototype.destroy = function()
{
	if(this.buff)
	{
		this.buff.destroy() ;
	}
	this.buff = undefined ;
	this.model = undefined ;
}

module.exports.__SHIPPABLE = true ;
