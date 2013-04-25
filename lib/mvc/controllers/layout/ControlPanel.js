module.exports = {

	view: "ocplatform/templates/ControlPanel.html"
	, layout: null
	, process: function(seed,nut,earth)
	{
		nut.model.id = earth.req.session.idmgr.current() ;

		return true ;
	}
}

module.exports.__as_controller = true ;