
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
