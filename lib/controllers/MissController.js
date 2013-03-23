module.exports = function(req,rspn){


	rspn.write(__filename) ;

	return true ;
};
