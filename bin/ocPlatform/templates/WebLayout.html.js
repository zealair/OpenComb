module.exports = function anonymous($model,buff,callback,require) {
try{
var $variables = {};
$helper = this.helper ;
function _$step_0(err)
{
	if(err){ _$step_last(err) ; return ;}
	var $nextstep = _$step_last ;
	with($model){
	with($variables){
	try{
		// 搜集css文件
		$model.$view.assets.putin("/ocPlatform/public/style/WebLayout.css") ;
		buff.write( "\n\n<div class=\"header-wrapper\">\n    <div class=\"header-texture\">\n        <div class=\"header\">\n            <div class=\"header-left\">\n            </div>\n\n            <div class=\"clear hide-clear\"></div>\n\n            <div class=\"header-right\">\n\n                <div class=\"header-userpad\" style=\"float:right\">\n                    " );
		var name = "userpad" ;
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
		buff.write( "\n                </div>\n\n                <div class=\"menu-header-container\">\n                    <ul id=\"topnav\" class=\"nav-top\">\n                        <li class=\"menu-item current-menu-item\"><a href=\"/\" direct>首页</a></li>\n                        <li class=\"menu-item\">\n                            <a href=\"/\" id=\"link-document\" direct>文档</a>\n                            <ul class=\"sub-menu\" style=\"display: none; \">\n                                <li class=\"menu-item\"><a href=\"/\">Drop Menu</a></li>\n                                <li class=\"menu-item\"><a href=\"/\">Drop Menu</a></li>\n                                <li class=\"menu-item\"><a href=\"/\">Drop Menu</a></li>\n                                <li class=\"menu-item\"><a href=\"/\">Drop Menu</a></li>\n                            </ul>\n                        </li>\n                        <li class=\"menu-item\"><a href=\"/\" direct>下载</a></li>\n                        <li class=\"menu-item\"><a href=\"/ocxBlog/index\" direct>Blog</a></li>\n                        <li class=\"menu-item\"><a href=\"/\" direct>联系</a></li>\n                    </ul>\n                </div>\n            </div>\n\n            <div class=\"clear\"></div>\n\n        </div>\n    </div>\n</div>\n\n<div class=\"container body-wrapper\">\n    " );
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
		buff.write( "\n</div>\n\n\n<div class=\"footer-wrap\">\n    <div class=\"footer-texture\">\n        <div class=\"footer-widgets clearfix\">\n            <div class=\"footer-widgets-wrap clearfix\">\n                <div class=\"footer-widget\">\n                    <h2 class=\"widgettitle\">\n                        Text Widget\n                    </h2>\n                    <div class=\"textwidget\">\n                        Okay Themes is a tiny WordPress theme shop with big ideas. I hope to grow\n                        it into a place where I can experiment, collaborate, educate and offer\n                        unique digital products for you people.\n                    </div>\n                </div>\n                <div class=\"footer-widget\">\n                    <h2 class=\"widgettitle\">\n                        Recent Posts\n                    </h2>\n                    <ul>\n                        <li>\n                            <a href=\"http://themes.okaythemes.com/radius/2012/03/06/image-slide/\"\n                               title=\"How Form Met Function\">\n                                How Form Met Function\n                            </a>\n                        </li>\n                        <li>\n                            <a href=\"http://themes.okaythemes.com/radius/2012/03/06/a-quote-on-design/\"\n                               title=\"A Quote On Design\">\n                                A Quote On Design\n                            </a>\n                        </li>\n                        <li>\n                            <a href=\"http://themes.okaythemes.com/radius/2012/03/04/the-city/\" title=\"The City Timelapse Video\">\n                                The City Timelapse Video\n                            </a>\n                        </li>\n                        <li>\n                            <a href=\"http://themes.okaythemes.com/radius/2012/02/27/vibrant/\" title=\"Great Wine Packaging\">\n                                Great Wine Packaging\n                            </a>\n                        </li>\n                        <li>\n                            <a href=\"http://themes.okaythemes.com/radius/2012/02/23/image-slide-two/\"\n                               title=\"Looks Great on iPad\">\n                                Looks Great on iPad\n                            </a>\n                        </li>\n                    </ul>\n                </div>\n\n                <div class=\"footer-widget\">\n                    <h2 class=\"widgettitle\">\n                        Site Info\n                    </h2>\n                    <ul>\n                        <li>\n                            <a href=\"/signin\" direct>\n                                Sign in\n                            </a>\n                        </li>\n                        <li>\n                            <a href=\"http://themes.okaythemes.com/radius/feed/\" title=\"Syndicate this site using RSS 2.0\">\n                                Entries\n                                <abbr title=\"Really Simple Syndication\">\n                                    RSS\n                                </abbr>\n                            </a>\n                        </li>\n                        <li>\n                            <a href=\"http://themes.okaythemes.com/radius/comments/feed/\" title=\"The latest comments to all posts in RSS\">\n                                Comments\n                                <abbr title=\"Really Simple Syndication\">\n                                    RSS\n                                </abbr>\n                            </a>\n                        </li>\n                        <li>\n                            <a href=\"http://wordpress.org/\" title=\"Powered by WordPress, state-of-the-art semantic personal publishing platform.\">\n                                WordPress.org\n                            </a>\n                        </li>\n                    </ul>\n                </div>\n            </div>\n        </div>\n        <div class=\"clear\">\n        </div>\n        <div class=\"footer\">\n            <div class=\"footer-text\">\n                <div class=\"footer-text-left\">\n                    <div class=\"menu-footer-container\">\n                        <ul id=\"nav-footer\" class=\"menu\">\n                            <li id=\"menu-item-1212\" class=\"menu-item menu-item-type-custom menu-item-object-custom current-menu-item current_page_item menu-item-home menu-item-1212\">\n                                <a href=\"/\">\n                                    Home\n                                </a>\n                            </li>\n                        </ul>\n                    </div>\n                </div>\n                <div class=\"footer-text-right\">\n                    <div class=\"copyright\">\n                        © 2013\n                        <a href=\"http://www.opencomb.com\">\n                            OpenComb\n                        </a>\n                        | A Cloud App Platform by Node.js/MongoDB\n                    </div>\n                </div>\n                <div class=\"clear\">\n                </div>\n            </div>\n        </div>\n    </div>\n</div>\n" );
		
		
		$nextstep(null) ;
	}catch(err){
		callback && callback(err) ;
		return ;
	}}}
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