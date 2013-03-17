var RenderBuffer = require("ocPlatform/lib/mvc/view/RenderBuffer.js") ;
var RenderContext = require("ocTemplate/lib/RenderContext.js") ;

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


	tplRenderCtx.buff = new RenderBuffer ;



	return tplRenderCtx ;
}


exports.buildContextHeap = function(controller,rspn,name){

	var viewCtx = null
		, layoutViewCtx = null ;

	// self view
	if(controller.view)
	{
		viewCtx = controller.view.createRenderContext() ;
	}
	else
	{
		viewCtx = new RenderContext(null) ;
	}

	exports.buildContext(viewCtx) ;
	viewCtx._name = name || "main" ;

	// layout
	if( rspn )
	{
		if( controller.layout )
		{
			layoutViewCtx = this.buildContextHeap( controller.layout, rspn, viewCtx._name+".layout" ) ;
			if( layoutViewCtx && viewCtx )
			{
				layoutViewCtx._children.main = viewCtx ;
			}
		}

		else
		{
			rspn.rootView = viewCtx ;
		}

		rspn.view = viewCtx ;
	}

	// child controller's views
	for(var name in controller.children)
	{
		viewCtx._children[name] = exports.buildContextHeap( controller.children[name], null, viewCtx._name+"."+name ) ;
	}

	return viewCtx ;

}
