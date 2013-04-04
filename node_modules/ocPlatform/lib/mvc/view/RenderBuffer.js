var Class = require("ocClass") ;

module.exports = Class.extend({

	ctor: function (){
		this._buffs = [] ;
		this._assent_parent = null ;
		this._assent_mode = -1 ;
	}

	, write: function(data,mode,top)
	{
		if(data===null || data===undefined)
		{
			return ;
		}

		var pos = top? 0: this._buffs.length ;
		var mergepos = top? 1: pos-1 ;

		if( !this._buffs.length || typeof data!="string" || typeof this._buffs[mergepos]!="string" )
		{
			mode = mode || "weak" ;
			mode = typeof module.exports.mode[mode]=="undefined"? module.exports.mode.weak: module.exports.mode[mode] ;

			if( !data._assent_mode || data._assent_mode<mode )
			{
				if(data._assent_parent)
				{
					data._assent_parent.erase( data ) ;
				}

				this._buffs.splice(pos,0,data) ;
				data._assent_parent = this ;
				data._assent_mode = mode ;
			}
		}
		else
		{
			if(top)
			{
				this._buffs[0] = data.toString() + this._buffs[0] ;
			}
			else
			{
				this._buffs[mergepos]+= data.toString() ;
			}
		}
	}

	, toString: function(data)
	{
		var string = "" ;

		if(this._buffs)
		{
			for(var i=0;i<this._buffs.length;i++)
			{
				string+= this._buffs[i].toString() ;
			}
		}

		return string ;
	}

	, erase: function(data){
		for(var i=0;i<this._buffs.length;i++)
		{
			if( this._buffs[i]===data )
			{
				return this._buffs.splice(i,1)[0] ;
			}
		}
	}

	, destroy: function()
	{
		this._assent_parent = null ;

		if(this._buffs)
		{
			var buff ;
			while(buff=this._buffs.shift())
			{
				if( buff.constructor===module.exports )
				{
					buff.destroy() ;
				}
			}

			this._buffs = null ;
		}
	}

},{

	mode : {
		unuse: 0
		, weak: 1
		, soft: 3
		, hard: 5
	}
}) ;



