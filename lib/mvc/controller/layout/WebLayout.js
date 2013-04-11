module.exports = {

	title: "蜂巢"
	, titleTemplate: "%s - 蜂巢"
	, layout: null
	, children: {
		userpad: "ocplatform/lib/usr/MiniUserPad.js"
	}
	, process: function()
	{
		// nothing todo
		return true ;
	}

	, viewIn: function()
	{
		$(".linkway").popover({
			placement: 'bottom'
			, title: '联系方式'
			, content: $('div.linkway-content').html()
			, html: true
			, animation: true
			, trigger: 'hover'
		}) ;
	}
} ;

module.exports.__as_controller = true ;
