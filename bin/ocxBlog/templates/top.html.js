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
		$model.$view.assets.putin("/ocxBlog/public/style/index.css") ;
		buff.write( "\n\n<div class=\"entry\">\n    <h4>" );
		buff.write(title) 

		buff.write( "</h4>\n    <ul>\n    " );
		
		// foreach loop's body ----------------------------------------
		$variables.foreach_4 = blogs ;
		if($variables.foreach_4)
		{
			// for each body
			function foreach_body_4($variables)
			{
				with($variables){
					buff.write( "\n    <li>\n        <a href=\"/ocxBlog/blog?id=" );
					buff.write(blog._id) 

					buff.write( "\" title=\"" );
					buff.write(blog.title) 

					buff.write( "\" direct>" );
					buff.write(blog.title) 

					buff.write( "</a>\n    </li>\n    " );
				}
			}
			
			// for each as array or string
			if($variables.foreach_4.constructor===Array || $variables.foreach_4.constructor===String)
			{
				for($variables.foreach_key_4=0;$variables.foreach_key_4<$variables.foreach_4.length;$variables.foreach_key_4++)
				{
					$variables.blog = $variables.foreach_4[$variables.foreach_key_4] ;
					foreach_body_4 ($variables) ;
				}
			}
			
			// for each as object
			else
			{
				for($variables.foreach_key_4 in $variables.foreach_4)
				{
					$variables.blog = $variables.foreach_4[$variables.foreach_key_4] ;
					foreach_body_4 ($variables) ;
				}
			}
		}
		buff.write( "\n    </ul>\n</div>" );
		
		
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