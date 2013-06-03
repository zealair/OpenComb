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
			this.folderName ;
		}
	}) ;
}

module.exports.prototype.load = function(folder,callback)
{
	this.folder = path.normalize(folder) ;
	this.folderName = path.basename(this.folder) ;
	var self = this ;

	console.log(folder);
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
				self.meta = require(this.folder + '/package.json') ;
			}catch(err){
				if(err.code!=='MODULE_NOT_FOUND')
				{
					throw err ;
				}
			}
		}

		// recursive load inner package
		, function(){
			this.modulesFolder = this.folder+"/node_modules" ;
			fs.stat(this.modulesFolder,this.hold()) ;
		}
		, function(err,stat){
			if(!stat || !stat.isDirectory())
				return ;
			fs.readdir(this.modulesFolder,this.hold()) ;
		}
		, function(err,files){
			if(err) throw new Error(err) ;
			if(!files || !files.length)
			{
				return ;
			}

			for(var i=0;i<files.length;i++)
			{
				this.addInnerPackage(this.modulesFolder+files[i],this.hold(function(err){
					if(err) throw err ;
				})) ;
			}
		}

	).done(function(err){
			console.log(folder);
		callback && callback(err,self) ;
	}).bind(this)() ;
}

module.exports.prototype.addInnerPackage = function(folder,callback)
{
	var self = this ;
	var pkg = new Package() ;
	pkg.load(folder,function(err){

		if( !err && !self.inner[ pkg.name ] )
		{
			self.inners[pkg.name] = pkg ;
		}
		callback&&callback(err,pkg) ;
	}) ;

	return this ;
}

