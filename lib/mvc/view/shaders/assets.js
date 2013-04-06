var text = new require("ocTemplate/lib/shaderfuncs/text.js") ;

module.exports = {

	selector: ["link","assets"]

	, shader: function(uiobject,buff,next,generator,tpl){

		var tagName = uiobject.tagName.toLowerCase() ;

		if( tagName=="assets" )
		{
			buff.write("// 在此集中输出各个模板中请求的 css 文件") ;
			buff.write("buff.write($model.$view.assets) ;") ;
		}

		// link
		else
		{
			if(uiobject.headTag.namedAttributes.href)
			{
				var url = text.joinAsString(uiobject.headTag.namedAttributes.href.text) ;
				buff.write("// 搜集css文件") ;
				buff.write("$model.$view.assets.putin("+url+") ;") ;
			}
		}


		return ;

		var tagName = uiobject.tagName.toLowerCase() ;

		if( tagName=="resources" )
		{
			context.buff.write( context.resourcepool ) ;
			context.stopShaderSeq() ;
		}

		var attrname = tagName=="script"? "src": "href" ;

		// 排除 无src属性的 script标签
		if( !uiobject.headTag.namedAttributes[attrname] )
		{
			return ;
		}

		else
		{
			var url = util.evalAttrExpEx(uiobject.headTag,attrname,"",context,model) ;
			context.resourcepool.putin(url,uiobject,context,model) ;
		}

		context.stopShaderSeq() ;
	}

}




module.exports.__SHIPPABLE = true ;