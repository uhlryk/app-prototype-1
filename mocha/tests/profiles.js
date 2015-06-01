var serverBuilder = require("../../app/server.js");
var config = require("../../config/local_test.js");
var chai = require("chai");
chai.use(require('chai-things'));
var expect = chai.expect;
var debug = require('debug')('test');
var request = require('superagent');
var url = 'http://localhost:' + config.app.port;
/**
 * testy związane z dodawaniem, wyświetlaniem profilu
 */
describe("Profiles test: ", function(){
	var server;
	var helper = require("../helper.js")(server, url);
	before(function(done){
		server = serverBuilder(config, done);
	});
	describe("Not logged user", function(){
		it("should not allow to create profile", function(done){
			request.post(url + "/profiles")
			.send({firmname : "moja firma bslknfk akl as asdkn sadkj lakd akl asknl as"})
			.send({nip : "12345678"})
			.send({street_address : "Polna"})
			.send({house_address : "1A"})
			.send({flat_address : "1"})
			.send({zipcode_address : "11-111"})
			.send({city_address : "Poznań"})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				expect(res.body.message).to.be.equal("NOT_AUTHORIZED");
				done();
			});
		});
	});
	describe("Superadmin is logged ", function(){
		var superUserToken;
		before(function(done){
			helper.loginAdmin(config.adminAuth.login, config.adminAuth.pass, function(token){
				superUserToken = token;
				done();
			});
		});
		it("should not allow to create profile when firmname field is empty", function(done){
			request.post(url + "/profiles")
			.set('access-token', superUserToken)
			.send({nip : "12345678"})
			.send({street_address : "Polna"})
			.send({house_address : "1A"})
			.send({flat_address : "1"})
			.send({zipcode_address : "11-111"})
			.send({city_address : "Poznań"})
			.end(function(err, res){
				expect(res.status).to.be.equal(422);
				expect(res.body.message).to.be.equal("VALIDATION_ERROR");
				expect(res.body.errors).to.include.some.property("type", "REQUIRE_FIELD");
				done();
			});
		});
		it("should allow to create profile", function(done){
			request.post(url + "/profiles")
			.set('access-token', superUserToken)
			.send({firmname : "moja firma bslknfk akl as asdkn sadkj lakd akl asknl as"})
			.send({nip : "12345678"})
			.send({street_address : "Polna"})
			.send({house_address : "1A"})
			.send({flat_address : "1"})
			.send({zipcode_address : "11-111"})
			.send({city_address : "Poznań"})
			.end(function(err, res){
				expect(res.status).to.be.equal(200);
				expect(res.body.id).to.be.above(0);
				done();
			});
		});
		it("should allow to create profile even if only firmname field exist", function(done){
			request.post(url + "/profiles")
			.set('access-token', superUserToken)
			.send({firmname : "moja firma która ma jakąś nazwę jakiej nie pamiętam, ale jest długa"})
			.end(function(err, res){
				expect(res.status).to.be.equal(200);
				expect(res.body.id).to.be.above(0);
				done();
			});
		});
	});
	describe("Other user is logged ", function(){
//TODO: testy dla innego typu usera że próbuje utworzyć profil
	});
	after(function(done){
		server.close();
		done();
	});
});