var text = new require("octemplate/lib/shaderfuncs/text.js") ;
var shaderNode = new require("octemplate/lib/shaderfuncs/node.js") ;
var fs = require("fs") ;
var md5 = require("ocplatform/lib/util/md5.js") ;
var Step = require("step") ;
var path = require("path") ;
var db = require("ocplatform/lib/DB") ;
var util = require('util');

module.exports = function(name,collectionName,keys){
	this.struct = {} ;
	this.name = name || '' ;
	this.collection = collectionName ;
	this.keys = keys ;
}

module.exports.prototype.fill = function(earth,doc)
{
	var formModelName = 'formModel$'+this.name ;
	earth.nut.model[formModelName] = doc ;
}


module.exports.prototype.doc = function(seed,doc)
{
	doc || (doc={}) ;

	for(var name in this.struct)
	{
		switch( this.struct[name] )
		{
			case 'string':

				if(seed[name]!==undefined)
				{
					doc[name] = seed[name] || '' ;
				}
				break ;

			case 'array':

				if(seed[name]===undefined)
				{
					doc[name] = [] ;
				}
				else
				{
					doc[name] = _.isArray(seed[name])? seed[name]: [seed[name]] ;
				}
				break ;
		}
	}

	return doc ;
}

module.exports.prototype.docCondition = function(seed,keys)
{
	var condition = undefined ;

	keys || (keys=this.keys) ;

	if(keys)
	{
		if( _.isString(keys) )
		{
			keys = [keys] ;
		}

		if( _.isArray(keys) )
		{
			for(var i=0;i<keys.length;i++)
			{
				var key = keys[i] ;
				if(seed[key]!==undefined && seed[key]!=='')
				{
					condition===undefined && (condition = {}) ;
					condition[key] = (key=='_id')? db.prototype.objectId(seed[key]): seed[key] ;
				}
			}
		}
		else if( _.isObject(keys) )
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
					else if(_.isObject(condition[name]))
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

module.exports.prototype.list = function(earth)
{

}

module.exports.prototype.load = function(earth,callback)
{
	var condition = this.docCondition(earth.seed) ;
	var former = this ;

	earth.hold() ;

	if(condition)
	{
		earth.db.collection(this.collection).findOne(condition,function(err,doc){

			if( callback && callback(err,doc)===false )
			{
				// dont fill form
			}
			else
			{
				if(doc)
				{
					former.fill(earth,doc) ;
				}
			}

			earth.release() ;
		}) ;
	}
	else
	{
		callback && callback(null,{}) ;

		earth.release() ;
	}
}


module.exports.prototype.save = function(earth,beforeCb,callback)
{
	if(!callback)
	{
		earth.hold() ;

		callback = function(err,doc){
			if(err)
			{
				console.log('db collection insert/update error:',err.toString()) ;
			}
			if( !doc )
			{
				earth.nut.message("系统在保存时遇到了错误。",null,"error") ;
			}
			else
			{
				earth.nut.message("内容已经保存成功。",null,"success") ;
			}

			earth.release() ;
		}
	}

	var condition = this.docCondition(earth.seed) ;
	var collection = earth.db.collection(this.collection) ;
	var doc = {} ;
	var former = this ;

	function loadDoc(){
		if(condition)
		{
			collection.findOne(condition,function(err,_doc){
				if(err)
				{
					callback(err) ;
					return ;
				}

				doc = former.doc(earth.seed,_doc) ;
				saveFiles() ;
			}) ;
		}
		else
		{
			doc = former.doc(earth.seed) ;
			saveFiles() ;
		}
	}

	function saveFiles()
	{
		former.saveFiles(earth.seed,doc,saveDoc) ;
	}

	function saveDoc(err,doc)
	{
		if(err)
		{
			callback(err) ;
			return ;
		}

		// cancel operation
		if( beforeCb && beforeCb(doc,condition===undefined)===false )
		{
			return ;
		}

		if(condition===undefined)
		{
			collection.insert(doc,{safe:true},callback) ;
		}
		else
		{// console.log(doc) ;
			delete doc['_id'] ;
			collection.update(condition,{$set:doc},{safe:true},callback) ;
		}
	}

	loadDoc() ;
}

module.exports.prototype.saveFiles = function(seed,doc,callback)
{
	function mkdirr(folder,mode,callback)
	{
		fs.exists(folder,function(exists){

			if(exists)
			{
				callback && callback(null) ;
			}
			else
			{
				mkdirr(path.dirname(folder),mode,function(err){
					if(!err)
					{
						fs.mkdir(folder,mode,callback) ;
					}
					else
					{
						callback && callback(err) ;
					}
				})
			}

		}) ;
	}

	doc || (doc={}) ;

	var today = new Date() ;
	var subfolder = today.getFullYear() + "/" + (today.getMonth()+1) + "/" + today.getDate() ;
	var folder = process.cwd() + "/public/files/" + subfolder ;

	var former = this ;

	Step(
		function()
		{
			mkdirr(folder,0777,this) ;
		}

		, function(err)
		{
			if(err)
			{
				this(err) ;
				return ;
			}

			var group =  this.group() ;

			// 处理 files
			for(var name in former.struct)
			{
				if( former.struct[name]=='file' && seed[name] && seed[name].name )
				{
					var filename = md5( (new Date()).toString()+name ) + '-' +  seed[name].name ;
					doc[name] = 'public/files/' + subfolder + '/' + filename ;

					var source = seed[name].path ;
					var destination = folder+"/"+filename ;

					(function(next){
						fs.rename( source, destination, function(err){
							// 不同分区中的文件不能使用 rename
							if( err && err.code=='EXDEV' )
							{
								util.pump(
									fs.createReadStream(source)
									, fs.createWriteStream(destination)
									, function(err) {
										fs.unlink(source) ;
										next(err) ;
									}
								);
							}
							else
							{
								next(err) ;
							}
						}) ;
					}) ( group() )





				}
			}
		}

		, function done(err)
		{
			callback && callback(err,doc) ;
		}
	) ;
}

module.exports.prototype.remove = function(earth,beforeCb,doneCb)
{
	if(!doneCb)
	{
		earth.hold() ;

		doneCb = function(err,doc){
			if(err)
			{
				console.log('db collection delete operation error:',err.toString()) ;
			}
			if( !doc )
			{
				earth.nut.message("系统在删除文档时遇到了错误。",null,"error") ;
			}
			else
			{
				earth.nut.message("文档已经删除。",null,"success") ;
			}

			earth.release() ;
		}
	}

	var condition = this.docCondition(earth.seed) ;
	if(!condition)
	{
		doneCb(new Error("missing arg: _id")) ;
		return ;
	}

	var collection = earth.db.collection(this.collection) ;
	var doc = null ;
	var former = this ;

	collection.findOne(condition,function(err,_doc)
	{
		if(err)
		{
			doneCb(err) ;
			return ;
		}

		doc = _doc ;

		// before event
		if( beforeCb && beforeCb(doc)===false )
		{
			return ;
		}

		// delete files
		var folder = process.cwd() + "/" ;
		for(var name in former.struct)
		{
			if( former.struct[name]=='file' && doc[name] )
			{
				fs.unlink(folder+doc[name]) ;
			}
		}

		// delete doc
		collection.remove(condition,doneCb) ;
	}) ;
}


////////////////////////////////////////////////////
// formers 

module.exports.FormersPrototype = {

	_first: null

	, former: function(name)
	{
		if(name===undefined)
		{
			return this._first ;
		}
		else
		{
			return this[name] ;
		}
	}
}


// formers ///
function fillInputValue(node,buff,next,generator,tpl)
{
	if(node.modelname && node.attributes.name)
	{
		if( node.attributes.value )
		{
			var oriValueExp = text.joinAsString(node.attributes.value,true) ;
		}
		else
		{
			var oriValueExp = '""' ;
		}

		var nameExp = text.joinAsString(node.attributes.name,true) ;
		var propertyExp = node.modelname + "[("+nameExp+")]" ;

		var value = "@ (" + node.modelname +'&&'+ propertyExp + "!==undefined)? ("+propertyExp+".toString().replace(/\\\\/,'\\\\\\\\').replace(/\\\"/,'\\\\\"')): ("+oriValueExp+")" ;
		tpl.$(node).removeAttr('value').attr('value',value) ;
	}

	next() ;
}
function fillTextarea(node,buff,next,generator,tpl)
{
	if(node.modelname )
	{
		shaderNode.tagShader(node,buff) ;

		var nameExp = text.joinAsString(node.attributes.name,true) ;
		var propertyExp = node.modelname + "[("+nameExp+")]" ;

		buff.write( "if("+node.modelname +'&&'+ propertyExp +"!==undefined){") ;// + "&&"+ ) ;
		buff.indent(1) ;
		buff.write("buff.write( "+propertyExp+".toString().replace(/\\\\/,'\\\\\\\\').replace(/\\\"/,'\\\\\"') ) ;") ;
		buff.indent(-1) ;
		buff.write("}else{") ;
		buff.indent(1) ;

		generator.makeChildrenSync(node,buff,tpl) ;

		buff.indent(-1) ;
		buff.write("}") ;

		shaderNode.tailTagShader(node,buff) ;
	}

	else
	{
		next() ;
	}

}
function fillCheckedSelected(node,buff,next,generator,tpl)
{
	if(node.modelname && node.attributes.value)
	{
		var hitAttrName = node.tagName=='OPTION'? 'selected': 'checked' ;

		if( node.attributes[hitAttrName] )
		{
			console.log(node.attributes[hitAttrName].nodeValue) ;
			var oriExp = text.joinAsString(node.attributes[hitAttrName],true) ;
			if(!oriExp)
			{
				oriExp = '""' ;
			}
		}
		else
		{
			var oriExp = '""' ;
		}

		var nameExp = node.attributes.name?
			text.joinAsString(node.attributes.name,true):
			'"'+node.selectname+'"' ;
		var propertyExp = node.modelname + "[("+nameExp+")]" ;

		var valueExp = text.joinAsString(node.attributes.value,true) ;

		var hitAttrValueExp = "@ (" + node.modelname +'&&('+ propertyExp + "!==undefined)&&("
					+ "( _.isArray("+propertyExp+") && _.indexOf("+propertyExp+","+valueExp+")>=0 )"
					+ "||( _.isString("+propertyExp+") && "+propertyExp+"=="+valueExp+")"
					+ "))? '"+hitAttrName+"': ("+oriExp+")" ;

		// 创建属性（无法在DOM上为 checked, selected 复任意制）
		tpl.$(node).attr(hitAttrName,hitAttrName) ;
		// 为属性赋值
		node.attributes[hitAttrName].value = hitAttrValueExp ;
	}
	
	next() ;
}

module.exports.createFormersFromTemplate = function(tpl)
{
	var allformers = { __proto__: module.exports.FormersPrototype } ;

	var $ = tpl.$ ;

	$('form[collection]').each(function(idx){

		var formname = $(this).attr('name') || '' ;
		var collection = $(this).attr('collection') ;
		var keys = ($(this).attr('keys')||"_id").split(',') ;

		var former = new module.exports(formname,collection,keys) ;
		allformers[formname] = former ;

		var formModelName = '$model.formModel$'+formname ;

		// first
		if(idx==0)
		{
			allformers._first = former ;
		}

		$(this)
			.find("input[name]")
			.add("textarea[name]")
			.add("select[name]")
			.each(function(){

				var fieldname = $(this).attr('name') ;
				if(!fieldname)
				{
					return ;
				}
				former.struct[fieldname] = 'string' ;

				// 安装 shader
				switch(this.tagName)
				{
					case 'INPUT':

						this.modelname = formModelName ;

						switch( $(this).attr('type').toString() )
						{
							case 'checkbox':
								former.struct[fieldname] = 'array' ;

							case 'radio':
								tpl.applyShader(this,fillCheckedSelected) ;
								break ;

							case 'file':

								delete former.struct[fieldname] ;
								former.struct[fieldname] = 'file' ;
								break ;

							case 'text':
							case 'hidden':
							default:
								tpl.applyShader(this,fillInputValue) ;
								break ;
						}

						break;

					case 'TEXTAREA':
						
						this.modelname = formModelName ;

						tpl.applyShader(this,fillTextarea) ;

						break;

					case 'SELECT':

						if( $(this).attr('multiple') )
						{
							former.struct[fieldname] = 'array' ;	
						}

						// shader 安装在<option>上
						$(this).find("option").each(function(){

							this.modelname = formModelName ;
							this.selectname = fieldname ;
							
							//(this._shaders||(this._shaders=[])).push(fillCheckedSelected) ;
							tpl.applyShader(this,fillCheckedSelected) ;

						})
						break;
				}
			}
		) ;
	}) ;

	//console.log(allformers) ;

	return allformers ;
}



