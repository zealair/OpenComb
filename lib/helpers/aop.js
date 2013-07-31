
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

exports.watch = function(object,propertyName,setter,getter)
{
	// setup
	if( !object["$%@"+propertyName] )
	{
		object["$%@"+propertyName] = object[propertyName] ;
		delete object[propertyName] ;

		object["$%@"+propertyName+":getters"] = [] ;
		object["$%@"+propertyName+":setters"] = [] ;

		object.__defineSetter__(propertyName,function(v){

			for(var i=0;i<object["$%@"+propertyName+":setters"].length;i++)
				object["$%@"+propertyName+":setters"][i].call(this,v,object,propertyName) ;

			object["$%@"+propertyName] = v ;
		}) ;
		object.__defineGetter__(propertyName,function(){

			for(var i=0;i<object["$%@"+propertyName+":getters"].length;i++)
				object["$%@"+propertyName+":getters"][i].call(this,object,propertyName) ;

			return object["$%@"+propertyName] ;
		}) ;
	}


	if(setter)
		object["$%@"+propertyName+":setters"].push(setter) ;
	if(getter)
		object["$%@"+propertyName+":getters"].push(getter) ;
}

exports.factory = function()
{
	return exports ;
}

