

exports.search = function(arr,ele)
{
	for(var i=0;i<arr.length;i++)
	{
		if( arr[i] == ele )
		{
			return i ;
		}
	}

	return false ;
}




module.exports.__SHIPPABLE = true ;