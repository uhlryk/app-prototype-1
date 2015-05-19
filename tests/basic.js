var serverBuilder = require("../app/server.js");
var config = require("../config/local_test.js");
var chai = require("chai");
chai.use(require('chai-things'));
var expect = chai.expect;
var debug = require('debug')('test');
var request = require('superagent');
var url = 'http://localhost:' + config.app.port;
/**
 * podstawowe testy, czy serwer działa i logowanie
 */
describe("Basic test: ", function(){
	var runningServer;
	before(function(done){
		runningServer = serverBuilder(config, done);
	});
	it("should return status code 200 at empty get", function(done){
		request.get(url + "/")
		.end(function(err, res){
			expect(res.status).to.be.equal(200);
			done();
		});
	});
	describe("Any User", function(){
		describe("check token validation method", function(){
			it("should return invalid if not existed token", function(done){
				request.get(url + "/tokens/9999999999999999")
				.end(function(err, res){
					expect(res.status).to.be.equal(200);
					expect(res.body.status).to.be.equal("INVALID");
					done();
				});
			});
			it("should return valid status if token is valid", function(done){
				request.post(url + "/tokens")
				.send({ login: config.adminAuth.login, password: config.adminAuth.pass, type : "super"})
				.end(function(err, res){
					request.get(url + "/tokens/" + res.body.token)
					.end(function(err, res){
						expect(res.status).to.be.equal(200);
						expect("VALID").to.be.equal(res.body.status);
						done();
					});
				});
			});
			it("should return invalid status if token is disabled/invalid ", function(done){
				var firstToken;
				request.post(url + "/tokens")
				.send({ login: config.adminAuth.login, password: config.adminAuth.pass, type : "super"})
				.end(function(err, res){
					firstToken = res.body.token;
					request.post(url + "/tokens")
					.send({ login: config.adminAuth.login, password: config.adminAuth.pass, type : "super"})
					.end(function(err, res){
						request.get(url + "/tokens/" + firstToken)
						.end(function(err, res){
							expect(res.status).to.be.equal(200);
							expect(res.body.status).to.be.equal("INVALID");
							done();
						});
					});
				});
			});
		});
		describe("authorization", function(){
			it("should block if existing token is disabled/invalid", function(done){
				var firstToken;
				request.post(url + "/tokens")
				.send({ login: config.adminAuth.login, password: config.adminAuth.pass, type : "super"})
				.end(function(err, res){
					firstToken = res.body.token;
					request.post(url + "/tokens")
					.send({ login: config.adminAuth.login, password: config.adminAuth.pass, type : "super"})
					.end(function(err, res){
						request.get(url + "/")
						.set('access-token',firstToken)
						.end(function(err, res){
							expect(res.status).to.be.equal(401);
							expect(res.body.message).to.be.equal("TOKEN_INVALID");
							done();
						});
					});
				});
			});
			it("should allow if existing token is valid", function(done){
				request.post(url + "/tokens")
				.send({ login: config.adminAuth.login, password: config.adminAuth.pass, type : "super"})
				.end(function(err, res){
					request.get(url + "/")
					.set('access-token',res.body.token)
					.end(function(err, res){
						expect(res.status).to.be.equal(200);
						done();
					});
				});
			});
		});
	});
	describe("Superadmin", function(){
		it("should not login because wrong password", function(done){
			request.post(url + "/tokens")
			.send({ login: 'Manny', password: 'cafsddst', type : "super"})
			.end(function(err, res){
				expect(res.status).to.be.equal(422);
				expect(res.body.message).to.be.equal("INCORRECT_LOGIN_PASSWORD");
				done();
			});
		});
		it("should login", function(done){
			request.post(url + "/tokens")
			.send({ login: config.adminAuth.login, password: config.adminAuth.pass, type : "super"})
			.end(function(err, res){
				expect(res.status).to.be.equal(200);
				debug(res.type);
				expect(res.body.token).to.be.a("string");
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