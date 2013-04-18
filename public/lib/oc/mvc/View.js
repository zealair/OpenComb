module.exports.buildView = function(ele,shipper,callback)
{
	shipper = shipper || jQuery.shipper ;

	ele._children = {} ;
	ele._tpl = null ;
	ele.nut = null ;
	ele.ajaxOpt = null ;

	$ele = jQuery(ele) ;

	ele.name = ele.controller = $ele.attr("controller") ;
	ele.params = $ele.attr("params") ;
	ele.sumsign = $ele.attr("sumsign") || null ;
	ele.script = $ele.attr("script") ;

	ele.reload = function(data,method)
	{
		$.request(
			{
				url: jQuery(this).attr('controller')
				, data: data
				, type: method
			}
			, this
		) ;
	}

	if(ele.sumsign)
	{
		$oc.views[ ele.sumsign ] = ele ;
	}

	// 加载 frontend view script
	if( ele.script!==undefined && ele.controller )
	{
		shipper.require(ele.controller,function(err){
			if(err)
			{
				callback && callback (err,ele) ;
				return ;
			}

			var module = shipper.module(ele.controller,'viewscript') ;
			if(module)
			{
				var props = ['viewInit','viewIn','viewOut'] ;
				for(var i=0;i<props.length;i++)
				{
					ele[props[i]] = module[props[i]] ;
				}
			}

			callback && callback (err,ele) ;
		},'viewscript') ;
	}
	else
	{
		callback && callback (null,ele) ;
	}

	return ele ;
}

