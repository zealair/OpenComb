var mongodb = require('mongodb');
var Cursor = require('mongodb/lib/mongodb/cursor').Cursor ;
var typex = require('../3party/typex') ;
var Steps = require('ocsteps') ;

exports.DB = function(db,collprefix)
{
    this.__proto__ = db ;
    for(var k in exports.DB.prototype)
        this[k] = exports.DB.prototype[k] ;
    this.collprefix = collprefix ;
}

exports.DB.prototype.coll = function(name)
{
    if(!this.__proto__)
        throw new Error("not connected to the db yet.") ;

    return this.collection(this.collectionName(name)) ;
    //return new mongodb.Collection(this.client,this.collectionName(name)) ;
}



exports.DB.prototype.id = function(stringId)
{
    try{
        return new mongodb.ObjectID(stringId.toString()) ;
    } catch(e) {
        return null ;
    }
}

exports.DB.prototype.ref = function(collName,id)
{
    try{
        return new mongodb.DBRef(this.collectionName(collName),id) ;
    } catch(e) {
        return null ;
    }
}

exports.DB.prototype.collectionName = function(name)
{
    if(name.search('/')<0)
    {
        return this.collprefix + name ;
    }
    else
    {
        return name ;
    }
}
exports.DB.prototype.autoIncreaseId = function(collName,docQuery,fieldName,callback)
{
    fieldName || (fieldName='id') ;
    if(!callback)
    {
        callback = function() {}
    }

    var inccoll = this.coll("ocframework/auto_increase_id") ;
    var db = this ;

    collName = this.collectionName(collName) ;

    inccoll.findOne({_id:collName},function(err,doc){

        if(err)
        {
            callback && callback(err) ;
            return ;
        }

        function setField(err){
            if(err)
            {
                callback && callback(err) ;
                return ;
            }
            var data = {} ;
            data[fieldName] = newid ;
            db.coll(collName).update(docQuery,{$set:data},function(err,aff){
                callback && callback(err,newid) ;
            }) ;
        }

        if(doc)
        {
            var newid = ++doc.assigned ;
            inccoll.update({_id:collName},{$set:{assigned:newid}},setField) ;
        }
        else
        {
            var newid = 0 ;
            inccoll.insert({_id:collName,assigned:newid},setField) ;
        }

    }) ;
}
exports.DB.prototype.currentAutoIncreasedId = function(collName,fieldName,callback)
{
    fieldName || (fieldName='id') ;

    var inccoll = this.coll("ocframework/auto_increase_id") ;
    collName = this.collectionName(collName) ;

    inccoll.findOne({_id:collName},function(err,doc){
        callback&&callback(err,doc&&doc.assigned) ;
    }) ;
}


Cursor.prototype.page = typex.overload(

    ['any','any','function'], function(perPage,pageNum,callback)
    {
        return this.page({
            pageNum: pageNum
            , perPage: perPage
            , callback: callback
        }) ;
    }

    , ['any','function'], function(pageNum,callback){
        return this.page({
            callback: callback
            , pageNum: pageNum
        }) ;
    }

    , ['function'], function(callback){
        return this.page({
            callback: callback
        }) ;
    }

    , ['object'], function(opts){

        var pageNum = opts.pageNum || 1 ;
        var perPage = opts.perPage || 10 ;
        var callback = opts.callback ;

        var cursor = this ;

        if(opts.filter)
        {
            var docs = [] ;
            var lasterr ;
            var totalcount = 0 ;
            function eachDoc (err,doc){

                if(err)
                {
                    if(lasterr)
                        (err.prev=lasterr) ;
                    lasterr = err ;
                }

                if(doc)
                {
                    opts.filter(doc,function(doc){
                        if( doc ) {
                            totalcount ++ ;
                            if(docs.length<perPage)
                                docs.push(doc) ;
                        }
                        cursor.nextObject(eachDoc) ;
                    }) ;
                }
                else
                {
                    callback && callback (
                        lasterr
                        , {
                            lastPage: Math.ceil(totalcount/perPage)
                            , currentPage: pageNum
                            , docs: docs
                        }
                    ) ;
                }
            }

            // start
            cursor.nextObject(eachDoc) ;
        }

        else
        {
            this.count(function(err,totalcount){
                if(err)
                {
                    callback && callback(err) ;
                    return ;
                }

                cursor.limit(perPage)
                    .skip((pageNum-1)*perPage)
                    .toArray(function(err,docs){
                        if(err)
                        {
                            callback && callback(err) ;
                            return ;
                        }

                        callback && callback(err,{
                            lastPage: Math.ceil(totalcount/perPage)
                            , currentPage: pageNum
                            , docs: docs
                        }) ;
	            }) ;
	    }) ;

        }
    }

) ;



exports.factory = function(app,package,module)
{
    package._helpers || (package._helpers={}) ;

    if(!package._helpers.db)
    {
        package._helpers.db = new exports.DB(exports._db,package.name+"/") ;
    }

    return package._helpers.db ;
}

exports.onregister = function(app,callback){

    if(!app.config.db || !app.config.db.server)
    {
        throw new Error("缺少数据库配置") ;
    }
    else
    {
        var url = "mongodb://"+app.config.db.server+":"+(app.config.db.port||"27017")+"/"+app.config.db.name ;
        mongodb.MongoClient.connect(url, function(err, db) {
            if(err) throw new Error("无法链接到数据库："+err) ;

            exports._db = db ;

            callback && callback() ;
        }) ;
    }
}
