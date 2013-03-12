exports.buildContext = function(tplRenderCtx){

	tplRenderCtx._children = {} ;

	tplRenderCtx._tplRender = tplRenderCtx.render ;
	tplRenderCtx.render = function(rspn){

		// render self
		rspn.wait() ;
		this._tplRender(function(err,buff){

			if(buff)
			{
				rspn.write(buff.toString()) ;
			}

			rspn.end() ;

			if(err)
			{
				throw err ;
			}
		}) ;

		// render children
		for(var name in this._children)
		{
			this._children[name].render(rspn) ;
		}
	}

	return tplRenderCtx ;
}


exports.buildContextHeap = function(controller,_mainChildViewCtx){

	if(controller.view)
	{
		var viewCtx = controller.view.createRenderContext() ;
		this.buildContext(viewCtx) ;

		if( _mainChildViewCtx )
		{
			viewCtx._children.main = _mainChildViewCtx ;
		}

		var retViewCtx = viewCtx ;
	}
	else
	{
		var retViewCtx = _mainChildViewCtx || null ;
	}


	// child controller's views
	// todo ...



	return controller.layout? this.buildContextHeap(controller.layout,retViewCtx): retViewCtx ;

}