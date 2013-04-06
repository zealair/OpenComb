
module.exports = {

	db: {
		server: "127.0.0.1"
		, name: 'opencomb'
		, username: ''
		, password: ''
	}

	, server: {
		port: 6060
	}


	, enableDev: false

	, dev: {

		frontend: {
			dontBundle: true
		}

		, watching: {
			template: true
			, controller: true
			, shipdown: true
		}
	}
}