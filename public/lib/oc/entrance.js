
// 释放 $ 变量
// jQuery.noConflict() ;

// 兼容 jquery 1.9 以前的版本
jQuery.browser = {
	mozilla:	/firefox/.test(navigator.userAgent.toLowerCase())
	, webkit:	/webkit/.test(navigator.userAgent.toLowerCase())
	, opera:	/opera/.test(navigator.userAgent.toLowerCase())
	, msie:		/msie/.test(navigator.userAgent.toLowerCase())
} ;

var $oc = null ;

jQuery(function($){

	var initOpenComb = function() {

		console.log("initOpenComb()") ;

		// 为浏览器打补丁，以便一些为 node.js 开发的 module 可以在浏览器中运行
		jQuery.shipper.module("ocplatform/public/lib/oc/patchs.js") ;


		// 初始化视图
		var View = jQuery.shipper.module("ocplatform/public/lib/oc/mvc/View.js") ;
		jQuery(".ocview").each(function(){
			View.buildView( this, jQuery.shipper, function(err,view){
				if(err)
				{
					console.log(err) ;
				}
				view.viewIn && view.viewIn() ;
			} ) ;
		}) ;


		// init controller director
		jQuery.shipper.module("ocplatform/public/lib/oc/mvc/Director.js") ;
		jQuery.director.setup() ;

		// template cahces for frontend
		jQuery.shipper.module("ocplatform/lib/mvc/view/ViewTemplateCaches.js").initForFrontend() ;

		/**
		 * 创建一个受限制的 jQuery 函数，所有的selector 仅在 root 内查找（包括root）
		 */
		jQuery.sandbox = function(root)
		{
			var $root = jQuery(root) ;
			function $(selector)
			{
				if(typeof selector=='string' && !/^\s*</.test(selector) )
				{
					return $root.find.apply($root,arguments) ;
				}
				else
				{
					return jQuery.apply(this,arguments) ;
				}
			}
			// jQuery 的全局函数
			for(var name in jQuery)
			{
				if( typeof jQuery[name]=='function' )
				{
					$[name] = jQuery[name].bind(jQuery) ;
				}
			}

			return $ ;
		}

		console.log("OpenComb frontend has loaded on your browser :)") ;
	}

	$oc = jQuery(document) ;
	$oc.views = {} ;
	$oc.viewpool = [] ;

	var waiting = window.__ocFrameworkFrontendRequires.length ;
	for(var i=0;i<window.__ocFrameworkFrontendRequires.length;i++)
	{
		jQuery.shipper.require(window.__ocFrameworkFrontendRequires[i],function(err,path,module){

			if(err)
			{
				throw err ;
			}
			if( !(--waiting) )
			{
				initOpenComb() ;
			}
		}) ;
	}



}) ;

