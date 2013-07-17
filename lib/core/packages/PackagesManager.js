var Package = require("./Package.js") ;
var utilarr = require("../../util/array.js") ;
var path = require("path") ;

module.exports = function(){

	this.root = new Package ;
	this.assertLookups = {

		controller: [
			// 省略 package 根目录下的 'lib'
			function(pkg,innerpath){
				return pkg.folder + path.sep + 'controllers' + path.sep + innerpath ;
			}
		]

		, template: [
			// 省略 package 根目录下的 'tempates'
			function(pkg,innerpath){
				return pkg.folder + path.sep + 'templates' + path.sep + innerpath ;
			}
		]
	}

}

function createModNotFoundError (pt){
    var err = new Error("Cannot find module: '"+pt+"'") ;
    err.code = 'MODULE_NOT_FOUND' ;
    return err ;
}


module.exports.prototype.resolve = function(pt,from,type)
{
	if(!pt)
	{
		throw new Error("missing path") ;
	}
	if(typeof pt!='string')
	{
		throw new Error("path must be a string")
	}

	// 绝对路径
	if(pt[0]=='/' || pt[1]==':')
	{
		return require.resolve(pt) ;
	}

	// 相对路径
	else
	{
		if( pt.substr(0,2)=='.'+path.sep || pt.substr(0,3)=='..'+path.sep )
		{
			pt = (from?(from+path.sep):'') + pt ;
			return require.resolve(pt) ;
		}

		else
		{
            var arr = Package.firstSlide(pt) ;

            if(from)
            {
                var frompkg = this.root.locate(from) ;
                if(!frompkg)
                {
                    throw createModNotFoundError(pt) ;
                }
                var pkg = frompkg.dep(arr[0]) ;
            }
            else
            {
                var pkg = this.root.inners[arr[0]] || this.root.name==arr[0] && this.root ;
            }

            if(!pkg)
            {
                throw createModNotFoundError(pt) ;
            }

            return this.assertResolve(pkg,arr[1]||'',type) ;
		}
	}
}

module.exports.prototype.assertResolve = function(pkg,innerpath,type)
{
    var fullpath = pkg.folder + path.sep + innerpath ;
    var err ;

    try{
        return require.resolve(fullpath) ;
    }catch(e){
        if(e.code!="MODULE_NOT_FOUND" )
        {
            throw e ;
        }
        err = e ;
    }

	if(this.assertLookups[type])
	{
		for(var i=0;i<this.assertLookups[type].length;i++)
		{
			var pt = this.assertLookups[type][i](pkg,innerpath) ;

			try{
				return require.resolve(pt ) ;
			}catch(e){
				if(e.code!="MODULE_NOT_FOUND")
				{
					throw e ;
				}
			}
		}
	}

    throw createModNotFoundError(innerpath) ;
}


module.exports.prototype.eachPackage = function(func,_parent)
{
    _parent || (_parent=this.root) ;

    func(_parent) ;

    var inners = [] ;
    for(var name in _parent.inners)
    {
        if( utilarr.search(inners,_parent.inners[name])===false )
        {
            inners.push(_parent.inners[name]) ;

            //
            this.eachPackage(func,_parent.inners[name]) ;
        }
    }
}
