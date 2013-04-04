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
		$model.$view.assets.putin("/ocxBlog/public/style/index.css") ;
		buff.write( "\n\n" );
		
		// foreach loop's body ----------------------------------------
		$variables.foreach_1 =  blogs ;
		if($variables.foreach_1)
		{
			// for each body
			function foreach_body_1($variables)
			{
				with($variables){
					buff.write( "\n    <div class=\"entry\">\n        <h2 class=\"entry-title\"><a href=\"/ocxBlog/blog?id=" );
					buff.write(blog._id) 

					buff.write( "\" title=\"" );
					buff.write(blog.title) 

					buff.write( "\" direct>" );
					buff.write(blog.title) 

					buff.write( "</a></h2>\n        <div class=\"post-meta\">\n            <span class=\"meta-date\">" );
					buff.write( blog.createTime ) 

					buff.write( "</span>\n            <span class=\"meta-author\">" );
					buff.write( blog.author ) 

					buff.write( "</span>\n            <span class=\"meta-category\"><a href=\"http://www.sysui.com/post/category/designpost\" title=\"查看 前端设计 中的全部文章\" rel=\"category tag\">前端设计</a></span>\n            <span class=\"meta-views\">" );
					buff.write(blog.views||0) 

					buff.write( " 次浏览</span>\n        </div>\n        <!-- END post-meta -->\n\n        " );
					buff.write( blog.content ) 

					buff.write( "\n    </div>\n" );
				}
			}
			
			// for each as array or string
			if($variables.foreach_1.constructor===Array || $variables.foreach_1.constructor===String)
			{
				for($variables.foreach_key_1=0;$variables.foreach_key_1<$variables.foreach_1.length;$variables.foreach_key_1++)
				{
					$variables.blog = $variables.foreach_1[$variables.foreach_key_1] ;
					foreach_body_1 ($variables) ;
				}
			}
			
			// for each as object
			else
			{
				for($variables.foreach_key_1 in $variables.foreach_1)
				{
					$variables.blog = $variables.foreach_1[$variables.foreach_key_1] ;
					foreach_body_1 ($variables) ;
				}
			}
		}
		
		
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