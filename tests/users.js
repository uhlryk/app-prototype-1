var serverBuilder = require("../app/server.js");
var config = require("../config/local_test.js");
var chai = require("chai");
chai.use(require('chai-things'));
var expect = chai.expect;
var debug = require('debug')('test');
var request = require('superagent');
var url = 'http://localhost:' + config.app.port;
/**
 * testy związane z dodawaniem, wyświetlaniem profilu
 */
describe("Create Users test: ", function(){
	var runningServer;
	before(function(done){
		runningServer = serverBuilder(config, done);
	});
	describe("Not logged user", function(){
		it("should not allow to create coworker", function(done){
			request.post(url + "/users/coworker")
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				expect(res.body.message).to.be.equal("NO_TOKEN");
				done();
			});
		});
		it("should not allow to create investor", function(done){
			request.post(url + "/users/investor")
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				expect(res.body.message).to.be.equal("NO_TOKEN");
				done();
			});
		});
		it("should not allow to create inspector", function(done){
			request.post(url + "/users/inspector")
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				expect(res.body.message).to.be.equal("NO_TOKEN");
				done();
			});
		});
		it("should not allow to create designer", function(done){
			request.post(url + "/users/designer")
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				expect(res.body.message).to.be.equal("NO_TOKEN");
				done();
			});
		});
		it("should not allow to create subcontractor", function(done){
			request.post(url + "/users/subcontractor")
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				expect(res.body.message).to.be.equal("NO_TOKEN");
				done();
			});
		});

	});
	describe("Superadmin is logged ", function(){
		var superUserToken;
		before(function(done){
			request.post(url + "/tokens")
			.send({ login: config.adminAuth.login, password: config.adminAuth.pass, type : "super"})
			.end(function(err, res){
				expect(res.status).to.be.equal(200);
				expect(res.body.token).to.be.a("string");
				superUserToken = res.body.token;
				done();
			});
		});
		it("should not allow to create coworker", function(done){
			request.post(url + "/users/coworker")
			.set('access-token', superUserToken)
			.end(function(err, res){
				expect(res.status).to.be.equal(403);
				expect(res.body.message).to.be.equal("NO_AUTHORIZATION");
				done();
			});
		});
		it("should not allow to create investor", function(done){
			request.post(url + "/users/investor")
			.set('access-token', superUserToken)
			.end(function(err, res){
				expect(res.status).to.be.equal(403);
				expect(res.body.message).to.be.equal("NO_AUTHORIZATION");
				done();
			});
		});
		it("should not allow to create inspector", function(done){
			request.post(url + "/users/inspector")
			.set('access-token', superUserToken)
			.end(function(err, res){
				expect(res.status).to.be.equal(403);
				expect(res.body.message).to.be.equal("NO_AUTHORIZATION");
				done();
			});
		});
		it("should not allow to create designer", function(done){
			request.post(url + "/users/designer")
			.set('access-token', superUserToken)
			.end(function(err, res){
				expect(res.status).to.be.equal(403);
				expect(res.body.message).to.be.equal("NO_AUTHORIZATION");
				done();
			});
		});
		it("should not allow to create subcontractor", function(done){
			request.post(url + "/users/subcontractor")
			.set('access-token', superUserToken)
			.end(function(err, res){
				expect(res.status).to.be.equal(403);
				expect(res.body.message).to.be.equal("NO_AUTHORIZATION");
				done();
			});
		});
	});
	after(function(done){
		runningServer.close();
		debug("Test Server stop");
		done();
	});
});