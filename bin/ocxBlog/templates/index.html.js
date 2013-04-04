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
		buff.write( "<div class=\"pagination\" style=\"margin-top:0px;margin-bottom: 0px\">\n    <ul>\n        <li class=\"" );
		buff.write( thisPageNum==1 && 'disabled') 

		buff.write( "\"><a href=\"/ocxBlog/index?page=" );
		buff.write(prevPageNum) 

		buff.write( "\" direct=\"view\">&laquo;</a></li>\n\n        " );
		
		// loop
		for( $variables.pageNum=(1);$variables.pageNum<=(pageCount);$variables.pageNum+=(1) )
		{
			buff.write( "\n            <li class=\"" );
			buff.write( thisPageNum==pageNum && 'active') 

			buff.write( "\"><a href=\"/ocxBlog/index?page=" );
			buff.write(pageNum) 

			buff.write( "\" direct=\"view\">" );
			buff.write(pageNum) 

			buff.write( "</a></li>\n        " );
		}
		buff.write( "\n\n        <li class=\"" );
		buff.write( thisPageNum>=pageCount && 'disabled') 

		buff.write( "\"><a href=\"/ocxBlog/index?page=" );
		buff.write(nextPageNum) 

		buff.write( "\" direct=\"view\">&raquo;</a></li>\n    </ul>\n</div>\n\n" );
		var name = "page" ;
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