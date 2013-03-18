module.exports = function RenderBuffer (){
	this._buffs = [] ;
	this._assent_parent = null ;
	this._assent_mode = -1 ;
}

module.exports.mode = {
	unuse: 0
	, weak: 1
	, soft: 3
	, hard: 5
}

module.exports.prototype.write = function(data,mode)
{
	if(data===null || data===undefined)
	{
		return ;
	}

	if( !this._buffs.length || typeof data!=typeof this._buffs[this._buffs.length-1] )
	{
		mode = mode || "weak" ;
		mode = typeof module.exports.mode[mode]=="undefined"? module.exports.mode.weak: module.exports.mode[mode] ;

		if( typeof data._assent_mode=="undefined" || data._assent_mode<mode )
		{
			if(data._assent_parent)
			{
				data._assent_parent.erase( data ) ;
			}

			this._buffs.push(data) ;
			data._assent_parent = this.buff ;
			data._assent_mode = mode ;
		}
	}
	else
	{
		this._buffs[this._buffs.length-1]+= data.toString() ;
	}
}

module.exports.prototype.toString = function(data)
{
	var string = "" ;

	for(var i=0;i<this._buffs.length;i++)
	{
		string+= this._buffs[i].toString() ;
	}

	return string ;
}

module.exports.prototype.erase = function(data){
	for(var i=0;i<this._buffs.length;i++)
	{
		if( this._buffs[i]===data )
		{
			return this._buffs.splice(i,1)[0] ;
		}
	}
}

module.exports.prototype.release = function()
{
	this._assent_parent = null ;

	if(this._buffs)
	{
		var buff ;
		while(buff=this._buffs.shift())
		{
			if( buff.constructor===module.exports )
			{
				buff.release() ;
			}
		}

		this._buffs = null ;
	}
}