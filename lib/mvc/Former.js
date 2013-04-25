

module.exports = function(){

	this.strct = {} ;

}

module.exports.prototype.doc = function(earth,_strct,_doc)
{
	if(!_doc)
	{
		_doc = { data:{}, _sourceEarth: earth, __proto__: module.exports.DocumentPrototype } ;
	}

	_strct || (_strct=this.strct) ;

	for(var name in _strct)
	{
		if(earth.seed[name]===undefined)
		{
			continue ;
		}

		if(_.isObject(_strct[name]) )
		{
			_doc.data[name]={} ;

			if(_.isObject(earth.seed[name]) )
			{
				this.doc(earth.seed[name],_strct[name],_doc.data[name]) ;
			}
		}
		else
		{
			_doc.data[name] = earth.seed[name] ;
		}
	}

	return _doc ;
}



///////////

module.exports.DocumentPrototype = {

	_sourceEarth: null

	, load: function(condition)
	{
	}

	, save: function(collection,keys,callback,earth)
	{
		var condition = undefined ;
		earth || (earth=this._sourceEarth) ;

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
					if(earth.seed[key]!==undefined)
					{
						condition===undefined && (condition = {}) ;
						condition[key] = earth.seed[key] ;
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

		if(condition===undefined)
		{
			earth.db.collection(collection).insert(this.data,{safe:true},callback) ;
		}
		else
		{
			earth.db.collection(collection).update(condition,{$set:this.data},{safe:true},callback) ;
		}
	}

}

//////////

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





module.exports.createFormersFromTemplate = function(tpl)
{
	var allformers = { __proto__: module.exports.FormersPrototype } ;

	var $ = tpl.$ ;

	$('form').each(function(idx){

		var formname = $(this).attr('name') || '' ;
		var former = new module.exports() ;
		allformers[formname] = former ;

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
				former.strct[fieldname] = null ;

			}
		) ;
	}) ;

	// console.log(allformers) ;

	return allformers ;
}

