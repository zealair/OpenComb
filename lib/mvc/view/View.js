var _pt = require("path") ;
var fs = require("fs") ;
var RenderBuffer = require("./RenderBuffer.js") ;
var RenderContext = require("ocTemplate/lib/RenderContext.js") ;

exports.buildViewFromTemplate = function(tpl,tplPath,callback){

	var extname = _pt.extname(tplPath) ;
	var onshowScript = tplPath.substring(0,tplPath.length-extname.length) + ".js" ;

	tpl.useWrapper = true ;
	tpl.filename = tplPath ;

	try{
		require.resolve(onshowScript) ;
		tpl.onshowScript = onshowScript ;
	}catch(e){
		tpl.onshowScript = null ;
	}

	// 派生
	var createRenderContext = tpl.createRenderContext ;
	tpl.createRenderContext = function()
	{
		var ctx = createRenderContext.call(this) ;
		exports.buildContext(ctx) ;

		return ctx ;
	}


	//
	callback(null,tpl) ;
}

exports.createNullContext = function(){
	return exports.buildContext(new RenderContext(null)) ;
}


exports.buildContext = function(tplRenderCtx){

	tplRenderCtx._children = {} ;
	tplRenderCtx._name = "" ;

	tplRenderCtx._tplRender = tplRenderCtx.render ;
	tplRenderCtx.render = function(callback){

		var ctx = this ;

		// wrapper head
		if(this.tpl && this.tpl.useWrapper)
		{
			this.buff.write('<div class="ocview" name="'+this._name+'"') ;
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

		var step = function()
		{
			if(!queue.length)
			{
				// render myself
				ctx._tplRender(function(err,buff){
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
					if(tplRenderCtx.tpl && tplRenderCtx.tpl.useWrapper)
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
	tplRenderCtx.cleanup = function()
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

	tplRenderCtx.release = function()
	{
		if(this.buff)
		{
			this.buff.release() ;
		}
		this.buff = undefined ;
		this.model = undefined ;
	}


	tplRenderCtx.buff = new RenderBuffer ;



	return tplRenderCtx ;
}



var TemplateParser = require("ocTemplate/lib/Parser.js") ;
exports.parser = new TemplateParser() ;

var shaderView = require("./shaders/view") ;
exports.parser.registerShaderFunction(shaderView.selector,shaderView.shader) ;


exports.resolve = function(path)
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