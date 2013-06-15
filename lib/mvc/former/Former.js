var text = new require("octemplate/lib/shaderfuncs/text.js") ;
var shaderNode = new require("octemplate/lib/shaderfuncs/node.js") ;
var fs = require("fs") ;
var md5 = require("../../util/md5.js") ;
var Steps = require("ocsteps") ;
var path = require("path") ;
var util = require('util');

module.exports = function(name,collectionName,keys){
	this.widgets = {}
	this.name = name || '' ;
	this.collection = collectionName ;
	this.keys = keys ;
}

module.exports.prototype.fillForm = function(model,doc)
{
	var formModelName = this.modelVarName() ;

	// doc 如果来自 controller seed, 则数据在 __proto__链 里
	model[formModelName] = {} ;
	for(var name in doc)
	{
		model[formModelName][name] = doc[name] ;
	}

	return this ;
}

module.exports.prototype.modelVarName = function()
{
	return 'formModel$'+this.name ;
}

module.exports.prototype.doc = function(model,doc)
{
	doc || (doc={}) ;

	for(var name in this.widgets)
	{
		switch( this.widgets[name].datatype )
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

module.exports.prototype.docCondition = function(model,keys)
{
	var condition = undefined ;

	keys || (keys=this.keys) ;

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
				if(model[key]!==undefined && model[key]!=='')
				{
					condition===undefined && (condition = {}) ;
					condition[key] = (key=='_id')? helper.db.id(model[key]): model[key] ;
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

module.exports.prototype.list = function(earth)
{

}


module.exports.prototype.save = function(model,beforeCallback,doneCallback)
{
	if(!this.collection)
	{
		doneCallback && doneCallback(new Error("表单没有设置 collection 属性")) ;
		return this ;
	}

	var condition = this.docCondition(model) ;
	var collection = helper.db.coll(this.collection) ;
	var former = this ;
	var doc = {} ;

	//var steps = this.steps || Steps()() ;

	Steps(
		function(){
			if(condition)
			{
				collection.findOne(condition,this.hold(function(err,_doc){
					if(err) throw err ;
					doc = former.doc(model,doc) ;
				})) ;
			}
			else
			{
				doc = former.doc(model) ;
			}
		}

		, function()
		{
			former.saveFiles(model,doc,this.holdButThrowError()) ;
		}

		, function()
		{
			// cancel operation
			if( beforeCallback && beforeCallback(doc,condition===undefined)===false )
			{
				this.terminate() ;
				return ;
			}

			// insert
			if(condition===undefined)
			{
				collection.insert(doc,{safe:true},this.holdButThrowError()) ;
			}

			// update
			else
			{
				delete doc['_id'] ;
				collection.update(condition,{$set:doc},{safe:true},this.holdButThrowError()) ;
			}
		}
		, function(err,doc){
			doneCallback && doneCallback(err,doc) ;
		}

	).uncatch(doneCallback) () ;

	return this ;
}

module.exports.prototype.saveFiles = function(seed,doc,callback)
{
	doc || (doc={}) ;

	var today = new Date() ;
	var subfolder = today.getFullYear() + "/" + (today.getMonth()+1) + "/" + today.getDate() ;
	var folder = process.cwd() + "/public/files/" + subfolder ;

	var former = this ;

    Steps(
        function()
        {
            helper.fs.mkdirr(folder,0777,this.hold()) ;
        }

        , function(err)
        {
            if(err) throw new Error(err) ;

            // 处理 files
            this.each(former.widgets,function(name,widget){

                if( widget.datatype=='file' && seed[name] && seed[name].name )
                {
                    var filename = md5( (new Date()).toString()+name ) + '-' +  seed[name].name ;
                    doc[name] = 'public/files/' + subfolder + '/' + filename ;

                    helper.fs.mv(seed[name].path,folder+"/"+filename,this.holdButThrowError()) ;
                }
            }) ;
        }
    ).done(callback) () ;

	return this ;
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

			if(!earth.nut.view.tpl)
			{
				earth.nut.createViewFromTemplate("opencomb/templates/Relocation.html",function(){
					earth.release() ;
				}) ;

			}
			else
			{
				earth.release() ;
			}
		}
	}

	if(!this.collection)
	{
		doneCb(new Error("表单没有设置 collection 属性")) ;
		return ;
	}
	
	var condition = this.docCondition(earth.seed) ;
	if(!condition)
	{
		doneCb(new Error("missing arg: _id")) ;
		return this ;
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

	return this ;
}

