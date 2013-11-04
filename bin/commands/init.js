var inquirer = require("inquirer") ;
var urllib = require('urllib') ;
var fs = require('fs') ;
var childprocess = require('child_process') ;

module.exports = function() {

    console.log(require('../banner.js')) ;
    console.log("Initializing an OpenComb Application in this dir\n") ;

    this.step(
	actCollectionVersionInfo
	, actDoQuestions
	, actProcess
    ) ;

}



function actCollectionVersionInfo(){

    waiting(this,"Collecting versions information from npmjs.org and github.com") ;

    // npm versions
    urllib.request(
	"https://registry.npmjs.org/opencomb"
	, {
	    dataType: 'json'
	    , timeout: 30000
	}
	, this.holdButThrowError('-','npminfo')
    ) ;

    // github tags
    urllib.request(
	"https://api.github.com/repos/OpenComb/OpenComb/tags"
	, {
	    dataType: 'json'
	    , timeout: 30000
	}
	, this.holdButThrowError('-','githubtags')
    ) ;

    // github branches
    urllib.request(
	"https://api.github.com/repos/OpenComb/OpenComb/branches"
	, {
	    dataType: 'json'
	    , timeout: 30000
	}
	, this.holdButThrowError('-','githubbranches')
    ) ;

    this.step(function(){

	done(this) ;
	
	var verlist = [] ;

	// npm versions
	for(var vername in this.recv.npminfo.versions)
	    verlist.unshift('  '+vername) ;
	verlist.unshift(new inquirer.Separator( 
	    "[From npmjs.org:]".blue
		+ " (stable)".green
	))

	// github tags and branches
	for(var refname in {tags:1,branches:1}) {
	    var argname = 'github'+refname ;

	    verlist.push(new inquirer.Separator((
		'[From Github.com/'+refname+":]").blue
						+ "(meybe stable)".yellow
					       ))

	    for(var i=0;i<this.recv[argname].length;i++)
		verlist.push('  clone '+this.recv[argname][i].name) ;
	}
	

	return verlist ;
    }) ;
}


function actDoQuestions(versions) {
    versions.push(
	new inquirer.Separator("[Other:]".blue+"(unstale!)".grey)
	, "  <enter a git commit id ...>"
    ) ;

    console.log('') ;

    inquirer.prompt(
	[
	    // step 1
	    {
		name: "ocversion",
		type: "list",
		message: "Select OpenComb Version",
		paginated: true,
		choices: versions,
		filter: function(value){
		    value = value.trim() ;
		    var res ;
		    if( value=="<enter a git commit id ...>" )
			return { type: 'github/commit' } ;
		    else if( res=/clone (.+)$/.exec(value) )
			return { type: 'github/refs', version: res[1] } ;
		    else
			return { type: 'npm', version: value } ;
		}
	    }

	    // step 1.5
	    , {
		type: "input",
		name: "ocversion",
		message: "Commit id of git repository on github.com",
		validate: function(value) {
		    return value.trim().match(/^[0-9a-f]{40}$/i)? true: "Please enter a valid repository(Git) commit id" ;
		} ,
		when: function(answers) {
		    return answers.ocversion.type=='github/commit';
		} ,
		filter: function(value) {
		    return { type: "github/commit", version: value.trim().toLowerCase() } ;
		}
	    }
	    
	    // step 2
	    , {
		message: "Listen tcp port for web server"
		, type: "input"
		, name: "httpport"
		, "default": "6060"
		, filter: Number
		, validate: function(pass){
		    var port = parseInt(pass.trim()) ;
		    if( isNaN(port) || port<0 || port>65535 )
			return "Please enter a valid TCP port number (0-65535)" ;
		    else
			return true ;
		}
	    }

	    // step 3
	    , {
		message: "Database(MongoDB) name"
		, type: "input"
		, name: "dbname"
		, "default": "opencomb-app"
	    }

	    // step 4
	    , {
		message: "Database(MongoDB) server"
		, type: "input"
		, name: "dbserver"
		, "default": "localhost"
	    }

	    // step 5
	    , {
		message: "Database(MongoDB) username"
		, type: "input"
		, name: "dbusername"
	    }

	    // step 6
	    , {
		message: "Database(MongoDB) password"
		, type: "password"
		, name: "dbpassword"
	    }

	    // step 7
	    , {
		message: "Install extensions as repositor(Git) work dir"
		, type: "confirm"
		, name: "as-repo-workdir"
		, "default": this.options["as-repo-workdir"]
	    }

	]
	, this.hold('answers',function(answers){
	    // fetch package.json from remote repository, and prompt deps to check
	    if( answers["as-repo-workdir"] )
		this.step([answers],actSelectedRepoWorkdir) ;
	})
    ) ;
}



function actSelectedRepoWorkdir(answers){

    var deps ;

    // from npm
    if(answers.ocversion.type=='npm'){
	var packagejson = this.recv.npminfo.versions[answers.ocversion.version] ;
	deps = packagejson.dependencies ;
    }

    // from github, fetch again
    else {
	var url ;
	if(answers.ocversion.type=='github/commit'){
	    url = "https://raw.github.com/OpenComb/OpenComb/"+answers.ocversion.version+"/package.json" ;
	}
	else{
	    // concat tags and branches
	    var vers = this.recv.githubtags.concat(this.recv.githubbranches) ;
	    // find out commit id
	    for(var i=0;i<vers.length;i++){
		if( vers[i].name == answers.ocversion.version ){
		    url = "https://raw.github.com/OpenComb/OpenComb/"+vers[i].commit.sha+"/package.json" ;
		    break ;
		}
	    }
	    if(!url)
		throw new Error("invalid version of opencomb, can not found git commit: "+answers.ocversion.version) ;
	}

	console.log('') ;
	waiting(this,"Fetching dependencies of this verion opencomb from github.com") ;

	urllib.request(
	    url
	    , {
		dataType:"json"
		, timeout: 30000
	    }
	    , this.holdButThrowError(function(err,json,res){

		done(this) ;

		console.log('') ;

		deps = json.dependencies ;
	    })
	) ;
	
    }

    //
    this.step(function(){

	var depslist = [{
	    name: "  opencomb @"+answers.ocversion.version
	    , value: "opencomb"
	}] ;
	for(pkgname in deps){
	    depslist.push({
		name: '  '+pkgname+" @"+deps[pkgname]
		, value: pkgname
	    }) ;
	}
	
	inquirer.prompt(
	    [{
		message: "Which extensions shuld be installed as repositor(Git) work dir"
		, type: "checkbox"
		, name: "repowds"
		, choices: depslist
	    }]
	    , this.hold
	    (function(depsAnswers){
		answers.asrepos = depsAnswers ;
	    })
	) ;
    }) ;
}

function actProcess() {
    console.log("actProcess",this.recv.answers) ;

    // install packages by npm
    childprocess.spawn('rnpm') ;

    // mkdir data folders
    this.each(
	['bin','public','public/data','log']
	, function(i,name){
	    process.stdout.write('mkdir '+name+' ... ') ;
	    fs.mkdir(cli.options.dir+'/'+name,this.hold(function(err){
		if( err ) {
		    if( err.code=='EEXIST' )
			console.log('aleady exists'.yellow) ;
		    else
			throw err ;
		}
		else
		    console.log( 'done.'.green ) ;
	    })) ;
	}
    ) ;

    // create config.json 
    var configjson = {}
}

var _waitingmsg ;
function waiting(cli,msg){
    _waitingmsg = msg ;
    cli.spinner( msg +  ","+" pls wait a moment ...".magenta ) ;
}
function done(cli){
    cli.spinner( _waitingmsg + ","+" done.                   \n".green, true ) ;
}
