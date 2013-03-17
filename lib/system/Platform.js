
var Class = require("ocClass/lib/Class.js") ;
var _pt = require("path") ;
var fs = require("fs") ;
var http = require('http');


var Platform = module.exports = Class.extend({

	ctor: function(port,dbpath,rootdir){

		var platform = this ;

		this._args = {
			port: port || this._args.port
			, dburl: dbpath || this._args.dburl
		}
		this._rootdir = rootdir ;

		var connect = require('connect') ;


		var Router = require("./Router.js") ;
		this.router = new Router() ;
		this.shipper = this._createShipper() ;

		this.server = connect()
			.use(connect.favicon())
			.use(connect.logger('dev'))
			.use(connect.cookieParser())
			.use(connect.session({ secret: 'my secret here' }))

			// shipper script who could run both of server and client
			.use(function(req,rspn,next){
				return platform.shipper.connect_middleware(req,rspn,next) ;
			})
			.use(connect.static(_pt.dirname(require.resolve("ocShipper/lib/client-side/Shipper.js"))))

			// front lib
			.use(connect.static(_pt.dirname(__dirname) + '/frontend'))

			// controller router
			.use(function(req, rspn, next){
				platform.router.route(req,rspn,next) ;
			})

			// 404
			.use(function(req,rspn){
				rspn.write("404") ;
				rspn.end() ;
			})
		;
	}

	, _args: {
		port: 6060
		, dburl: "mongodb://localhost/opencomb"
	}

	, startup: function(callback){

		//
		this._resolveRootModule(function(err,platform){
			if(err)
			{
				callback(err) ;
				return ;
			}

			http.createServer(platform.server).listen(platform._args.port,function(err){
				if(err)
				{
					console.log("OpenComb has started up on port "+platform._args.port) ;
				}

				if(callback)
				{
					callback(err) ;
				}
			});

		}) ;
	}

	, _resolveRootModule: function(callback){
		try{
			var pkg = require( this._rootdir+"/package.json" ) ;
		}catch(err)
		{
			callback(new Error("not found package.json under your root dir: "+this._rootdir+"/package.json")) ;
			return ;
		}

		if( typeof pkg.name=="undefined" )
		{
			callback(new Error("there is no \"name\" field in package.json under your root dir, package.json path: "+this._rootdir+"/package.json")) ;
			return ;
		}

		Platform.registerModuleAlias(pkg.name,this._rootdir) ;

		callback(null,this) ;
	}

	, _createShipper: function(shipper)
	{
		var Shipper = require("ocShipper/lib/server-side.js").Shipper ;
		var shipper = new Shipper() ;

		shipper._oriCheckShippable = shipper.checkShippable ;
		shipper.checkShippable = function(path){
			if( this._oriCheckShippable(path) )
			{
				return true ;
			}
			else
			{
				console.log(path.substr(-3).toLowerCase()) ;
				console.log(path.substring(0,path.length-3)+".html") ;

				// checking is view onRender script
				if( path.match(/[\/\\]templates[\/\\]/)
					&& path.substr(-3).toLowerCase()==".js"
					&& fs.existsSync(require.resolve(path.substring(0,path.length-3)+".html"))
					){
					return true ;
				}

			}

			return false ;
		}

		return shipper ;
	}
}) ;


Platform._moduleAlias = {}
Platform.registerModuleAlias = function(alias,dir)
{
	Platform._moduleAlias[alias] = dir ;
}

