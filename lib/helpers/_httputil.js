

exports.getString = function(protocal,opts,cb) {
    return protocal.get( opts, function(res){
	var string = "" ;
	res.on("data",function(buff){
	    string+= buff.toString() ;
	})
	.on("end",function(){
	    cb && cb (null,string) ;
	}) ;
    })
    .on("error",cb) ;
}

exports.getJSON = function(protocal,opts,cb) {
    return exports.getString(protocal,opts,function(err,string){
	if(err) {
	    cb && cb (err) ;
	    return ;
	}
	try{
	    cb && cb (null,JSON.parse(string)) ;
	}catch(err){
	    cb && cb (err) ;
	}
    }) ;
}
