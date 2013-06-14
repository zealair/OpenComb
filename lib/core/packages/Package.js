var Steps = require("ocsteps");
var fs = require("fs");
var path = require("path");



module.exports = function()
{
	this.folder = undefined ;
	this.folderName = undefined ;
	this.meta = undefined ;
	this.inners = {} ;

	this.__defineGetter__("name",function(){

		if(this.meta)
		{
			return this.meta.name ;
		}
		else
		{
			return this.folderName ;
		}
	}) ;
}

module.exports.prototype.load = function(folder,callback)
{
	this.folder = path.normalize(folder) ;
	this.folderName = path.basename(this.folder) ;
	var self = this ;

	Steps(

		// 判断是否存在
		function(){
			fs.stat(folder,this.hold(function(err,stat){
				if(!stat)
				{
					throw new Error("package folder dose not exists:"+folder) ;
				}
				if(!stat.isDirectory())
				{
					throw new Error("path is not a directory:"+folder) ;
				}
			})) ;
		}

		// read package.json
		, function(){
			try{
				self.meta = require(this.folder + path.sep + 'package.json') ;
			}catch(err){
				if(err.code!=='MODULE_NOT_FOUND')
				{
					throw err ;
				}
			}
		}

		// recursive load inner package
		, function(){
			this.modulesFolder = this.folder + path.sep + "node_modules" ;
			fs.stat(this.modulesFolder,this.hold()) ;
		}
		, function(err,stat){
			if(!stat || !stat.isDirectory())
				this.terminate() ;
			fs.readdir(this.modulesFolder,this.hold()) ;
		}
		, function(err,files){
			if(err) throw new Error(err) ;
			if(!files || !files.length)
			{
				return ;
			}

            this.each(files,function(i,filename){

                // 忽略隐藏目录
                if(filename[0]=='.')
                {
                    return ;
                }

                fs.stat(this.modulesFolder+path.sep+filename,this.hold(function(err,stat){

                    if(err) throw err ;

                    if(!stat.isDirectory())
                    {
                        return ;
                    }

                    self.addInnerPackage(this.modulesFolder+path.sep+filename,this.hold(function(err){
                        if(err) throw err ;
                    })) ;

                })) ;
            }) ;
		}

	).done(function(err){
		callback && callback(err,self) ;
	}).bind(this)() ;
}

module.exports.prototype.addInnerPackage = function(folder,callback)
{
	var self = this ;
	var pkg = new module.exports() ;
	pkg.load(folder,function(err){
		if( !err )
		{
			self.inners[pkg.folderName] = pkg ;
			self.inners[pkg.name] || (self.inners[pkg.name]=pkg) ; // 同名pacakge中,folder name 的优先级高于 package.json中的name
			
			pkg.parent = self ;
		}
		callback&&callback(err,pkg) ;
	}) ;

	return this ;
}

module.exports.prototype.dep = function(name)
{
	if( this.inners[name] )
	{
		return this.inners[name] ;
	}
	else
	{
		return this.parent? this.parent.dep(name): null ;
	}
}

module.exports.firstSlide = function(pt,start){

	if(!pt) return [""] ;

	var regexp = /[\/\\]/g ;
	regexp.lastIndex = start || 0 ;

	var pos = regexp.exec(pt) ;
	if(pos)
	{
		return [pt.slice(start,pos.index),pt.substr(pos.index+1)] ;
	}
	else
	{
		return [pt.slice(start)] ;
	}
}

module.exports.prototype.locate = function(pt)
{

	pt = path.normalize(pt) ;
	if(pt[0]=='/' || pt[1]==':' )
	{
		if( pt==this.folder || pt==this.folder+path.sep )
		{
			return this ;
		}

		if( pt.substr(0,this.folder.length+1)==this.folder+path.sep )
		{
			return this.innerPackage(pt.substr(this.folder.length+1)) ;
		}
		else
		{
			return this.parent? this.parent.locate(pt): null ;
		}
	}

	else
	{
		var arr = module.exports.firstSlide(pt,0) ;
		var depPkg = this.dep(arr[0]) ;
		return depPkg? depPkg.innerPackage(arr[1]): null ;
	}
}


module.exports.prototype.innerPackage = function(innerpath)
{
	if(!innerpath)
		return this ;

	if(innerpath.substr(0,13)=="node_modules"+path.sep)
	{
		var arr = module.exports.firstSlide(innerpath,13) ;
		var depName = arr[0] ;
		var subpt = arr[1] ;

		return this.inners[depName]? this.inners[depName].innerPackage(subpt): null ;
	}
	else
	{
		return this ;
	}
}

