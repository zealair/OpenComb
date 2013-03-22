var RenderBuffer = require("./RenderBuffer.js") ;
var RenderContext = require("ocTemplate/lib/RenderContext.js") ;
var Template = require("ocTemplate/lib/Template.js") ;
var TemplateCaches = require("ocTemplate/lib/TemplateCaches.js") ;





var View = module.exports = Template.extend({

	useWrapper: true
	, filename: null

	, createRenderContext: function()
	{
		return new View.RenderContext(this) ;
	}
}) ;


var TemplateParser = require("ocTemplate/lib/Parser.js") ;
module.exports.parser = new TemplateParser() ;

var shaderView = require("./shaders/view") ;
module.exports.parser.registerShaderFunction(shaderView.selector,shaderView.shader) ;

module.exports.Caches = TemplateCaches.extend({
	ctor: function()
	{
		this._super() ;
		this._tempateclass = View ;
	}
	, load: function(filename,from,callback,parser)
	{
		var view = this._super(filename,from,callback,parser||View.parser) ;
		view.filename = filename ;
		return view ;
	}
}) ;

module.exports.Caches.singleton = new module.exports.Caches ;

module.exports.createNullContext = function()
{
	return new View.RenderContext(null) ;
}

module.exports.RenderContext = RenderContext.extend({

	ctor: function(view)
	{
		this._super(view) ;

		this._children = {} ;
		this._name = "" ;
		this.buff = new RenderBuffer ;
		this.wrapperClasses = ["ocview"]
	}

	, render: function(callback)
	{
		var ctx = this ;

		// wrapper head
		if(this.tpl && this.tpl.useWrapper)
		{
			this.buff.write('<div class="'+this.wrapperClasses.join(' ')+'" name="'+this._name+'"') ;
			if(this.tpl.onshowScript)
			{
				this.buff.write(' onshow="'+this.tpl.onshowScript+'"') ;
			}
			this.buff.write('>') ;
		}

		// render children
		var queue = [] ;
		for(var name in this._children)
		{
			queue.push(this._children[name]) ;
		}

		var _super = this._super ;
		var step = function()
		{
			if(!queue.length)
			{
				// render myself
				_super.call(ctx,function(err,buff){
					if(err)
					{
						// todo ...
					}

					// 组装未被 <view > 引用的视图
					for(var name in ctx._children)
					{
						buff.write(ctx._children[name].buff,"unuse") ;
					}

					// wrapper tail
					if(ctx.tpl && ctx.tpl.useWrapper)
					{
						buff.write("</div>") ;
					}

					callback(err,buff) ;
				}) ;
				return ;
			}

			// render a child
			queue.shift().render( step ) ;
		}
		step () ;
	}

	/**
	 * 清理多余的对象引用，为输出到前端做准备
	 */
	, cleanup: function()
	{
		this.tpl = this.tpl.filename ;
		if(this.buff)
		{
			this.buff.release() ;
		}
		this.buff = undefined ;
		this.queue = undefined ;
		this._children = undefined ;
		this._name = undefined ;
		this.model = undefined ;
	}

	, release: function()
	{
		if(this.buff)
		{
			this.buff.release() ;
		}
		this.buff = undefined ;
		this.model = undefined ;
	}

}) ;
module.exports.RenderContext.className = "View.RenderContext" ;


module.exports.resolve = function(path)
{
	if(/^[\.\/]/.test(path))
	{
		return path ;
	}

	// 连续的斜线 并切割
	var subnames = path.replace(/\/+/g,"/").split("/") ;
	if(subnames.length<2 || !subnames[1])
	{
		return path ;
	}

	subnames.splice(1,0,"templates") ;
	return subnames.join("/") ;
}



module.exports.__SHIPPABLE = true ;
