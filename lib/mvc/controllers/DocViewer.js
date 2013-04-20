var Controller = require("../Controller.js") ;
var fs = require("fs") ;
var https = require("https") ;

var markdownDocumentCaches = {} ;

module.exports = {

	view: "ocplatform/templates/DocViewer.html"

	, process: function(seed,nut,earth)
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
				nut.model.content = markdownDocumentCaches[fullpath] ;
				earth.release() ;
			}

			else
			{
				fs.readFile(fullpath,function(err,buff){

					if(err)
					{
						console.log(err) ;
						earth.release() ;
					}
					else
					{
						renderMarkdownViaGithub(buff,function(err,html){
console.log("renderMarkdownViaGithub() cb") ;
							if(err)
							{
								console.log(err) ;
							}

							nut.model.content = html ;
							markdownDocumentCaches[fullpath] = html ;

							// 安装文件监视器
							if( earth.platform.config.dev.watching.markdown )
							{
								fs.watchFile(fullpath,function(){
									console.log("markdonw file changed:"+fullpath) ;
									delete markdownDocumentCaches[fullpath] ;
								}) ;
							}

							earth.release() ;
						}) ;

					}
				}) ;
			}
		}) ;
	}


	, middleware: function(req,res,next)
	{
		if( !/\.md(\?.*)?$/i.test(req._parsedUrl? req._parsedUrl.pathname: req.url) )
		{
			next() ;
			return ;
		}

		res.setHeader("Content-Type", "text/html") ;
		res.setHeader("Power-by", "OpenComb") ;
		res.setHeader("render-by", "api.github.com") ;

		Controller.load(module.exports,function(err,controller){

			controller.main( controller.createEarth(req,res) ) ;

		},'ocplatform/lib/mvc/controllers/DocViewer.js') ;
	}
	, __as_controller: true
}

function renderMarkdownViaGithub(mdBuff,callback)
{
	var body = new Buffer(JSON.stringify({
		text: mdBuff.toString()
	})) ;

	var req = https.request({
		hostname: 'api.github.com'
		, path: '/markdown'
		, method: 'POST'
		, headers: {
			'Content-Type': 'application/json'
			, 'Content-Length': body.length
		}
	},function(res){

		var data = '' ;
		res.on("data",function(chunk){
			data+= chunk.toString() ;
		})
		res.on("end",function(){
			callback && callback(null,data) ;
		})
	}) ;

	req.write(body) ;

	req.on("error",function(err){
		callback && callback(err) ;
	}) ;

	req.end() ;
}

