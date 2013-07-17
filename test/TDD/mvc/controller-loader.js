var should = require("should") ;
var PackagesManager = require("../../../lib/core/packages/PackagesManager.js");
var loader = require("../../../lib/mvc/ControllerLoader.js") ;


suiteSetup(function(done){
	var pkgsmgr = new PackagesManager() ;
	pkgsmgr.root.load(__dirname+"/../../..",function(err,root){
		done() ;
	}) ;
	loader.ControllerPath.setPackages(pkgsmgr) ;
})

suite('mvc', function(){
	suite('#ControllerLoader', function(){

		test('##ControllerPath', function(done){

			(new loader.ControllerPath("./data/ControllerA",__dirname)).fullpath.should.eql(__dirname+"/data/ControllerA.js") ;
			(new loader.ControllerPath(__dirname+"/data/ControllerA")).fullpath.should.eql(__dirname+"/data/ControllerA.js") ;
			(new loader.ControllerPath("ocframework/test/TDD/mvc/data/ControllerA")).fullpath.should.eql(__dirname+"/data/ControllerA.js") ;

			(new loader.ControllerPath("./data/ControllerA:bbb",__dirname)).fullpath.should.eql(__dirname+"/data/ControllerA.js") ;
			(new loader.ControllerPath(__dirname+"/data/ControllerA:bbb")).fullpath.should.eql(__dirname+"/data/ControllerA.js") ;
			(new loader.ControllerPath("ocframework/test/TDD/mvc/data/ControllerA:bbb")).fullpath.should.eql(__dirname+"/data/ControllerA.js") ;

			(new loader.ControllerPath("./data/ControllerA:bbb",__dirname)).xpath.should.eql(["bbb"]) ;
			(new loader.ControllerPath(__dirname+"/data/ControllerA:bbb")).xpath.should.eql(["bbb"]) ;
			(new loader.ControllerPath("ocframework/test/TDD/mvc/data/ControllerA:bbb")).xpath.should.eql(["bbb"]) ;

			(new loader.ControllerPath("./data/ControllerA",__dirname)).loadDefine().fullpath.should.be.eql(__dirname+"/data/ControllerA.js") ;
			(new loader.ControllerPath("./data/ControllerA:bbb",__dirname)).loadDefine().fullpath.should.be.eql(__dirname+"/data/ControllerB.js") ;
			(new loader.ControllerPath("./data/ControllerA:ccc",__dirname)).loadDefine().fullpath.should.be.eql(__dirname+"/data/ControllerA.js") ;

			done() ;
		});


	});
});
