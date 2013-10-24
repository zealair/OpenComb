if( typeof require!='undefined' )
{
    var strutil = require("../util/string.js") ;
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

    /**
     * 如果校验通过返回 false， 否则返回错误消息： [ 'message format', [argvs] ]
     */
    Validators.prototype.validateRules = function(value,rules){
	for(var i=0;i<rules.length;i++){
	    var rule = rules[i] ;
	    var validator = this._validators[ rule.name ] ;
	    if( !validator )
		continue ;
	    
	    if( validator.config && rule.rule===undefined ){
		rule.rule = validator.config( rule.value) ;
	    }
	    if( validator.validate && !validator.validate(value,rule.rule) ){
		return validator.failedMessage? 
		    validator.failedMessage(rule.rule) :
		    ['',[]] ;
	    }
	}
	return false ;
    }

    // 前端 browser
    $.ocvalidators = new Validators() ;

    function _escapeSelector(str)
    {
	return str.replace(/[\.:#]/g,"\\$&") ;
    }


    // -----------------------------------
    // 内置的 validator
    function _length(element)
    {
	var type = ($(element).attr('type')||"text").toLowerCase() ;

	// 单选/复选框
	if( element.tagName=="INPUT" && (type=='checkbox'||type=='radio') )
	{
	    var selector = "input:checked[type="+type+"][name=\""+_escapeSelector($(element).attr('name'))+"\"]" ;
	    return $(selector).length ;
	}

	// select
	else if( element.tagName=="SELECT" )
	{
	    // 多选
	    if( $(element).attr("multiple") )
	    {
		return $(element).find("option:selected").length ;
	    }
	    // 单选
	    else
	    {
		return element.selectedIndex<0? 0: 1 ;
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
	    validateElement: function(element,config) {
		var config = parseInt(config) ;
		return _length(element)<=config ;
	    }
	    , validateValue: function(value,config) {
		return value.length<=configparseInt(config) ;
	    }
	    , failedMessage: function(config,element) {
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
		var len =  _length(element) ;
		return len<=0? true: len>=config ;
	    }
	    , validateValue: function(value,config){
		return value.length<=0? true: value.length>=configparseInt(config) ;
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
	    validateElement: function(element,config) {
		if( this.tagName=="SELECT" && !$(this).attr("multiple") )
		    return _length(element)>=0 ;
		else
		    return !!_length(element) ;
	    }
	    , validateValue: function(value) {
		return !!value ;
	    }
	    , failedMessage: function(config,element){
		return ["不能为空",[]] ;
	    }
	}
    ) ;

    $.ocvalidators.register(
	"date"
	, {
	    config: function(attrconfig) {
		(!attrconfig||attrconfig.toString().toLowerCase()=="v:date") && (attrconfig="yyyy-mm-dd") ;

		var regexp = attrconfig.replace(/[\-\/\,]/g,'\\$&')
		    .replace(/yyyy/ig,'%{4}')
		    .replace(/gmm/ig,'%{2}')
		    .replace(/dd/ig,'%{2}')
		    .replace(/yy/ig,'%{2}')
		    .replace(/m/ig,'%{1,2}')
		    .replace(/d/ig,'%{1,2}')
		    .replace(/%/ig,'\\d') ;
		//console.log(regexp) ;
		return new RegExp(regexp) ;
	    }
	    , validateValue: function(value,config) {
		return config.test(value) ;
	    }
	    , failedMessage: function(config,element) {
		return ["输入的内容不符合有效的时期格式：%s",[config=="v:date"?"yyyy-mm-dd":config]] ;
	    }
	}
    ) ;

    $.ocvalidators.register(
	"regexp"
	, {
	    config: function(attrconfig) {
		return new RegExp(attrconfig) ;
	    }
	    , validateValue: function(value,config) {
		return config.test(value) ;
	    }
	    , failedMessage: function(config,element){
		return ["输入的内容无效",[]] ;
	    }
	}
    ) ;

    // -------
    function _validateConfig(element,attrName,vdefine)
    {
	var config = element[attrName+":config"] ;
	if(config)
	{
	    return config ;
	}

	var config = $(element).attr(attrName) ;

	// json config
	if( typeof config=='string' && /^\s*\{.+\}\s*$/.test(config) )
	{
	    try{
		config = eval("("+config+")") ;
	    }catch(err){
		throw new Error("属性中的json存在语法错误："+config) ;
	    }
	}

	// 校验器的 config() 函数
	if( vdefine.config )
	{
	    config = vdefine.config(config) ;
	}

	element[attrName+":config"] = config ;

	return config ;
    }
    function _validateElement(vdefine,attrName)
    {
	var config = _validateConfig(this,'v:'+attrName,vdefine) ;
	var configValue = $(this).attr('v:'+attrName) ;


	var messagelabel = $(this).attr("v:label") || ".vlabel-"+_escapeSelector($(this).attr('name')) ;
	var $messagelabel = $(messagelabel) ;

	var failedclass = $(this).attr("v:failedclass") || '' ;

	// 清理上一次校验的显示结果
	$(this).removeClass("ocvalidation-failed").removeClass("ocvalidation-success") ;
	if( $messagelabel.length )
	{
	    $messagelabel.html('') ;
	}
	else
	{
	    $(this).popover("hide") ;
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
		    message = vdefine.failedMessage(configValue,this) ;
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
	if( $(this).attr("v:message") )
	{
	    message = [ $(this).attr("v:message"), [] ] ;
	}

	if( message && message[0] )
	{
	    var args = [ message[0].toString() ] ;
	    args = args.concat( message[1]||[] ) ;

	    message = strutil.sprintf.apply(null,args) ;
	    if(message)
	    {
		// 显示在固定element内
		if( $messagelabel.length )
		{
		    $messagelabel
			.html("<span class='ocvalidation-message "+failedclass+"'>"+message+"</span>") ;
		}

		// popup
		else
		{
		    $(this)
			.popover("destroy")
			.popover({
			    html:true
			    , content: '<button type="button" class="close" style="margin-left:10px;">×</button><span class="'+faildclass+'">'+message+'</span>'
			    , trigger: "manual"
			    , delay: {hide:2000}
			})
			.popover("show") ;

		    // 关闭按钮事件
		    var ipt = this ;
		    $(this).next(".popover")
			.click(function(){
			    $(ipt).popover("hide") ;
			})
			.find(".close").click(function(){
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
	if( this.length<=0 || !func )
	{
	    return ;
	}

	// 校验指定表单控件
	if( this[0].tagName=='INPUT' || this[0].tagName=='SELECT' || this[0].tagName=='TEXTAREA' )
	{
	    for(var i=0;i<this.length;i++){
		for(var attrName in $.ocvalidators._validators)
		{
		    var vdefine = $.ocvalidators._validators[attrName] ;
		    if($(this[i]).attr("v:"+attrName)!==undefined)
		    {
			//console.log(this.attr("name"),"-","v:"+attrName) ;
			func.apply(this[i],[vdefine,attrName]) ;
		    }
		}
	    }
	}
	// 校验整个 form 或 div,p 等元素内的所有表单控件
	else
	{
	    for(var attrName in $.ocvalidators._validators)
	    {
		//console.log("finding: ","[v\\:"+_escapeSelector(attrName)+"]",this)

		var vdefine = $.ocvalidators._validators[attrName] ;
		this.find("[v\\:"+_escapeSelector(attrName)+"]").each(function(){
		    //console.log($(this).attr("name"),"-","v:"+attrName) ;
		    func.apply(this,[vdefine,attrName]) ;
		}) ;
	    }
	}
    }

    // for frontend browser
    if(typeof document!="undefined")
    {
	$(document)
	    .on("submit","form",function(event){
		if( !$(event.target).validate() )
		{
		    event.returnValue = false ;
		    return false ;
		}
	    })
	    .on("change",function(event){
		$(event.target).validate() ;
	    })
	    .on("keyup","input,select,textarea",function(event){
		$(event.target).validate() ;
	    })
	    .on("blur","input,select,textarea",function(event){
		$(event.target).validate() ;
	    }) ;
    }


    // for nodejs
    else if( typeof module!='undefined' )
    {
	module.exports = $.ocvalidators ;	
    }

}) (typeof jQuery=='undefined'? {fn:{}}: jQuery) ;

