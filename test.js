
var Step = require("step") ;





Step(

	function one() {
		var group = this.group() ;


		(function(callback){
			setTimeout( function(){ console.log(1); callback(0,1,1) }, 10) ;
		}) (group(4)) ;

		(function(callback){
			setTimeout( function(){ console.log(2); throw new Error(); callback(0,2) }, 20) ;
		}) (group(5)) ;

		(function(callback){
			setTimeout( function(){ console.log(3); callback(0,3) }, 30) ;
		}) (group(6)) ;


		console.log(arguments.callee.name,arguments) ;
	},
	function two(err, num) {
		console.log(arguments.callee.name,arguments) ;
	}

//	function one()
//	{
//		console.log(arguments.callee.name) ;
//		setTimeout(this.parallel(),10) ;
//		setTimeout(this.parallel(),20) ;
//		setTimeout(this.parallel(),30) ;
//	} ,
//
//	function two(err)
//	{
//		console.log(arguments.callee.name,arguments) ;
//	} ,
//
//	function three(err)
//	{
//		console.log(arguments.callee.name,arguments) ;
//	}

) ;
