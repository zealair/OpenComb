module.exports.buildView = function(ele,shipper)
{
	shipper = shipper || $oc.shipper ;

	ele._children = {} ;
	ele._tpl = null ;

	$ele = $(ele) ;

	ele.name = ele.controller = $ele.attr("controller") ;
	ele.params = $ele.attr("params") ;
	ele.sumsign = $ele.attr("sumsign") || null ;
	ele.onshowSrc = $ele.attr("onshow") ;

	// 加载onshow
	if( ele.onshowSrc )
	{
		shipper.require(ele.onshowSrc,function(err,module){
			if(err)
			{
				throw err ;
				return ;
			}

			if( typeof module=="function" )
			{
				ele.onshow = module ;
				ele.onshow() ;
			}
			else
			{
				throw new Error("onshow script of view must exports a function, src: "+$view.onshowSrc) ;
			}
		}) ;
	}

	if(ele.sumsign)
	{
		$oc.views[ ele.sumsign ] = ele ;
	}

	return ele ;
}

