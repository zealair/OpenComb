var text = new require("octemplate/lib/shaderfuncs/text.js") ;
var fs = require("fs") ;
var md5 = require("../../util/md5.js") ;
var Steps = require("ocsteps") ;
var path = require("path") ;
var util = require('util');
var Application = require('../../core/Application.js');

module.exports = function(controllerInstance,tpl,formName,options)
{
	this.controllerInstance = controllerInstance ;
	this.formName = formName ;
	this.tpl = tpl ;
	this.options = {} ;
	for(var name in module.exports.defaultOptions)
	{
		this.options[name] =  (!options||options[name]===undefined)? module.exports.defaultOptions[name]: options[name] ;
	}
}


var EmptyFunction = function(){} ;
module.exports.defaultOptions = {
	"msg.insert.success" : "内容已经保存成功"
	, "msg.insert.error" : "系统在保存内容时遇到错误"
	, "msg.update.success" : "内容已经保存成功"
	, "msg.update.error" : "系统在保存内容时遇到错误"
	, "msg.update.fail" : "内容没有保存，可能是因为指定的文档并不存在"
	, "msg.remove.success" : "内容已经删除"
	, "msg.remove.fail" : "没有删除文档，可能是因为指定的文档并不存在。"
	, "msg.remove.error" : "系统删除内容时遇到了错误"
	, "msg.upload.file.success" : "上传文件：%s"
	, "msg.upload.file.error" : "系统在上传文件时遇到错误：%s"
	, "msg.remove.file.success" : "删除文件：%s"
	, "msg.remove.file.error" : "系统在删除文件时遇到错误：%s"

	, "func.file.archive" : function(file,callback){

		var today = new Date() ;
		var subfolder = today.getFullYear() + "/" + (today.getMonth()+1) + "/" + today.getDate() ;
		var folder = Application.singleton.rootdir + "/public/files/" + subfolder ;

		var filename = "~!"+md5( (new Date()).toString()+file.name ) + '!' +  file.name ;
		var subpath = 'public/files/' + subfolder + '/' + filename ;

		helper.fs.mkdirr(folder,0777,function(err){
			if(err)
			{
				callback && callback(err) ;
				return ;
			}
			helper.fs.mv(file.path,folder+"/"+filename,function(err){
				callback && callback(err,subpath) ;
			}) ;
		}) ;
	}
	, "func.file.delete" : function(file,callback){
		fs.unlink(Application.singleton.rootdir+"/"+file,callback) ;
	}
	, "func.file.restorNname" : function(name){
		var res = name.match(/~\!\w{32}!(.+)$/) ;
		return res? res[1]: name ;
	}
}

module.exports.prototype.fillForm = function(doc)
{
	var formModelName = this.formMeta().modelVarName() ;

	// doc 如果来自 controller seed, 则数据在 __proto__链 里
	this.controllerInstance.nut.model[formModelName] = {} ;
	for(var name in doc)
	{
		this.controllerInstance.nut.model[formModelName][name] = doc[name] ;
	}

	return this ;
}

module.exports.prototype.formMeta = function()
{
	return this.tpl.formMetas.formMeta( this.formName ) || {} ;
}
module.exports.prototype.message = function(msg,type,args)
{
	this.options[msg] && this.controllerInstance.nut.message(this.options[msg],args||null,type) ;
}

module.exports.prototype.doc = function(doc,model)
{
	doc || (doc={}) ;
	model || (model=this.controllerInstance.seed) ;
	var formMeta = this.formMeta() ;

	for(var name in formMeta.widgets)
	{
		switch( formMeta.widgets[name].datatype )
		{
			case 'string':

				if(model[name]!==undefined)
				{
					doc[name] = model[name] || '' ;
				}
				break ;

			case 'array':

				if(model[name]===undefined)
				{
					doc[name] = [] ;
				}
				else
				{
					doc[name] = helper._.isArray(model[name])? model[name]: [model[name]] ;
				}
				break ;
		}
	}

	return doc ;
}

module.exports.prototype.conditionDoc = function(keys,model)
{
	var condition = undefined ;
	var formMeta = this.formMeta() ;

	keys || (keys=formMeta.keys) ;
	model || (model=this.controllerInstance.seed) ;

	if(keys)
	{
		if( helper._.isString(keys) )
		{
			keys = [keys] ;
		}

		if( helper._.isArray(keys) )
		{
			for(var i=0;i<keys.length;i++)
			{
				var key = keys[i] ;
				if(model[key]!==undefined && model[key]!=='' && model[key]!=='undefined')
				{
					condition===undefined && (condition = {}) ;
					if(key=='_id')
					{
						if(model[key] && model[key]._bsontype=='ObjectID')
							condition[key] = model[key] ;
						else
							condition[key] = helper.db.id(model[key]) ;
					}
					else
						condition[key] = model[key] ;
				}
			}
		}
		else if( helper._.isObject(keys) )
		{
			condition = keys ;

			// 清理条件
			(function clearCondition(condition)
			{
				for(var name in condition)
				{
					if( condition[name]===undefined )
					{
						delete condition[name] ;
					}

					// 递归
					else if(helper._.isObject(condition[name]))
					{
						clearCondition(condition[name]) ;
					}
				}
			}) (condition) ;

			if( !Object.keys(condition).length )
			{
				condition = undefined ;
			}
		}
	}

	return condition ;
}


module.exports.prototype.load = function(callback)
{
	var former = this ;
	var formMeta = this.formMeta() ;
	this.controllerInstance.step(function(){
		if(!formMeta.collection)
		{
			callback && callback(new Error("表单没有设置 collection 属性")) ;
			return ;
		}

		var condition = former.conditionDoc() ;
		if(condition)
		{
			helper.db.coll(formMeta.collection).findOne(condition,this.hold(function(err,doc){
				if( callback && callback(err,doc)===false )
				{
					// dont fill form
				}
				else
				{
					if(doc)
					{
						former.fillForm(doc) ;
					}
				}
			})) ;
		}
		else
		{
			callback && callback(null,{}) ;
		}
	}) ;

	return this ;
}

module.exports.prototype.save = function(beforeCallback,doneCallback)
{
	var formMeta = this.formMeta() ;
	if(!formMeta.collection)
	{
		doneCallback && doneCallback(new Error("表单没有设置 collection 属性")) ;
		return this ;
	}

	var condition = this.conditionDoc() ;
	var collection = helper.db.coll(formMeta.collection) ;
	var op = condition===undefined? "insert": "update" ;
	var former = this ;
	var doc = null ;

	//var steps = this.steps || Steps()() ;
	var controllerInstance = this.controllerInstance ;
	this.controllerInstance.step(
		function(){
			if(condition)
			{
				collection.findOne(condition,this.hold(function(err,_doc){
					if(err) throw err ;
					if(!_doc)
					{
						former.message("msg.update.fail","error") ;
						this.goto("last") ;
					}
					return doc = former.doc() ;
				})) ;
			}
			else
			{
				return doc = former.doc() ;
			}
		}

		, former.saveFiles.bind(this)

		, function()
		{
			// cancel operation
			if( beforeCallback && beforeCallback(doc,condition===undefined)===false )
			{
				this.goto("last") ;
			}

			// insert
			if(op==="insert")
			{
				collection.insert(doc,{safe:true},this.hold(function(err,docs){
					if(err){
						former.message("msg."+op+".error","error") ;
						throw err ;
					}

					doc = docs && docs[0] ;
					if(formMeta.autoIncreaseId)
					{
						helper.db.autoIncreaseId(
							formMeta.collection
							, former.conditionDoc(formMeta.keys,docs[0])
							, formMeta.autoIncreaseId
							, this.hold(function(err){
								if(err){
									former.message("msg."+op+".error","error") ;
									throw err ;
								}
							})
						) ;
					}
				})) ;
			}

			// update
			else
			{
				delete doc['_id'] ;
				collection.update(condition,{$set:doc},{safe:true},this.hold(function(err,doc){
					if(err){
						former.message("msg."+op+".error","error") ;
						throw err ;
					}
				})) ;
			}
		}

		, function (){
			former.message("msg."+op+".success","success") ;
			if(!controllerInstance.nut.view.tpl)
			{
				controllerInstance.nut.createViewFromTemplate("opencomb/templates/Relocation.html",this.hold()) ;
			}
		}

		, function(err){
			doneCallback && doneCallback(err,doc,op==="insert") ;
		}

		, function last(){}
	) ;

	return this ;
}

module.exports.prototype.saveFiles = function(doc,callback)
{
	doc || (doc={}) ;

	var former = this ;
	var formMeta = this.formMeta() ;

	this.controllerInstance.step(
        function()
        {
	        var seed = this.seed ;

            // 处理 files
            this.each(formMeta.widgets,function(name,widget){

                if( widget.datatype=='file' && this.seed[name] && this.seed[name].name )
                {
	                former.options["func.file.archive"] (this.seed[name],this.hold(function(err,path){
		                if(err)
		                {
			                former.message("msg.upload.file.error","error",[this.seed[name].name]) ;
			                helper.log.error(err) ;
		                }
		                else
		                {
			                doc[name] = path ;
			                former.message("msg.upload.file.success","success",[this.seed[name].name]) ;
		                }
	                })) ;
                }
            }) ;
        }

	    , function(){
		     callback && callback() ;
	    }
    ) ;

	return this ;
}

module.exports.prototype.remove = function(callback)
{
	var formMeta = this.formMeta() ;
	if(!formMeta.collection)
	{
		callback(new Error("表单没有设置 collection 属性")) ;
		return ;
	}

	var condition = this.conditionDoc() ;
	if(!condition)
	{
		this.controllerInstance.nut.message("没有指定删除的内容。","error") ;
		callback && callback(null,0) ;
		return this ;
	}

	var collection = helper.db.coll(formMeta.collection) ;
	var former = this ;
	var formMeta = this.formMeta() ;
	var deldoc ;

	this.controllerInstance.step(
		function(){
			collection.findOne(condition,this.hold()) ;
		}
		, function(err,doc){
			deldoc = doc ;
			if(err)
			{
				callback && callback(err) ;
				return ;
			}

			if(!doc)
			{
				former.message("msg.remove.fail","error") ;
				return ;
			}

			// delete files
			this.each(formMeta.widgets,function(name,widget){
				if( widget.datatype=='file' && doc[name] )
				{
					var oriName = former.options["func.file.restorNname"] (doc[name]) ;

					former.options["func.file.delete"] ( doc[name], this.hold(function(err){
						if(err)
						{
							helper.log.error(err) ;
							former.message("msg.remove.file.error",'error',[oriName]) ;
						}
						else
						{
							former.message("msg.remove.file.success",'success',[oriName]) ;
						}
					}) ) ;
				}
			}) ;
		}
		, function(){
			// delete doc
			collection.remove(condition,this.hold()) ;
		}

		, function(err,affe){

			callback && callback(err,deldoc) ;

			if(err)
			{
				console.log('db collection delete operation error:',err.toString()) ;
				former.message("msg.remove.error","error") ;
			}
			else
			{
				if( !affe )
				{
					former.message("msg.remove.fail","error") ;
				}
				else
				{
					former.message("msg.remove.success","success") ;
				}

				if(!this.nut.view.tpl)
				{
					this.nut.createViewFromTemplate("ocframework/templates/Relocation.html",this.hold()) ;
				}
			}
		}
	) ;

	return this ;
}

