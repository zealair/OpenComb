
var MessageQueue = require("./MessageQueue.js") ;
var View = require("./view/View.js") ;
var TemplateCaches = require("octemplate/lib/TemplateCaches.js") ;
var WebAssets = require("ocplatform/lib/mvc/view/WebAssets.js") ;
var Step = require("step") ;
var utilstr = require("ocplatform/lib/util/string.js") ;

var Nut = module.exports = function(controller)
{
	// view and model
	this.createView(controller.viewTpl) ;
	this.model = this.view.model ;
	this.model.$controllerpath = controller.pathname ;

	this.title = controller.title ;
	this.titleTemplate = controller.titleTemplate ;
	this.keywords = controller.keywords ;
	this.description = controller.description ;

	// this is message queue
	this.msgqueue = null ;

	this._children = {} ;

	this.view.viewscript =	( controller.viewIn || controller.viewOut ) ? true: false ;
}

Nut.prototype.createView = function(tpl)
{
	this.view = new View(tpl) ;
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

	for(var name in this._children)
	{
		this._children[name].cleanup() ;
	}

	return this ;
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
}


/**
 * 从 json 还原回 Nut对象
 * 在 frontend 调用
 */
Nut.restore = function(nut,callback)
{
	// 兼容ie
	for(var name in Nut.prototype)
	{
		nut[name] = Nut.prototype[name] ;
	}

	if(nut.msgqueue)
	{
		MessageQueue.restore(nut.msgqueue) ;
	}

	// restore views
	var lasterr = null ;
	Step(

		function loadMineViewTpl(){
			View.restore(nut.view,this) ;
		}

		, function loadTplDone(err,tpl){
			if(err)
			{
				err.prev = lasterr ;
				lasterr = err ;
			}

			nut.view.model = nut.model ;
			nut.model.$view = nut.view ;

			// 装配试图
			nut.view.buff.write(nut._buff||'') ;

			return 1 ;
		}

		, function restoreChildren()
		{
			var group = this.group() ;
			for(var name in nut._children)
			{
				Nut.restore(nut._children[name],group()) ;
			}
		}

		, function done(err)
		{
			if(err)
			{
				err.prev = lasterr ;
				lasterr = err ;
			}

			callback(lasterr,nut) ;
		}

	) ;
}

Nut.prototype.write = function(content)
{
	this.view.buff.write(content) ;
}

Nut.prototype.render = function(callback)
{
	// 连接视图的model 到 nut 的model
	// this.view.model.__proto__ = this.model ;


	var nut = this ;
	var lasterr = null ;

	Step(

		// 1. render message queue
		function renderMessageQueue(){
			//console.log(arguments.callee.name) ;
			// console.log(arguments.callee.name, "() ",new Date) ;

			if( nut.msgqueue )
			{
				var group = this.group() ;

				for(var i=0;i<nut.msgqueue.length;i++)
				{
					nut.msgqueue[i].render( group() ) ;
				}
			}
			else
			{
				// next step
				return 1 ;
			}
		} ,

		// 1.5. message queue has rendered
		function messageQueueHasRendered(err,msgbuffs) {
			//console.log(arguments.callee.name,err) ;
			//console.log(arguments.callee.name, "() ",new Date) ;

			if(err)
			{
				err.prev = lasterr ;
				lasterr = err ;
			}

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

			// next step
			return 1 ;
		} ,

		// 2. render myself
		function renderMyself(err){
			//console.log(arguments.callee.name) ;
			//console.log(arguments.callee.name, "() ",new Date) ;
			if(err)
			{
				err.prev = lasterr ;
				lasterr = err ;
			}

			nut.view.render(this) ;
		} ,

		// 3. 完成 buff 封装
		function assembleChildViews(err) {
			//console.log(arguments.callee.name) ;
			//console.log(arguments.callee.name, "() ",new Date) ;

			if(err)
			{
				err.prev = lasterr ;
				lasterr = err ;
			}

			// 组装未被 <view > 引用的视图
			for(var name in nut.view._children)
			{
				nut.view.buff.write(nut.view._children[name].buff,"unuse") ;
			}

			// wrapper end tag
			nut.view.buff.write( "</div>" ) ;

			// next
			return 1 ;
		} ,

		// 4. render children
		function renderChildren(err) {
			//console.log(arguments.callee.name) ;
			//console.log(arguments.callee.name, "() ",new Date) ;

			if(err)
			{
				err.prev = lasterr ;
				lasterr = err ;
			}

			// 陆续执行各个子控制器的渲染
			var group = this.group() ;
			for(var name in nut._children)
			{
				nut._children[name].render(group()) ;
			}
		} ,

		// 5. complete
		function completed(err) {
			//console.log(arguments.callee.name) ;
			//console.log(arguments.callee.name, "() ",new Date) ;
			if(err)
			{
				err.prev = lasterr ;
				lasterr = err ;
			}

			callback(lasterr,nut) ;
			return 1 ;
		}
	) ;
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
		TemplateCaches.singleton.template("ocplatform/templates/WebPage.html",function(err,webpage){

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
			webpagectx.render(function(err){

				// 开始渲染试图
				nut.render(function(err){
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
