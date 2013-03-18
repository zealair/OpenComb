var RenderBuffer = require("./RenderBuffer.js") ;
var RenderContext = require("ocTemplate/lib/RenderContext.js") ;


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
