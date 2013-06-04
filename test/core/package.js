var Package = require("../../lib/core/packages/Package.js");
var should = require("should") ;

describe("core",function(){

	describe("#Package.js",function(){

		it("load package tree",function(done){

			(new Package()).load(__dirname+"/data/package",function(err,pkg){

				if(err)
				{
					console.log(err) ;
				}

				pkg.name.should.be.eql("package") ;
				pkg.inners['A-pck'].name.should.be.eql("A-pck") ;       // 由 package.json 确定名称
				pkg.inners['pkg-A'].name.should.be.eql("A-pck") ;
				pkg.inners['pkg-B'].name.should.be.eql("pkg-B") ;
				pkg.inners['pkg-C'].name.should.be.eql("pkg-C") ;

				pkg.inners['A-pck'].folderName.should.be.eql("pkg-A") ;
				pkg.inners['pkg-A'].folderName.should.be.eql("pkg-A") ;
				pkg.inners['pkg-B'].folderName.should.be.eql("pkg-B") ;
				pkg.inners['pkg-C'].folderName.should.be.eql("pkg-C") ;

				// 递归
				pkg.inners['pkg-B'].inners['pkg-aa'].name.should.be.eql("pkg-aa") ;
				pkg.inners['pkg-B'].inners['pkg-bb'].name.should.be.eql("pkg-bb") ;
				pkg.inners['pkg-B'].inners['pkg-cc'].name.should.be.eql("pkg-cc") ;


				// 同名pacakge中,folder name 的优先级高于 package.json中的name
				pkg.inners['foo'].name.should.be.eql("foo") ;
				pkg.inners['foo'].folderName.should.be.eql("foo") ;
				pkg.inners['bar'].name.should.be.eql("foo") ;
				pkg.inners['bar'].folderName.should.be.eql("bar") ;

				done() ;

			}) ;
		}) ;


		it("locate package",function(done){

			(new Package()).load(__dirname+"/data/package",function(err,root){

				if(err)
				{
					console.log(err) ;
				}

				( root.locate(__dirname+"/data/package/node_modules/pkg-B/node_modules/pkg-bb/lib/folderA/filename.js")
					==root.inners['pkg-B'].inners['pkg-bb']
				).should.be.true ;

				( root.locate(__dirname+"/data/package/node_modules/pkg-B/node_modules/pkg-bb/PackagesManager.js")
					==root.inners['pkg-B'].inners['pkg-bb']
				).should.be.true ;

				( root.locate(__dirname+"/data/package/node_modules/pkg-B/node_modules/notexists/PackagesManager.js")
					===null
					).should.be.true ;

				( root.locate(__dirname+"/data/package/node_modules/pkg-B/PackagesManager.js")
					===root.inners['pkg-B']
					).should.be.true ;

				( root.locate(__dirname+"/data/package/node_modules/pkg-B/")
					===root.inners['pkg-B']
					).should.be.true ;

				( root.locate(__dirname+"/data/package/node_modules/pkg-B")
					===root.inners['pkg-B']
					).should.be.true ;

				( root.locate(__dirname+"/data/package")
					===root
					).should.be.true ;

				//
				var pkgB = root.inners['pkg-B'] ;
				( pkgB.locate(__dirname+"/data/package")
					===root).should.be.true ;
				( pkgB.locate(__dirname+"/data/package/")
					===root ).should.be.true ;

				( pkgB.locate(__dirname+"/data/package/node_modules/pkg-A")
					===root.inners['A-pck']).should.be.true ;

				( pkgB.locate(__dirname+"/data/package/node_modules/pkg-B")
					===pkgB).should.be.true ;

				( pkgB.locate(__dirname+"/data/package/node_modules/pkg-C")
					===root.inners['pkg-C']).should.be.true ;

				( pkgB.locate(__dirname+"/data/package/node_modules/pkg-B/node_modules/pkg-aa")
					===pkgB.inners['pkg-aa']).should.be.true ;
				( pkgB.locate(__dirname+"/data/package/node_modules/pkg-B/node_modules/pkg-bb")
					===pkgB.inners['pkg-bb']).should.be.true ;
				( pkgB.locate(__dirname+"/data/package/node_modules/pkg-B/node_modules/pkg-cc")
					===pkgB.inners['pkg-cc']).should.be.true ;
				( pkgB.locate(__dirname+"/data/package/node_modules/pkg-B/node_modules/pkg-bb/lib/folderA/filename.js")
					===pkgB.inners['pkg-bb']).should.be.true ;
				( pkgB.locate(__dirname+"/data/package/node_modules/pkg-B/node_modules/pkg-bb/lib/folderA")
					===pkgB.inners['pkg-bb']).should.be.true ;
				( pkgB.locate(__dirname+"/data/package/node_modules/pkg-B/node_modules/pkg-bb/lib")
					===pkgB.inners['pkg-bb']).should.be.true ;
				( pkgB.locate(__dirname+"/data/package/node_modules/pkg-B/node_modules/pkg-bb/PackagesManager.js")
					===pkgB.inners['pkg-bb']).should.be.true ;
				( pkgB.locate(__dirname+"/data/package/node_modules/pkg-B/node_modules/pkg-bb/index")
					===pkgB.inners['pkg-bb']).should.be.true ;
				( pkgB.locate(__dirname+"/data/package/node_modules/pkg-B/node_modules/pkg-bb/index-notexists")
					===pkgB.inners['pkg-bb']).should.be.true ;
				( pkgB.locate(__dirname+"/data/package/node_modules/pkg-B/node_modules/pkg-bb/")
					===pkgB.inners['pkg-bb']).should.be.true ;

				var pkg_aa = pkgB.inners['pkg-aa'] ;
				( pkg_aa.locate(__dirname+"/data/package/node_modules/pkg-B/node_modules/pkg-bb/")
					===pkgB.inners['pkg-bb']).should.be.true ;
				( pkg_aa.locate(__dirname+"/data/package/")
					===root).should.be.true ;


				// 依赖扩展
				( pkg_aa.locate("pkg-bb")
					===pkgB.inners['pkg-bb']).should.be.true ;
				( pkg_aa.locate("pkg-bb/lib")
					===pkgB.inners['pkg-bb']).should.be.true ;
				( pkg_aa.locate("pkg-bb/")
					===pkgB.inners['pkg-bb']).should.be.true ;
				( pkg_aa.locate("pkg-bb/index-notexists")
					===pkgB.inners['pkg-bb']).should.be.true ;
				( pkg_aa.locate("pkg-bb/lib/folersA/filename.js")
					===pkgB.inners['pkg-bb']).should.be.true ;


				( pkg_aa.locate("pkg-A/")
					===root.inners['pkg-A']).should.be.true ;
				( pkg_aa.locate("A-pck/")
					===root.inners['pkg-A']).should.be.true ;
				( pkg_aa.locate("pkg-B/node_modules/pkg-bb/lib")
					===pkgB.inners['pkg-bb']).should.be.true ;


				done() ;
			}) ;


		}) ;
	}) ;

}) ;