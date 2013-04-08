var Controller = require("./Controller") ;
var fs = require("fs") ;
var marked = require ("marked");

marked.setOptions({
	gfm: true,
	tables: true,
	breaks: false,
	pedantic: false,
	sanitize: true,
	smartLists: true,
	langPrefix: 'language-',
	highlight: function(code, lang) {
		if (lang === 'js') {
			return highlighter.javascript(code);
		}
		return code;
	}
});

var markdownDocumentCaches = {} ;

module.exports = function(seed,nut,earth)
{
	var fullpath = process.cwd() + earth.req._parsedUrl.pathname ;

	fs.exists( fullpath, function(exists){

		if( !exists )
		{
			try{
				fullpath = require.resolve(earth.req._parsedUrl.pathname.substr(1)) ;
			}catch(err){
				nut.write( "can not found page:"+earth.req.url ) ;
				earth.release() ;
				return ;
			}
		}

		if( markdownDocumentCaches[fullpath] )
		{
			nut.write( markdownDocumentCaches[fullpath] ) ;
			earth.release() ;
		}

		else
		{
			fs.readFile(fullpath,function(err,buff){

				if(err)
				{
					console.log(err) ;
				}
				else
				{
					markdownDocumentCaches[fullpath] = marked(buff.toString()) ;
					nut.write( markdownDocumentCaches[fullpath] ) ;

					// 安装文件监视器
					if( earth.platform.config.dev.watching.markdown )
					{
						fs.watchFile(fullpath,function(){
							console.log("markdonw file changed:"+fullpath) ;
							delete markdownDocumentCaches[fullpath] ;
						}) ;
					}
				}

				earth.release() ;
			}) ;
		}
	}) ;
}

module.exports.middleware = function(req,rsp,next)
{
	if( !/\.md$/i.test(req.url) )
	{
		next() ;
		return ;
	}

	Controller.load(module.exports,function(err,controller){
		controller.main(
			controller.createEarth(req,rsp)
		) ;
	},'ocplatform/lib/mvc/controller/MarkdownViewer.js') ;
}