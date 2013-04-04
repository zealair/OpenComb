module.exports = function anonymous($model,buff,callback,require) {
try{
var $variables = {};
$variables.__proto__ = $model;
$helper = this.helper ;
function _$step_0(err)
{
	if(err){ _$step_last(err) ; return ;}
	var $nextstep = _$step_last ;
	with($variables)
	{try{
		// 搜集css文件
		$model.$view.assets.putin("/ocxBlog/public/style/BlogLayout.css") ;
		buff.write( "\n\n<div class=\"row\">\n    <div class=\"span9\">\n\n        <ul class=\"breadcrumb\" style=\"margin-top:0px;margin-bottom: 5px\">\n            <li><a href=\"/\" direct>首页</a> <span class=\"divider\">/</span></li>\n            <li class=\"breadcrumb-item-index\"><a href=\"/ocxBlog/index\" direct>Blog</a> <span class=\"divider\">/</span></li>\n            <li class=\"breadcrumb-item-blog\" style=\"display: none\"></li>\n        </ul>\n\n        " );
		var name = '*' ;
		var mode = undefined ;
		// 连接所有子视图
		if(name=='*')
		{
			buff.write( "<div class=\"oclayout-container\">" );
			for(var name in $model.$view._children)
			{
				buff.write($model.$view._children[name].buff,mode||'weak') ;
			}
			buff.write( "</div>" );
		}
		// 连接指定的视图
		else
		{
			if(!$model.$view._children[name])
			{
				buff.write("not found view named: "+name) ;
			}else{
				buff.write($model.$view._children[name].buff,mode||'soft') ;
			}
		}
		buff.write( "\n    </div>\n\n    <div class=\"span3\">\n    <div class=\"sidebar\">\n    <div class=\"sidebar-box clearfix\">\n        <h4>\n            文章分类\n        </h4>\n        <ul>\n            <li class=\"cat-item cat-item-3\">\n                <a href=\"http://www.sysui.com/post/category/htmlcsspost\" title=\"查看 HTML/CSS 下的所有文章\">\n                    HTML/CSS\n                </a>\n                (12)\n            </li>\n            <li class=\"cat-item cat-item-4\">\n                <a href=\"http://www.sysui.com/post/category/scriptpost\" title=\"查看 Jquery/Js 下的所有文章\">\n                    Jquery/Js\n                </a>\n                (35)\n            </li>\n            <li class=\"cat-item cat-item-1\">\n                <a href=\"http://www.sysui.com/post/category/mobilepost\" title=\"查看 Mobile Web 下的所有文章\">\n                    Mobile Web\n                </a>\n                (1)\n            </li>\n            <li class=\"cat-item cat-item-5\">\n                <a href=\"http://www.sysui.com/post/category/designpost\" title=\"查看 前端设计 下的所有文章\">\n                    前端设计\n                </a>\n                (25)\n            </li>\n            <li class=\"cat-item cat-item-6\">\n                <a href=\"http://www.sysui.com/post/category/articlepost\" title=\"查看 经验文章 下的所有文章\">\n                    经验文章\n                </a>\n                (25)\n            </li>\n            <li class=\"cat-item cat-item-7\">\n                <a href=\"http://www.sysui.com/post/category/sharepost\" title=\"查看 资源分享 下的所有文章\">\n                    资源分享\n                </a>\n                (18)\n            </li>\n        </ul>\n    </div>\n\n    " );
		var name = "tophot" ;
		var mode = undefined ;
		// 连接所有子视图
		if(name=='*')
		{
			buff.write( "<div class=\"oclayout-container\">" );
			for(var name in $model.$view._children)
			{
				buff.write($model.$view._children[name].buff,mode||'weak') ;
			}
			buff.write( "</div>" );
		}
		// 连接指定的视图
		else
		{
			if(!$model.$view._children[name])
			{
				buff.write("not found view named: "+name) ;
			}else{
				buff.write($model.$view._children[name].buff,mode||'soft') ;
			}
		}
		buff.write( "\n\n    " );
		var name = "topnew" ;
		var mode = undefined ;
		// 连接所有子视图
		if(name=='*')
		{
			buff.write( "<div class=\"oclayout-container\">" );
			for(var name in $model.$view._children)
			{
				buff.write($model.$view._children[name].buff,mode||'weak') ;
			}
			buff.write( "</div>" );
		}
		// 连接指定的视图
		else
		{
			if(!$model.$view._children[name])
			{
				buff.write("not found view named: "+name) ;
			}else{
				buff.write($model.$view._children[name].buff,mode||'soft') ;
			}
		}
		buff.write( "\n\n    <div class=\"sidebar-box clearfix\">\n        <h4>\n            友情链接\n        </h4>\n        <ul class=\"xoxo blogroll\">\n            <li>\n                <a href=\"http://www.css119.com/\" title=\"实时关注常见的前端开发\" target=\"_blank\">\n                    css119.com\n                </a>\n                实时关注常见的前端开发\n            </li>\n            <li>\n                <a href=\"http://loveui.cn/\" title=\"UI设计师作品分享\" target=\"_blank\">\n                    LOVEUI\n                </a>\n                UI设计师作品分享\n            </li>\n            <li>\n                <a href=\"http://medialoot.com/\" title=\"一些HTM5/UI/ICON资源\" target=\"_blank\">\n                    medialoot\n                </a>\n                一些HTM5/UI/ICON资源\n            </li>\n            <li>\n                <a href=\"http://mycolorscreen.com\" title=\"Mobile Ui\">\n                    mycolorscreen\n                </a>\n                Mobile Ui\n            </li>\n            <li>\n                <a href=\"http://www.red-team-design.com/\" title=\"值得一看学习\">\n                    redteamdesign\n                </a>\n                值得一看学习\n            </li>\n            <li>\n                <a href=\"http://www.uiparade.com/\" title=\"优质UI设计资源\" target=\"_blank\">\n                    Ui Parade\n                </a>\n                优质UI设计资源\n            </li>\n            <li>\n                <a href=\"http://www.w3school.com.cn/\" title=\"w3school在线教程\" target=\"_blank\">\n                    w3school在线教程\n                </a>\n                w3school在线教程\n            </li>\n            <li>\n                <a href=\"http://www.weboop.com/\" rel=\"friend colleague\" title=\"同事的个人博客\"\n                   target=\"_blank\">\n                    weboop\n                </a>\n                同事的个人博客\n            </li>\n            <li>\n                <a href=\"http://www.w3cfuns.com/\" title=\"Web前端开发(W3Cfuns)\" target=\"_blank\">\n                    WEB前端开发\n                </a>\n                Web前端开发(W3Cfuns)\n            </li>\n            <li>\n                <a href=\"http://www.admin10000.com/\" target=\"_blank\">\n                    WEB开发者\n                </a>\n            </li>\n            <li>\n                <a href=\"http://ux.etao.com/\" title=\"一淘-用户体验中心\" target=\"_blank\">\n                    一淘-用户体验中心\n                </a>\n                一淘-用户体验中心\n            </li>\n            <li>\n                <a href=\"http://www.w3cfuns.com/topic-64.html\" title=\"学习基础的资料\" target=\"_blank\">\n                    基础学习\n                </a>\n                学习基础的资料\n            </li>\n            <li>\n                <a href=\"http://www.sjyzt.cn/\" title=\"设计一站通上网导航\" target=\"_blank\">\n                    <img src=\"http://www.sjyzt.cn/images/logo.jpg\" alt=\"设计一站通 设计一站通上网导航\" title=\"设计一站通上网导航\">\n                    设计一站通\n                </a>\n                设计一站通上网导航\n            </li>\n        </ul>\n    </div>\n    </div>\n    </div>\n\n</div>" );
		
		
		$nextstep(null) ;
	}catch(err){
		callback && callback(err) ;
		return ;
	}}
}

function _$step_last(err)
{
	callback && callback(err,buff) ;
}
_$step_0(null) ;


}catch(e){
	var err = new Error('模板文件中的表达式在渲染过程中抛出了异常，渲染过程终端') ;
	err.cause = e ;
	throw err ;
}
}