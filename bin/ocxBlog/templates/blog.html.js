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
		buff.write( "\n" );
		// 搜集css文件
		$model.$view.assets.putin("/ocxBootstrapWysihtml5/public/bootstrap-wysihtml5.css") ;
		buff.write( "\n\n\n<div class=\"entry\">\n\n\n    <div class=\"row-fluid\">\n\n        <div class=\"" );
		buff.write( display_operate_btns? 'span9': 'span12') 

		buff.write( "\">\n            <h1 class=\"entry-title blogTitle\">\n                <a href=\"/ocxBlog/blog?id=" );
		buff.write(blog.id) 

		buff.write( "\" title=\"" );
		buff.write( $helper.addslashes(blog.title) ) 

		buff.write( "\" direct>" );
		buff.write(blog.title) 

		buff.write( "</a>\n            </h1>\n        </div>\n\n        " );
		if( display_operate_btns ){
			buff.write( "\n        <div class=\"span3\">\n            <a class=\"btn btn-small\" style=\"float: right; margin-right: 5px\" href=\"/ocxBlog/post\" direct>新建</a>\n            <a class=\"btn btn-small\" style=\"float: right; margin-right: 5px\" href=\"/ocxBlog/post.js?id=" );
			buff.write( blog.id ) 

			buff.write( "\" direct>编辑</a>\n            <a class=\"btn btn-small btn-danger btnDelete\" style=\"float: right; margin-right: 5px\">删除</a>\n        </div>\n        " );
		}
		buff.write( "\n\n    </div>\n\n    <div class=\"post-meta\">\n        <span class=\"meta-date\">" );
		buff.write( blog.createTime ) 

		buff.write( "</span>\n        <span class=\"meta-author\">" );
		buff.write( blog.author ) 

		buff.write( "</span>\n        <span class=\"meta-category\"><a href=\"http://www.sysui.com/post/category/designpost\" title=\"查看 前端设计 中的全部文章\" rel=\"category tag\">前端设计</a></span>\n        <span class=\"meta-views\">" );
		buff.write(blog.views||0) 

		buff.write( " 次浏览</span>\n    </div>\n\n    <div class=\"blogContent\">\n        " );
		buff.write( blog.content ) 

		buff.write( "\n    </div>\n\n    <input name=\"id\" type=\"hidden\" value=\"" );
		buff.write(blog && blog.id) 

		buff.write( "\" />\n\n</div>\n\n<div class=\"deleteConfirm modal hide fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\">\n    <div class=\"modal-header\">\n        <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n        <h3 id=\"myModalLabel\">正在删除文章……</h3>\n    </div>\n    <div class=\"modal-body\">\n        <p>确定要删除文章吗？</p>\n    </div>\n    <div class=\"modal-footer\">\n        <button class=\"btn\" data-dismiss=\"modal\" aria-hidden=\"true\">取消</button>\n        <button class=\"btn btn-danger btnConfirmDelete\" data-dismiss=\"modal\">删除</button>\n    </div>\n</div>" );
		
		
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