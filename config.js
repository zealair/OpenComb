
module.exports = {

	db: {
		server: "127.0.0.1"
		, name: 'opencomb'
		, username: 'oc'
		, password: '111111'
	}

	, server: {
		port: 6060
	}


	, enableDev: true

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