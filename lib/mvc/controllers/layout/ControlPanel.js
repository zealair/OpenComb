module.exports = {

	view: "ocframework/templates/ControlPanel.html"
	, layout: null
	, title: "蜂巢控制面板"
	, titleTemplate: "%s-蜂巢控制面板"
	, process: function(seed,nut)
	{
		nut.model.id = this.req.session.idmgr.current() ;
		return true ;
	}
}

module.exports.__as_controller = true ;