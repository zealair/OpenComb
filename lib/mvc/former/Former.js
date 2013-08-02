var text = new require("octemplate/lib/shaderfuncs/text.js") ;
var fs = require("fs") ;
var md5 = require("../../util/md5.js") ;
var Steps = require("ocsteps") ;
var path = require("path") ;
var util = require('util');
var Application = require('../../core/Application.js');
var typex = require('../../3party/typex') ;

module.exports = function(controllerInstance,tpl,formName,collection,keys,autoIncreaseId)
{
    this.controllerInstance = controllerInstance ;
    this.formName = formName ;
    this.tpl = tpl ;

    if(collection)
	this.collection = collection ;
    if(keys)
	    this.keys = keys ;
    if(autoIncreaseId)
        this.autoIncreaseId = autoIncreaseId ;

    if(this.tpl)
        this.__proto__.__proto__ = this.tpl.formMetas.formMeta( this.formName ) ;
}

module.exports.defaultOperationOpts = {

	save: {
		"msg.insert.success" : "内容已经保存成功"
		, "msg.insert.error" : "系统在保存内容时遇到错误"
		, "msg.insert.duplicate" : "保存的内容已经存在"
		, "msg.update.success" : "内容已经保存成功"
		, "msg.update.error" : "系统在保存内容时遇到错误"
		, "msg.update.fail" : "内容没有保存，可能是因为指定的文档并不存在"
		, "msg.update.duplicate" : "保存的内容已经存在"
	}

	, saveFile: {

		"msg.upload.file.success" : "上传文件：%s"
		, "msg.upload.file.error" : "系统在上传文件时遇到错误：%s"

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
	}

	, remove: {
		"msg.remove.success" : "内容已经删除"
		, "msg.remove.fail" : "没有删除文档，可能是因为指定的文档并不存在。"
		, "msg.remove.error" : "系统删除内容时遇到了错误"
		, "msg.remove.abort" : "没有指定删除的内容"

		, "msg.remove.file.success" : "删除文件：%s"
		, "msg.remove.file.error" : "系统在删除文件时遇到错误：%s"

		, "func.file.delete" : function(file,callback){
			fs.unlink(Application.singleton.rootdir+"/"+file,callback) ;
		}
		, "func.file.restorName" : function(name){
			var res = name.match(/~\!\w{32}!(.+)$/) ;
			return res? res[1]: name ;
		}
	}
}


module.exports.prototype.validate = function(){
	return true ;
}

module.exports.prototype.fillForm = function(doc)
{
	var formModelName = this.modelVarName() ;

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
	msg && this.controllerInstance.nut.message(msg,args||null,type) ;
}
module.exports.prototype.doc = function(doc,model)
{
	doc || (doc={}) ;
	model || (model=this.controllerInstance.seed) ;

	for(var name in this.widgets)
	{
		switch( this.widgets[name].datatype )
		{
			case 'string':

				if(model[name]!==undefined)
					doc[name] = model[name] || '' ;
				break ;

			case 'array':

				if(model[name]===undefined)
					doc[name] = [] ;
				else
					doc[name] = helper._.isArray(model[name])? model[name]: [model[name]] ;
		    break ;
		}
	}

	return doc ;
}

module.exports.prototype.condition = function(keys,model)
{
	var condition = undefined ;

	keys || (keys=this.keys) ;
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

					//
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


module.exports.prototype.load = typex.overload(

	/**
	 * function(condition,done)
	 */
    ["any","any"], function(condition,callback) {

		var former = this ;
		if(!former.collection)
		{
			callback && callback(new Error("表单没有设置 collection 属性")) ;
			return ;
		}

	        if(!condition)
	            condition = this.condition() ;

		if(condition) {
			helper.db.coll(former.collection).findOne(condition,function(err,doc){
				if( callback && callback(err,doc)!==false && doc )
			            former.fillForm(doc) ;
			}) ;
		}
		else
			callback && callback(null,{}) ;

		return this ;
    }

    , ["object"], function(condition){
        return this.load(condition,null) ;
    }

    , ["function"], function(done){
        return this.load(null,done) ;
    }

    , [], function(){
        return this.load(null,null) ;
    }
) ;

module.exports.prototype.save = typex.overload(

	/**
	 * function(opts) ;
	 * opts : {
	 *  doc: {}
	 *  , condition: {}
	 *  , keys: {}
	 *  , before: function(doc)
	 *  , done: function(err,doc)
	 *	, "msg.insert.success" : "内容已经保存成功"
	 *	, "msg.insert.error" : "系统在保存内容时遇到错误"
	 *	, "msg.insert.duplicate" : "保存的内容已经存在"
	 *	, "msg.update.success" : "内容已经保存成功"
	 *	, "msg.update.error" : "系统在保存内容时遇到错误"
	 *	, "msg.update.fail" : "内容没有保存，可能是因为指定的文档并不存在"
	 *	, "msg.update.duplicate" : "保存的内容已经存在"
	 *
	 *  // for saveFile()
	 *	, "msg.upload.file.success" : "上传文件：%s"
	 *	, "msg.upload.file.error" : "系统在上传文件时遇到错误：%s"
	 *	, "func.file.archive" : function(file,callback)
	 * }
	 */
	['object'], function(opts){

		if(!this.collection)
		{
			opts.done && opts.done(new Error("表单没有设置 collection 属性")) ;
			return this ;
		}

		var condition = opts.condition || this.condition( opts.keys ) ;
		var doc = opts.doc || this.doc() ;
		var collection = helper.db.coll(this.collection) ;
		var op = condition===undefined? "insert": "update" ;
		var former = this ;

		if(opts)
			opts.__proto__ = module.exports.defaultOperationOpts.save ;
		else
			opts = module.exports.defaultOperationOpts.save ;

		var controllerInstance = this.controllerInstance ;
		Steps(

			function(){
				former.saveFiles(doc,this.hold(),{__proto__:opts}) ;
			}

			, function()
			{
				// cancel operation
				if( opts.before && opts.before.call(former.controllerInstance,doc,condition===undefined)===false )
					this.terminate() ;

				// insert
				if(op==="insert")
				{
					collection.insert(doc,{safe:true},this.hold(function(err,docs){
						if(err){
							if(err.code==11000)
								former.message(opts["msg.insert.duplicate"],"error") ;
							else
								former.message(opts["msg.insert.error"],"error") ;
							throw err ;
						}

						doc = docs && docs[0] ;
						if(former.autoIncreaseId)
						{
							helper.db.autoIncreaseId(
								former.collection
								, former.condition(former.keys,docs[0])
								, former.autoIncreaseId
								, this.hold(function(err){
									if(err){
										former.message(opts["msg.insert.error","error"]) ;
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
					collection.update(condition,{$set:doc},{safe:true},this.hold(function(err,affected){
						if(err){
							if(err.code==11000)
								former.message(opts["msg.update.duplicate"],"error") ;
							else
								former.message(opts["msg.update.error"],"error") ;
							throw err ;
						}
					})) ;
				}
			}

			, function (){
				former.message(opts["msg."+op+".success"],"success") ;
				if(!controllerInstance.nut.view.tpl)
				{
					controllerInstance.nut.createViewFromTemplate("opencomb/templates/Relocation.html",this.hold()) ;
				}
			}

		).done(function(err){
			if(err)
				helper.log("former").error(err) ;
			opts.done && opts.done.call(former.controllerInstance,err,doc) ;
		}) () ;

		return this ;
	}

	/**
	 * function(
	 */
	, [], function(opts){
		return this.save({}) ;
	}

	/**
	 * function(done)
	 */
	, ['function'], function(done){ return this.save({done:done}) ; }
	/**
	 * function(done,opts)
	 */
	, ['function','object'], function(done,opts){
		opts['done'] = done ;
		return this.save(opts) ;
	}

	/**
	 * function(before,done)
	 */
	, ['function','function'], function(before,done){ return this.save({before:before,done:done}) ; }
	/**
	 * function(before,done,opts)
	 */
	, ['function','function','object'], function(before,done,opts){
		opts['before'] = before ;
		opts['done'] = done ;
		return this.save(opts) ;
	}

) ;


module.exports.prototype.saveFiles = typex.overload(

	/**
	 * function(opts) ;
	 * opts : {
	 *
	 *  doc: {}
	 *  ,done: function(err,doc) ;
	 *
	 *  // for saveFile()
	 *	, "msg.upload.file.success" : "上传文件：%s"
	 *	, "msg.upload.file.error" : "系统在上传文件时遇到错误：%s"
	 *	, "func.file.archive" : function(file,callback)
	 * }
	 */
	["object"], function(opts) {

		var doc = opts.doc || {} ;
		var former = this

		// 处理 files
		Steps().each(former.widgets,function(name,widget){

			if( widget.datatype=='file' && this.seed[name] && this.seed[name].name )
			{
				opts["func.file.archive"] (this.seed[name],this.hold(function(err,path){
					if(err)
					{
						former.message(opts["msg.upload.file.error"],"error",[this.seed[name].name]) ;
						helper.log("former").error(err) ;
						throw err ;
					}
					else
					{
						doc[name] = path ;
						former.message(opts["msg.upload.file.success"],"success",[this.seed[name].name]) ;
					}
				})) ;
			}
		})

		.done(function(err){
			opts.done && opts.done.call(former.controllerInstance,err,doc) ;
		}) () ;

		return this ;
	}


	/**
	 * function(doc)
	 */
	, ['object'], function(doc){ return this.saveFiles({doc:doc}) ; }
	/**
	 * function(doc,opts)
	 */
	, ['object','object'], function(doc,opts){
		opts['doc'] = doc ;
		return this.saveFiles(opts) ;
	}

	/**
	 * function(done)
	 */
	, ['function'], function(done){ return this.saveFiles({done:done}) ; }
	/**
	 * function(done,opts)
	 */
	, ['function','object'], function(done,opts){
		opts['done'] = done ;
		return this.saveFiles(opts) ;
	}
	/**
	 * function(doc,done,opts)
	 */
	, ['object','function','object'], function(doc,done,opts){
		opts['done'] = done ;
		opts['doc'] = doc ;
		return this.saveFiles(opts) ;
	}
) ;


/**
 * opts: {
 *
 *  condition: object
 *  , done: function
 *  , "msg.remove.success": string
 *  , "msg.remove.fail": string
 *  , "msg.remove.error": string
 *  , "msg.remove.abort": string
 *	, "msg.remove.file.success": string
 *	, "msg.remove.file.error": string
 *  , "func.file.delete": function
 *  , "func.file.restorName": function
 * }
 */
module.exports.prototype.remove = typex.overload(

	/**
	 * function(opts,condition,done)
	 */
	["any","any","any"], function(condition,done,opts)
	{
		if(opts)
			opts.__proto__ = module.exports.defaultOperationOpts.remove ;
		else
			opts = module.exports.defaultOperationOpts.remove ;

		done = done || opts.done ;

		if(!this.collection) {
			done && done(new Error("表单没有设置 collection 属性")) ;
			return ;
		}

		var condition = condition || opts.condition || this.condition() ;
		if(!condition)
		{
			this.message(opts["msg.remove.abort"],"error") ;
			done && done(null,0) ;
			return this ;
		}

		var collection = helper.db.coll(this.collection) ;
		var former = this ;
		var deldoc ;

		Steps(
			function(){
				collection.findOne(condition,this.holdButThrowError()) ;
			}
			, function(err,doc){
				deldoc = doc ;
				if(!doc)
				{
					former.message(opts["msg.remove.fail"],"error") ;
					this.terminate() ;
				}

				// delete files
				this.each(former.widgets,function(name,widget){
					if( widget.datatype=='file' && doc[name] )
					{
						var oriName = opts["func.file.restorName"] (doc[name]) ;

						opts["func.file.delete"] ( doc[name], this.hold(function(err) {
							if(err) {
								helper.log.error(err) ;
								former.message(opts["msg.remove.file.error"],'error',[oriName]) ;
							}
							else
								former.message(opts["msg.remove.file.success"],'success',[oriName]) ;
						}) ) ;
					}
				}) ;
			}
			, function(){
				// delete doc
				collection.remove(condition,this.holdButThrowError()) ;
			}

			, function(err,affe){

				if( !affe )
					former.message(opts["msg.remove.fail"],"error") ;
				else
					former.message(opts["msg.remove.success"],"success") ;

				// 默认视图
				if(!this.nut.view.tpl)
					this.nut.createViewFromTemplate("ocframework/templates/Relocation.html",this.hold()) ;
			}
		).done(function(err){

			if(err)
				helper.log("former").error(err) ;

			done && done(err,deldoc) ;

		}) () ;

		return this ;
	}

	/**
	 * function(done,opts)
	 */
	, ["function","object"], function(done,opts){
		return this.remove(null,done,opts) ;
	}

	/**
	 * function(done)
	 */
	, ["function"], function(done){
		return this.remove(null,done,null) ;
	}

	/**
	 * function(opts)
	 */
	, ["object"], function(opts){
		return this.remove(null,null,opts) ;
	}

	/**
	 * function()
	 */
	, [], function(){
		return this.remove(null,null,null) ;
	}
) ;
