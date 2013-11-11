var text = new require("octemplate/lib/shaderfuncs/text.js") ;

module.exports = {

    selector: ["link","script","require","assets"]

    , shader: function(node,buff,next,generator,tpl){

	var tagName = node.tagName.toLowerCase() ;

	if( tagName=="assets" )
	{
            var type = text.joinAsString(node.attributes.type) ;

	    buff.write("// 在此集中输出各个模板中请求的 css 文件") ;
	    buff.write("buff.write($model.$view.assets.buffer("+type+")) ;") ;

            return ;
	}

	// link
	else if(tagName=="link")
	{
	    if(node.attributes.href)
	    {
		var url = text.joinAsString(node.attributes.href) ;
		buff.write("// 搜集css文件") ;
		buff.write("$model.$view.assets.putin("+url+",'css') ;") ;

                return ;
	    }
	}

        // script
        else if( (tagName=="script" && node.attributes.src) || tagName=='require' )
        {
            var once = (node.attributes.once?node.attributes.once.nodeValue:"true").toString().toLowerCase() ;
            once = !(once=='false'||once=='0'||once=='off') ;

            if(once)
            {
                var url = text.joinAsString(node.attributes.src) ;

                buff.write("// 搜集css文件") ;
	        buff.write("$model.$view.assets.putin("+url+",'script') ;") ;

                return ;
            }
        }

        next() ;
    }

}




module.exports.__SHIPPABLE = true ;
