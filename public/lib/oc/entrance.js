window.$oc = null ;

jQuery(function($){

	var initOpenComb = function() {

		console.log("initOpenComb()") ;

		// 为浏览器打补丁，以便一些为 node.js 开发的 module 可以在浏览器中运行
		require("./patchs.js") ;


		// 初始化视图
		var View = require("./mvc/View.js") ;
		jQuery(".ocview").each(function(){
			View.buildView( this, jQuery.shipper, function(err,view){
				if(err)
				{
					console.log(err) ;
				}
				view.viewIn && view.viewIn() ;
			} ) ;
		}) ;



		// init validator (validator 应该在 director.setup() 前面，以便事件顺序争取e)
		require("../../../lib/mvc/Validator.js") ;

		// init controller director
        require("./mvc/Director.js") ;
		jQuery.director.setup() ;

		// template cahces for frontend
		require("../../../lib/mvc/view/ViewTemplateCaches.js").initForFrontend() ;

		// init switcher
        require("./mvc/Switcher.js") ;

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

    initOpenComb() ;
}) ;
