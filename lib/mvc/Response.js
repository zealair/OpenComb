exports.buildControllerResponse = function(httpRspn){

	if( typeof httpRspn._isControllerResponse!="undefined" || httpRspn._isControllerResponse )
	{
		return ;
	}

	httpRspn._oriEnd = httpRspn.end || function(){} ;
	httpRspn._ended = false ;
	httpRspn._waiting = 0 ;
	httpRspn._timeout_ms = 30000 ;
	httpRspn._timer_id = null ;
	httpRspn._isControllerResponse = true ;

	httpRspn.wait = function()
	{
		this._waiting ++ ;
	}
	httpRspn.end = function()
	{
		if( (--this._waiting)<=0 )
		{
			if(typeof this._oriEnd=="function")
			{
				this._oriEnd() ;
			}
			this._ended = true ;
			clearTimeout(this._timer_id) ;
		}
	}
	httpRspn.setTimeout = function(ms,callback){
		if(this._timer_id!==null)
		{
			clearTimeout(this._timer_id) ;
		}

		this._timeout_ms = ms ;

		if(this._timeout_ms>0)
		{
			var rspn = this ;
			this._timer_id = setTimeout(function(){
				if( !callback || callback()!==false )
				{
					rspn._oriEnd() ;
					rspn._ended = true ;
				}
			},this._timeout_ms) ;
		}
	}

	// default timeout
	httpRspn.setTimeout(30000) ;

	return httpRspn ;

}