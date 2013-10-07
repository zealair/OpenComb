var Application = require("../lib/core/Application.js") ;
var fs = require("fs") ;
var https = require("https") ;

var markdownDocumentCaches = {} ;

module.exports = {

	view: "opencomb/templates/DocViewer.html"

	, process: function(seed,nut)
	{
		var fullpath = Application.singleton.rootdir + this.req._parsedUrl.pathname ;

		fs.exists( fullpath, this.hold()) ;

        this.step(function(exists){
            if( !exists )
            {
                try{
                    fullpath = require.resolve(this.req._parsedUrl.pathname.substr(1)) ;
                }catch(err){
                    nut.write( "can not found page:"+this.req.url ) ;
                    return ;
                }
            }

            if( markdownDocumentCaches[fullpath] )
            {
                nut.model.content = markdownDocumentCaches[fullpath] ;
            }

            else
            {
                fs.readFile(fullpath,this.hold()) ;
                this.step(function(err,buff){

                    if(err)
                    {
                        console.log(err) ;

                    }
                    else
                    {
                        renderMarkdownViaGithub(buff,this.hold(function(err,html){
                            if(err)
                            {
                                console.log(err) ;
                            }

                            nut.model.content = html ;
                            markdownDocumentCaches[fullpath] = html ;

                            // 安装文件监视器
                            if( Application.singleton.config.dev.watching.markdown )
                            {
                                fs.watchFile(fullpath,function(){
                                    console.log("markdonw file changed:"+fullpath) ;
                                    delete markdownDocumentCaches[fullpath] ;
                                }) ;
                            }
                        })) ;

                    }
                })
            }
        })
	}

	, viewIn: function()
	{
		$(this).find("a").each(function(){
			if( !/^https?:\/\//i.test($(this).attr("href")) )
			{
				$(this).addClass("stay") ;
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

		helper.controller(module.exports,function(err,cls){

            var controller = cls.instance(req,res) ;
            controller.seed.fillFromReq() ;
            controller.main() ;

		},'opencomb/lib/mvc/controllers/DocViewer.js') ;
	}
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
            , 'User-Agent': 'ocman'
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

