
exports.before = function(joint,advice)
{
	return joint? function(){
		advice.apply(this,arguments) ;
		return joint.apply(this,arguments) ;
	}: advice ;
}

exports.after = function(joint,advice)
{
	return joint? function(){
		var ret = joint.apply(this,arguments) ;
		advice.apply(this,arguments) ;
		return ret ;
	}: advice ;
}

exports.around = function(joint,advice)
{
	advice.pointcuts = joint?
		function(){
			return joint.apply(this,arguments) ;
		} :
		function(){} ;
	return advice ;
}

exports.factory = function()
{
	return exports ;
}