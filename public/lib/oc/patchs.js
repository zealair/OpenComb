
if(typeof process=='undefined')
{
	process = {} ;
}

if(!process.nextTick)
{
	process.nextTick = function(callback)
	{
		setTimeout(callback,0) ;
	}
}



// 让ie支持 bind()
if (!Function.prototype.bind) { 
	Function.prototype.bind = function (oThis) { 
		if (typeof this !== "function") { 
			// closest thing possible to the ECMAScript 5 internal IsCallable function 
			throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable"); 
		} 
		
		var aArgs = Array.prototype.slice.call(arguments, 1), 
		fToBind = this, 
		fNOP = function () {}, 
		fBound = function () { 
			return fToBind.apply(
				this instanceof fNOP && (oThis?this:oThis)
				, aArgs.concat(Array.prototype.slice.call(arguments))
			); 
		}; 
		fNOP.prototype = this.prototype; 
		fBound.prototype = new fNOP(); 
		return fBound; 
	}; 
}


// 释放 $ 变量
// jQuery.noConflict() ;

// 兼容 jquery 1.9 以前的版本
jQuery.browser = {
    mozilla:	/firefox/.test(navigator.userAgent.toLowerCase())
    , webkit:	/webkit/.test(navigator.userAgent.toLowerCase())
    , opera:	/opera/.test(navigator.userAgent.toLowerCase())
    , msie:		/msie/.test(navigator.userAgent.toLowerCase())
} ;
