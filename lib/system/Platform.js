
var Class = require("ocClass/lib/Class.js") ;
var _pt = require("path") ;
var fs = require("fs") ;
var http = require('http');


var Platform = module.exports = Class.extend({

	ctor: function(port,dbpath){

		var platform = this ;

		this._args = {
			port: port || this._args.port
			, dburl: dbpath || this._args.dburl
		}

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

			// public
			.use(connect.static(__dirname+'/../../public'))

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

		http.createServer(this.server).listen(this._args.port,function(err){
			if(callback)
			{
				callback(err) ;
			}
		});
	}

	, _createShipper: function(shipper)
	{
		var ShipperServer = require("ocPlatform/lib/ship/ShipperServer.js") ;
		var shipper = new ShipperServer() ;
		shipper.registerAllowFilter(function(path){
			// checking is view onRender script
			return path.match(/[\/\\]templates[\/\\]/)
				&& path.substr(-3).toLowerCase()==".js"
				&& fs.existsSync(require.resolve(path.substring(0,path.length-3)+".html"))
			;
		}) ;

		shipper.registerAllowFolder( _pt.dirname(require.resolve("ocHtmlParser/package.json"))+"/lib/" ) ;
		shipper.registerAllowFolder( _pt.dirname(require.resolve("ocTemplate/package.json"))+"/lib/" ) ;
		shipper.registerAllowFolder( _pt.dirname(require.resolve("stack-trace/package.json"))+"/lib/" ) ;

		return shipper ;
	}
}) ;


Platform._moduleAlias = {}
Platform.registerModuleAlias = function(alias,dir)
{
	Platform._moduleAlias[alias] = dir ;
}

