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
		buff.write( "\n" );
		if( $model.currentId ){
			buff.write( "\n    <div>\n        <a href=\"/signout\" direct>Sign Out</a>\n    </div>\n\n" );
			
}else{
			buff.write( "\n\n    <form class=\"miniuserpad-login\" onsubmit=\"return false\">\n        <input type=\"text\" name=\"username\" class=\"input-mini\" placeholder=\"email\" />\n        <input type=\"password\" name=\"password\" class=\"input-mini\" placeholder=\"password here\" />\n        <button class=\"miniuserpad-btn-signin\">登陆</button>\n    </form>\n\n" );
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