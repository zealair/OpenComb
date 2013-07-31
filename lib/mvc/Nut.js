
var MessageQueue = require("./MessageQueue.js") ;
var View = require("./view/View.js") ;
var WebAssets = require("../mvc/view/WebAssets.js") ;
var Steps = require("ocsteps") ;
var utilstr = require("../util/string.js") ;

if(typeof helper=='undefined')
	helper = undefined ;

var Application ;
function application(){
    var apppath = "../core/Application.js" ;
    return (Application||(Application = require(apppath))).singleton ;
}
function tplCache(){
    return application().templates ;
}

var Nut = module.exports = function(controller)
{
	// view and model
	this.createView(controller.viewTpl) ;
	this.model = this.view.model ;
	this.model.$controllerpath = controller.pathname() ;

	this.title = controller.title ;
	this.titleTemplate = controller.titleTemplate ;
	this.keywords = controller.keywords ;
	this.description = controller.description ;

	// this is message queue
	this.msgqueue = null ;
	this._alive = true ;

	this._children = {} ;

	this.view.viewscript =	( controller.viewIn || controller.viewOut ) ? true: false ;
}

Nut.prototype.createView = function(tpl)
{
	this.view = new View(tpl) ;
	return this ;
}
Nut.prototype.createViewFromTemplate = function(tplpath,callback)
{
	var nut = this ;
    tplCache().template(tplpath,function(err,tpl){
		if( err )
		{
			callback && callback(err) ;
			return ;
		}
		nut.view = new View(tpl,nut.model) ;
		callback && callback(null,nut.view) ;
	}) ;
	return this ;
}

Nut.prototype.message = function(sentence,args,type,title)
{
	if(!this.msgqueue)
	{
		this.msgqueue = new MessageQueue ;
	}

	this.msgqueue.createMessage(sentence,args,type,title) ;
}
Nut.prototype.error = function(sentence,args,title){ return this.message(sentence,args,"error",title) ; }
Nut.prototype.success = function(sentence,args,title){ return this.message(sentence,args,"success",title) ; }
Nut.prototype.danger = function(sentence,args,title){ return this.message(sentence,args,"danger",title) ; }
Nut.prototype.info = function(sentence,args,title){ return this.message(sentence,args,"info",title) ; }
Nut.prototype.warning = function(sentence,args,title){ return this.message(sentence,args,"warning",title) ; }

Nut.prototype.makeTitle = function()
{
	return this._children['layout']? this._children['layout'].applyTitleTemplate(this.title): this.title ;
}
Nut.prototype.applyTitleTemplate = function(title)
{
	if( title )
	{
		if(this.titleTemplate)
		{
			var ttl = utilstr.sprintf( this.titleTemplate, title ) ;
			if(ttl!=this.titleTemplate)
			{
				title = ttl ;
			}
		}
	}
	else
	{
		title = this.title || '' ;
	}

	return this._children['layout']? this._children['layout'].applyTitleTemplate(title): title ;
}

Nut.prototype.makeKeywords = function()
{
	var layoutKeywords = this._children['layout'] && this._children['layout'].makeKeywords() || '' ;
	return this.keywords.join(',') + (layoutKeywords && (','+layoutKeywords)) ;
}

Nut.prototype.makeDescription = function()
{
	return this.description || (this._children['layout'] && this._children['layout'].makeDescription()) || '' ;
}

Nut.prototype.assembleView = function(assets)
{
	// 共享 assets
	this.view.assets = assets || new WebAssets ;

	// layout
	if(this._children.layout)
	{
		// 建立关系
		this._children.layout.view._children["*"] = this.view ;
		this.model.$viewname = '*' ;

		// 递归
		rootView = this._children.layout.assembleView(this.view.assets) ;
	}
	else
	{
		var rootView = this.view ;
	}

	// children
	for(var name in this._children)
	{
		if(name=="layout")
		{
			continue ;
		}

		// 建立关系
		this._children[name].model.$viewname = name ;
		this.view._children[name] = this._children[name].view ;

		// 递归
		this._children[name].assembleView(this.view.assets) ;
	}

	return rootView ;
}

/**
 * 清理多余的引用，为输出到前端做准备
 */
Nut.prototype.cleanup = function()
{
	this._buff = this.view.buff.toString() ;
	this.view.cleanup() ;

	var children = 0 ;
	for(var name in this._children)
	{
		children ++ ;
		this._children[name].cleanup() ;
	}

	if(!this._buff)
		delete this._buff ;
	if(!children)
		delete this._children ;
	if(!this.msgqueue || !this.msgqueue.length)
		delete this.msgqueue ;
	if(!this.title)
		delete this.title ;
	if(!this.keywords || !this.keywords.length)
		delete this.keywords ;
	if(!this.description )
		delete this.description ;

	delete this._alive ;

	return this ;
}


/**
 * 从 json 还原回 Nut对象
 * 在 frontend 调用
 */
Nut.restore = function(nut,callback)
{
	// 兼容ie
	for(var name in Nut.prototype)
		nut[name] = Nut.prototype[name] ;

	nut.msgqueue || (nut.msgqueue=[]) ;
	MessageQueue.restore(nut.msgqueue) ;

	nut._buff || (nut._buff='') ;
	nut._children || (nut._children={}) ;
	nut.title || (nut.title='') ;
	nut.keywords || (nut.keywords=[]) ;
	nut.description || (nut.description='') ;
	nut._alive = true ;

	Steps(
		function loadMineViewTpl(){
			View.restore(nut.view,this.holdButThrowError()) ;
		}

		, function loadTplDone(){
			nut.view.model = nut.model ;
			nut.model.$view = nut.view ;

			// 装配试图
			nut.view.buff.write(nut._buff||'') ;
		}

		, function restoreChildren()
		{
			for(var name in nut._children)
			{
				Nut.restore(nut._children[name],this.holdButThrowError()) ;
			}
		}

	).done(function(err){
			callback && callback(err,nut) ;
		}) () ;
}

/**
 *
 */
Nut.prototype.destroy = function()
{
	this.model = null ;
	this.buff = null ;
	this.view.destroy() ;

	for(var name in this._children)
	{
		this._children[name].destroy() ;
		this._children[name] = null ;
	}
	this._children = null ;

	return this ;
}


Nut.prototype.write = function(content)
{
	this.view.buff.write(content) ;
}

Nut.prototype.render = function(callback)
{
	if(!this._alive)
		throw new Error("Nut has cleaned up, or not restore yet, can not call render()") ;

	// 连接视图的model 到 nut 的model
	// this.view.model.__proto__ = this.model ;
	var nut = this ;

	Steps(
		// 1. render message queue
		function renderMessageQueue(){

			helper && helper.log("nut").trace("before render nut's message queue:",nut.model.$controllerpath) ;

			if( nut.msgqueue )
			{
				nut.msgqueue.render(this.hold()) ;
			}
		}

		// 1.5. message queue has rendered
		, function messageQueueHasRendered(err,msgbuffs) {

			helper && helper.log("nut").trace("after render nut's message queue:",nut.model.$controllerpath) ;

			if(err) throw err ;

			if(msgbuffs)
			{
				// 保证 message queue 默认位置在其他输出内容以前
				for(var i=msgbuffs.length-1;i>=0;i--)
				{
					nut.view.buff.write(msgbuffs[i],"unused",true) ;
					nut.view.buff.write("\r\n") ;
				}
			}

			// wrapper head tag
			nut.view.buff.write( nut.view.createWrapperHead('div'), undefined, true ) ;
		}

		// 2. render myself
		, function renderMyself(){
			helper && helper.log("nut").trace("before render nut's view:",nut.model.$controllerpath) ;
			nut.view.render(this.hold()) ;
		}

		// 3. 完成 buff 封装
		, function assembleChildViews(err) {

			helper && helper.log("nut").trace("after render nut's view:",nut.model.$controllerpath) ;

			if(err) throw err ;

			// 组装未被 <view > 引用的视图
			for(var name in nut.view._children)
			{
				nut.view.buff.write(nut.view._children[name].buff,"unuse") ;
			}

			// wrapper end tag
			nut.view.buff.write( "</div>" ) ;
		}

		// 4. render children
		, function renderChildren() {

			helper && helper.log("nut").trace("before process nut's children:",nut.model.$controllerpath) ;

			// 陆续执行各个子控制器的渲染
			for(var name in nut._children)
			{
				nut._children[name].render(
					this.hold(function(err){
						if(err) throw err ;
					})
				) ;
			}
		}
	)
	.done(function(err){
		helper && helper.log("nut").trace('nut render() done',nut.model.$controllerpath) ;
		callback && callback( err, nut ) ;
	})

	() ;
}

/**
 * 这个函数很有用，“剥开果壳，得到甜蜜的果肉”
 */
Nut.prototype.crack = function(callback,inWebpage)
{
	var nut = this ;

	// 装配视图
	var rootview = nut.assembleView() ;

	if(inWebpage)
	{
		// 加载 webpage document template
		helper && helper.log("nut").trace("before load template: ocframework/templates/WebPage.html") ;
        tplCache().template("ocframework/templates/WebPage.html",function(err,webpage){

	        helper && helper.log("nut").trace("after load template: ocframework/templates/WebPage.html") ;

			if(err)
			{
				callback(err,'') ;
				return ;
			}

			// 创建 webpage document render context
			var webpagectx = new View(webpage) ;
			webpagectx._children["*"] = rootview ;
			webpagectx.assets = nut.view.assets ;
			webpagectx.model.title = nut.makeTitle() ;
			webpagectx.model.keywords = nut.makeKeywords() ;
			webpagectx.model.description = nut.makeDescription() ;

			// 渲染 webpage document template
	        helper && helper.log("nut").trace("before render view template: ocframework/templates/WebPage.html") ;
			webpagectx.render(function(err){

				helper && helper.log("nut").trace("after render view template: ocframework/templates/WebPage.html") ;

				// 开始渲染试图
				helper && helper.log("nut").trace("before nut.render():",nut.model.$controllerpath) ;
				nut.render(function(err){
					helper && helper.log("nut").trace("after nut.render():",nut.model.$controllerpath) ;
					callback(err,webpagectx.buff.toString()) ;
				})

			}) ;
		}) ;
	}

	else
	{
		// 开始渲染试图
		this.render(function(err){
			callback(err,rootview.buff.toString()) ;
		})
	}
}
