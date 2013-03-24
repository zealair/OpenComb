
module.exports.replacein = function(newview,target)
{
	var $target = $(target) ;
	var $newview = $(newview) ;

	var wrapperHtml = "<div class='ocview-switch-wapper' style='overflow: hidden'>" ;
	wrapperHtml+= "<div class='ocview-switch-animation'>" ;
	wrapperHtml+= "<div class='ocview-switch-item-target' style='float:left'></div>" ;
	wrapperHtml+= "<div class='ocview-switch-item-new' style='float:left'></div>" ;
	wrapperHtml+= "<div style='clear:both'></div>" ;
	wrapperHtml+= "</div>" ;
	wrapperHtml+= "</div>" ;
	var $wrapper = $(wrapperHtml) ;

	$target.replaceWith($wrapper) ;
	$wrapper.find(".ocview-switch-item-target").append(target) ;
	$wrapper.find(".ocview-switch-item-new").append(newview) ;

	$wrapper.width($target.width()) ;
	$wrapper.height($target.height()) ;
	$wrapper.find('.ocview-switch-animation')
			.width($target.width()+$newview.width())
			.animate({
				"margin-left":-$target.width()
			},200,null
			,function(){
				// 移除 wrapper
				$wrapper.replaceWith($newview) ;
			}) ;

}

