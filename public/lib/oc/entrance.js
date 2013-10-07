
// 释放 $ 变量
// jQuery.noConflict() ;

var $oc = null ;

jQuery(function($){

    var initOpenComb = function() {

        console.log("initOpenComb()") ;

        // 为浏览器打补丁，以便一些为 node.js 开发的 module 可以在浏览器中运行
	    jQuery.shipper.module("opencomb/lib/core/reset.js") ;
        jQuery.shipper.module("opencomb/public/lib/oc/patchs.js") ;


        // 初始化视图
        var View = jQuery.shipper.module("opencomb/public/lib/oc/mvc/View.js") ;
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
        jQuery.shipper.module("opencomb/lib/mvc/Validator.js") ;

        // init controller director
        jQuery.shipper.module("opencomb/public/lib/oc/mvc/Director.js") ;
        jQuery.director.setup() ;

        // template cahces for frontend
        jQuery.shipper.module("opencomb/lib/mvc/view/ViewTemplateCaches.js").initForFrontend() ;

        // init switcher
        jQuery.shipper.module("opencomb/public/lib/oc/mvc/Switcher.js") ;

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

    var waiting = window.__opencombFrontendRequires.length ;
    for(var i=0;i<window.__opencombFrontendRequires.length;i++)
    {
        jQuery.shipper.require(window.__opencombFrontendRequires[i],function(err,path,module){

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
