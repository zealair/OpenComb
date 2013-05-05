if( typeof require!='undefined' )
{
	var strutil = require("ocplatform/lib/util/string.js") ;
}

(function($){

	function Validators()
	{
		this._validators = {} ;
	}

	Validators.prototype.register = function(attrName,option)
	{
		attrName = attrName.toLowerCase() ;
		this._validators[attrName] = option ;
	}

	// 前端 browser
	$.ocvalidators = new Validators() ;

	function _escapeSelector(str)
	{
		return str.replace(/[\.:#]/g,"\\$&") ;
	}

	// 内置的 validator
	function _length(element)
	{
		var type = $(element).attr('type') ;

		// 复选框
		if( element.tagName=="INPUT" && (type=='checkbox'||type=='radio') )
		{
			var selector = "input:checked[type=checkbox][name=\""+_escapeSelector($(element).attr('name'))+"\"]" ;

			// checkbox 的 change 事件触发时，checked 属性尚未改变
			if( typeof event!='undefined' && event.srcElement )
			{
				var others = $(selector).not(event.srcElement).length ;
				var srcElement = event.srcElement.checked? 1: 0 ;
				return others + srcElement ;
			}
			else
			{
				return $(selector).length ;
			}
		}

		// select
		else if( element.tagName=="SELECT" )
		{
			// 多选
			if( element.attr("multiple") )
			{
				return $(element).find("option:selected").length ;
			}
			// 单选
			else
			{
				return element.selectedIndex ;
			}
		}

		else
		{
			return $(element).val().length ;
		}
	}
	$.ocvalidators.register(
		"max"
		, {
			validateElement: function(element,config)
			{
				var config = parseInt(config) ;
				return _length(element)<=config ;
			}
			, failedMessage: function(config,element)
			{
				return [ "长度不能大于 %s", [config] ] ;
			}
		}
	) ;

	$.ocvalidators.register(
		"min"
		, {
			validateElement: function(element,config)
			{
				var config = parseInt(config) ;
				return _length(element)>=config ;
			}
			, failedMessage: function(config,element)
			{
				return [ "长度不能小于 %s", [config] ] ;
			}
		}
	) ;

	$.ocvalidators.register(
		"email"
		, {
			validateValue: function(value)
			{
				if(!value)
				{
					return true ;
				}

				return /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/.test( value.toString() )
			}
			, failedMessage: function(config,element){
				return ["不是有效的电邮格式",[]] ;
			}
		}
	) ;

	$.ocvalidators.register(
		"notempty"
		, {
			validateElement: function(element,config)
			{
				if( this.tagName=="SELECT" && !$(this).attr("multiple") )
				{
					return _length(element)>=0 ;
				}
				else
				{
					return !!_length(element) ;
				}
			}
			, failedMessage: function(config,element){
				return ["不能为空",[]] ;
			}
		}
	) ;

	// -------
	function _validateElement(vdefine,config)
	{
		var messagelabel = $(this).attr("v:messagelabel") ;

		// 清理上一次校验的显示结果
		$(this).removeClass("ocvalidation-failed").removeClass("ocvalidation-success") ;
		if(messagelabel)
		{
			$(messagelabel).html("") ;
		}
		else
		{
			$(this).popover("hide") ;
		}

		// json config
		if( typeof config=='string' && /^\s*\{.+\}\s*$/.test(config) )
		{
			try{
				config = eval("("+config+")") ;
			}catch(err){
				throw new Error("属性中的json存在语法错误："+config) ;
			}
		}

		if( vdefine.validateElement )
		{
			var ret = vdefine.validateElement(this,config) ;
		}
		else if( vdefine.validateValue )
		{
			var ret = vdefine.validateValue( $(this).val(), config ) ;
		}

		var message = ["",[]] ;
		var thisresult = true ;

		// 返回消息队列
		if( ret && ret.constructor===Array )
		{
			message = ret ;
			thisresult = false ;
		}

		// 返回 bool 结果
		else
		{
			if(!ret)
			{
				// validator option 中的 failedMessage() 函数
				if(vdefine.failedMessage)
				{
					message = vdefine.failedMessage(config,this) ;
				}
				thisresult = false ;
			}
		}

		if(thisresult)
		{
			$(this).addClass("ocvalidation-success") ;
			return true ;
		}

		result = false ;
		$(this).addClass("ocvalidation-failed") ;

		//

		// 显示错误消息
		// -------
		// 优先使用 input 中的 v:failedMessage 属性
		if( $(this).attr("v:failedMessage") )
		{
			message = [ $(this).attr("v:failedMessage"), [] ] ;
		}

		if( message && message[0] )
		{
			var args = [ message[0].toString() ] ;
			args = args.concat( message[1]||[] ) ;

			message = strutil.sprintf.apply(null,args) ;
			if(message)
			{
				// 显示在固定element内
				if( messagelabel )
				{
					$(messagelabel).append("<div class='faildmessage'>"+message+"</div>") ;
				}

				// popup
				else
				{
					console.log({html:true,content:message,trigger:"manual"}) ;
					$(this)
						.popover("destroy")
						.popover({
							html:true
							, content: '<button type="button" class="close" style="margin-left:10px;">×</button><span class="faildmessage">'+message+'</span>'
							, trigger: "manual"
							, delay: {hide:2000}
						})
						.popover("show") ;

					// 关闭按钮事件
					var ipt = this ;
					 $(this).next(".popover").find(".close").click(function(){
						$(ipt).popover("hide") ;
					}) ;
				}
			}
		}

		return result ;
	}


	$.fn.validate = function(stopFailed)
	{
		var result = true ;
		try{
			this.eachValidation(function(vdefine,config){
				var thisres = _validateElement.apply(this,arguments) ;
				thisres || (result = false) ;
				if(!thisres && stopFailed)
				{
					var err = new Error() ;
					err.code="stop" ;
					throw err ;
				}
			}) ;
		}catch(err){
			if(err.code!="stop")
			{
				throw err ;
			}
		}
		return result ;
	}


	$.fn.eachValidation = function(func)
	{
		if( this.length<0 || !func )
		{
			return ;
		}

		// 校验指定表单控件
		if( this[0].tagName=='INPUT' || this[0].tagName=='SELECT' || this[0].tagName=='TEXTAREA' )
		{
			for(var attrName in $.ocvalidators._validators)
			{
				var vdefine = $.ocvalidators._validators[attrName] ;
				var config = $(this).attr("v:"+attrName) ;
				if(config!==undefined)
				{
					func.apply(this[0],[vdefine,config]) ;
				}
			}
		}
		// 校验整个 form 或 div,p 等元素内的所有表单控件
		else
		{
			for(var attrName in $.ocvalidators._validators)
			{
				var vdefine = $.ocvalidators._validators[attrName] ;
				$("[v\\:"+_escapeSelector(attrName)+"]").each(function(){
					var config = $(this).attr("v:"+attrName) ;
					func.apply(this,[vdefine,config]) ;
				}) ;
			}
		}
	}

	if(typeof document!="undefined")
	{
		$(document)
			.on("submit",function(){
				if( !$(this).validate() )
				{
					window.event.returnValue = false ;
					return false ;
				}
			})
			.on("change",function(){
				$(event.srcElement).validate() ;
			})
			.on("keyup",function(){
				$(event.srcElement).validate() ;
			}) ;
	}

}) (jQuery) ;

