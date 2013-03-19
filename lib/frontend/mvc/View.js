var Class = require("ocClass/lib/Class.js") ;

exports.buildView = function($ele)
{
	$ele._children = {} ;

	var attrGetters = [
		['name',null,"*"]
		, ['controller',null,""]
		, ['params',null,{}]
		, ['onshowSrc',"onshow",null]
	]
	for(var i=0;i<attrGetters.length;i++)
	{
		(function(item){
			$ele.__defineGetter__(item[0],function(){
				return this.attr(item[1]||item[0]) || item[2] ;
			}) ;
		})(attrGetters[i]) ;
	}

	return $ele ;
}


exports.initViewsInDocument = function($opencomb,$)
{
	$(".ocview").each(function(){

		var $view = exports.buildView( $(this) ) ;
		// $opencomb.views[view.name] = view ;

		$view.id = $opencomb.viewpool.length ;
		$opencomb.viewpool.push($view) ;

		// 加载onshow
		if( $view.onshowSrc )
		{
			$opencomb.shipper.require($view.onshowSrc,function(err,module){
				if(err)
				{
					throw err ;
					return ;
				}

				if( typeof module=="function" )
				{
					$view.onshow = module ;
					$view.onshow() ;
				}
				else
				{
					throw new Error("onshow script of view must exports a function, src: "+$view.onshowSrc) ;
				}
			}) ;
		}
	}) ;

//	for(var name in $opencomb.views)
//	{
//		var subnames = name.split(".") ;
//		if(subnames.length<=1)
//		{
//			continue ;
//		}
//		var childName = subnames.pop() ;
//		var parentName = subnames.join() ;
//
//		$opencomb.views[parentName]._children[childName] = $opencomb.views[name] ;
//	}
}




module.exports.__SHIPPABLE = true ;