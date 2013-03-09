
var Class = require("ocClass.js/lib/Class.js") ;
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
			.use(function(req, rspn, next){
				var controller = platform.router.route(req,rspn) ;

				if(controller)
				{
					controller.main(req,rspn) ;
				}

				rspn.end() ;
			})
		;
	}

	, _args: {
		port: 6060
		, dburl: "mongodb://localhost/opencomb"
	}

	, startup: function(){


		var http = require('http');
		http.createServer(this.server).listen(this._args.port);

	}

}) ;