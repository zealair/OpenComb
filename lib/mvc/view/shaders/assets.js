var text = new require("octemplate/lib/shaderfuncs/text.js") ;

module.exports = {

	selector: ["link","script","assets"]

	, shader: function(node,buff,next,generator,tpl){

		var tagName = node.tagName.toLowerCase() ;

		if( tagName=="assets" )
		{
                    	var type = text.joinAsString(node.attributes.type) ;

			buff.write("// 在此集中输出各个模板中请求的 css 文件") ;
			buff.write("buff.write($model.$view.assets.buffer("+type+")) ;") ;
		}

	        // link
	        else if(tagName=="link")
		{
			if(node.attributes.href)
			{
				var url = text.joinAsString(node.attributes.href) ;
				buff.write("// 搜集css文件") ;
				buff.write("$model.$view.assets.putin("+url+",'css') ;") ;
			}
		}

                // script
                else if(tagName=="script")
                {
                    if(node.attributes.src)
                    {
                        var url = text.joinAsString(node.attributes.src) ;

                        buff.write("// 搜集css文件") ;
			buff.write("$model.$view.assets.putin("+url+",'script') ;") ;
                    }
                }
	}

}




module.exports.__SHIPPABLE = true ;
