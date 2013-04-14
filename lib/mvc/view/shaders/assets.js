var text = new require("octemplate/lib/shaderfuncs/text.js") ;

module.exports = {

	selector: ["link","assets"]

	, shader: function(node,buff,next,generator,tpl){

		var tagName = node.tagName.toLowerCase() ;

		if( tagName=="assets" )
		{
			buff.write("// 在此集中输出各个模板中请求的 css 文件") ;
			buff.write("buff.write($model.$view.assets) ;") ;
		}

		// link
		else
		{
			if(node.attributes.href)
			{
				var url = text.joinAsString(node.attributes.href) ;
				buff.write("// 搜集css文件") ;
				buff.write("$model.$view.assets.putin("+url+") ;") ;
			}
		}
	}

}




module.exports.__SHIPPABLE = true ;