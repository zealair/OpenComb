var fs = require("fs") ;

module.exports = {

	belongsModule: function(dir){

		dir = path.normalize(dir) ;

		while(dir && dir!="/")
		{
			if( fs.existsSync(dir+"/package.json") )
			{
				return true ;
			}

			dir = path.dirname(dir) ;
		}

		return false ;
	}

}