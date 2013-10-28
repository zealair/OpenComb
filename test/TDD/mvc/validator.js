var should = require("should") ;
var validators ;

suiteSetup(function(done){
    validators = require("../../../lib/mvc/Validator.js") ;
    done() ;
}) ;

suite('mvc', function(){

    suite('#Validator', function(){

	test('## min', function(done){

	    // min --------------------
	    validators.validateRules(
		"hellow word"
		, [{ name: 'min'
		    , value: '4' }]
	    ).should.be.false ;
	    validators.validateRules(
		"he"
		, [{ name: 'min'
		    , value: '4' }]
	    ).should.be.an.Array ;
	    validators.validateRules(
		""
		, [{ name: 'min'
		    , value: '4'}]
	    ).should.be.false ;

	    done() ;
	}) 

	test('## max', function(done){
	    // max --------------------
	    validators.validateRules(
		"hellow word"
		, [{ name: 'max'
		    , value: '20' }]
	    ).should.be.false ;
	    validators.validateRules(
		"hellow word"
		, [{ name: 'max'
		    , value: '4' }]
	    ).should.be.an.Array ;

	    done() ;
	}) 

	test('## email', function(done){
	    // email --------------------
	    validators.validateRules(
		"hellow word"
		, [{ name: 'email'}]
	    ).should.be.an.Array ;
	    validators.validateRules(
		"hellow@word"
		, [{ name: 'email'}]
	    ).should.be.false ;

	    done() ;
	});

	test('## notempty', function(done){
	    validators.validateRules(
		""
		, [{ name: 'notempty'}]
	    ).should.be.an.Array ;
	    validators.validateRules(
		undefined
		, [{ name: 'notempty'}]
	    ).should.be.an.Array ;
	    validators.validateRules(
		null
		, [{ name: 'notempty'}]
	    ).should.be.an.Array ;
	    validators.validateRules(
		0
		, [{ name: 'notempty'}]
	    ).should.be.an.Array ;
	    validators.validateRules(
		"hellow@word"
		, [{ name: 'notempty'}]
	    ).should.be.false ;

	    done() ;
	});


	test('## date', function(done){
	    validators.validateRules(
		"1982-10-11"
		, [{ name: 'date'}]
	    ).should.be.false ;
	    validators.validateRules(
		"82-10-11"
		, [{ name: 'date'}]
	    ).should.be.an.Array ;

	    validators.validateRules(
		"82-10-11"
		, [{ name: 'date', value: 'yy-mm-dd'}]
	    ).should.be.false ;
	    validators.validateRules(
		"82/10/11"
		, [{ name: 'date', value: 'yy/mm/dd'}]
	    ).should.be.false ;
	    validators.validateRules(
		"82/10/1"
		, [{ name: 'date', value: 'yy/m/d'}]
	    ).should.be.false ;
	    validators.validateRules(
		"82/1/1"
		, [{ name: 'date', value: 'yy/m/d'}]
	    ).should.be.false ;

	    done() ;
	});


	test('## regexp', function(done){
	    validators.validateRules(
		"123"
		, [{ name: 'regexp', value: '/^\d{3}$/' }]
	    ).should.be.false ;
	    validators.validateRules(
		"1234"
		, [{ name: 'regexp', value: '/^\d{3}$/' }]
	    ).should.be.an.Array ;

	    done() ;
	});

    });
});
