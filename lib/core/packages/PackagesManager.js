var Package = require("./Package.js") ;

module.exports = function(){

	this.root = new Package ;
	this.assertLookups = {

		controller: [
			// 省略 package 根目录下的 'lib'
			function(pkg,innerpath){
				return pkg.folderName + '/lib/' + innerpath ;
			}
		]

		, template: [
			// 省略 package 根目录下的 'tempates'
			function(pkg,innerpath){
				return pkg.folderName + '/templates/' + innerpath ;
			}
		]
	}

}


module.exports.prototype.resolve = function(path,from,type)
{
	if(!path)
	{
		throw new Error("missing path") ;
	}
	if(typeof path!='string')
	{
		throw new Error("path must be a string")
	}

	// 绝对路径
	if(path[0]=='/')
	{
		return require.resolve(path) ;
	}

	// 相对路径
	else
	{
		if( path.substr(0,2)=='./' || path.substr(0,3)=='../' )
		{
			path = (from?(from+"/"):'') + path ;
			return require.resolve(path) ;
		}

		else
		{
			var frompkg = this.root.locale(from) ;
			if(!frompkg)
			{
				var err = new Error("Cannot find module: '"+path+"'") ;
				err.code = 'MODULE_NOT_FOUND' ;
				throw err ;
			}
			var arr = firstSlide(path) ;
			var pkg = frompkg.dep(arr[0]) ;
			if(!pkg)
			{
				return undefined ;
			}

			realpath = pkg.folderName + "/" + (arr[1]||'') ;

			try{
				return require.resolve(realpath) ;
			}catch(e){
				if(e.code=="MODULE_NOT_FOUND" && type)
				{
					var resolved = this.assertResolve(pkg,arr[1],type) ;
					if( !resolved )
					{
						throw e ;
					}
					else
					{
						return resolved ;
					}
				}
				else
				{
					throw e ;
				}
			}
		}
	}
}

module.exports.prototype.assertResolve = function(pkg,innerpath,type)
{
	if(this.assertLookups[type])
	{
		for(var i=0;i<this.assertLookups[type].length;i++)
		{
			var path = this.assertLookups[type][i](pkg,innerpath) ;

			try{
				return require.resolve(realpath) ;
			}catch(e){
				if(e.code!="MODULE_NOT_FOUND")
				{
					throw e ;
				}
			}
		}
	}
}