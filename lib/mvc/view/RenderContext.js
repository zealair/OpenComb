var RenderBuffer = require("ocPlatform/lib/mvc/view/RenderBuffer.js") ;
var RenderContext = require("ocTemplate/lib/RenderContext.js") ;

exports.buildContext = function(tplRenderCtx){

	tplRenderCtx._children = {} ;

	tplRenderCtx._tplRender = tplRenderCtx.render ;
	tplRenderCtx.render = function(callback){

		var ctx = this ;

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


exports.buildContextHeap = function(controller,rspn){

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

	// layout
	if( rspn )
	{
		if( controller.layout )
		{
			layoutViewCtx = this.buildContextHeap(controller.layout,rspn) ;
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
		viewCtx._children[name] = exports.buildContextHeap(controller.children[name],null) ;
	}

	return viewCtx ;

}
