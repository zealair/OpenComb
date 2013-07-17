module.exports = {

	process: function(){}

	, children: {
		"bbb": __dirname+"/ControllerB.js"

		, "ccc": {
			process: function(){}
		}
	}
}