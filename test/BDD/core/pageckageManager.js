var PackagesManager = require("../../../lib/core/packages/PackagesManager.js");
var should = require("should") ;

describe("core",function(){

    describe("#PackageManager.js",function(){

        it("PackageManager.resolve()",function(done){
            var pkgsmgr = new PackagesManager() ;
            pkgsmgr.root.load(__dirname+"/data/package",function(err,root){

                pkgsmgr.resolve("package/index.js").should.be.eql(__dirname+"/data/package/index.js") ;
                pkgsmgr.resolve("package/index").should.be.eql(__dirname+"/data/package/index.js") ;
                pkgsmgr.resolve("package").should.be.eql(__dirname+"/data/package/index.js") ;
                pkgsmgr.resolve("package/lib/controller.js").should.be.eql(__dirname+"/data/package/lib/controller.js") ;
                pkgsmgr.resolve("package/lib/controller").should.be.eql(__dirname+"/data/package/lib/controller.js") ;
                pkgsmgr.resolve("package/controller.js",undefined,"controller").should.be.eql(__dirname+"/data/package/lib/controller.js") ;
                pkgsmgr.resolve("package/controller",undefined,"controller").should.be.eql(__dirname+"/data/package/lib/controller.js") ;


                pkgsmgr.resolve("bar/index.js").should.be.eql(__dirname+"/data/package/node_modules/bar/index.js") ;
                pkgsmgr.resolve("bar/index").should.be.eql(__dirname+"/data/package/node_modules/bar/index.js") ;
                pkgsmgr.resolve("bar").should.be.eql(__dirname+"/data/package/node_modules/bar/index.js") ;
                pkgsmgr.resolve("bar/lib/controller.js").should.be.eql(__dirname+"/data/package/node_modules/bar/lib/controller.js") ;
                pkgsmgr.resolve("bar/lib/controller").should.be.eql(__dirname+"/data/package/node_modules/bar/lib/controller.js") ;
                pkgsmgr.resolve("bar/controller.js",undefined,"controller").should.be.eql(__dirname+"/data/package/node_modules/bar/lib/controller.js") ;
                pkgsmgr.resolve("bar/controller",undefined,"controller").should.be.eql(__dirname+"/data/package/node_modules/bar/lib/controller.js") ;

                pkgsmgr.resolve("foo/index.js").should.be.eql(__dirname+"/data/package/node_modules/foo/index.js") ;


                pkgsmgr.resolve(
                    "pkg-A/index.js"
                    , __dirname+"/data/package/node_modules/pkg-B"
                ).should.be.eql(__dirname+"/data/package/node_modules/pkg-A/index.js") ;
                pkgsmgr.resolve(
                    "A-pck/index.js"
                    , __dirname+"/data/package/node_modules/pkg-B"
                ).should.be.eql(__dirname+"/data/package/node_modules/pkg-A/index.js") ;

                pkgsmgr.resolve(
                    "pkg-aa/index.js"
                    , __dirname+"/data/package/node_modules/pkg-B"
                ).should.be.eql(__dirname+"/data/package/node_modules/pkg-B/node_modules/pkg-aa/index.js") ;



                done() ;
            }) ;
        }) ;
    }) ;
}) ;