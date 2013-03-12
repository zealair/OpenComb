
var Class = require("ocClass/lib/Class.js") ;
var Router = require("./Router.js") ;

module.exports = Class.extend({

	ctor: function(port,dbpath){

		var platform = this ;

		this._args = {
			port: port || this._args.port
			, dburl: dbpath || this._args.dburl
		}

		var connect = require('connect') ;

		this.router = new Router() ;

		this.server = connect()
			.use(connect.favicon())
			.use(connect.logger('dev'))
			.use(connect.static('public'))
			.use(connect.directory('public'))
			.use(connect.cookieParser())
			.use(connect.session({ secret: 'my secret here' }))

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
		var http = require('http');
		http.createServer(this.server).listen(this._args.port,function(err){
			if(err)
			{
				console.log("OpenComb has started up on port "+this._args.port) ;
			}

			if(callback)
			{
				callback(err) ;
			}
		});

	}

}) ;