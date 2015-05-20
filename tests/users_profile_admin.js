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
describe("Create profile admin test: ", function(){
	var runningServer;
	before(function(done){
		runningServer = serverBuilder(config, done);
	});
	describe("Not logged user", function(){
		it("should not allow to create profile_admin", function(done){
			request.post(url + "/users/profile_admin")
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
		it("should not allow to create profile_admin if no profile_id field", function(done){
			request.post(url + "/users/profile_admin")
			.set('access-token', superUserToken)
			.end(function(err, res){
				expect(res.status).to.be.equal(422);
				expect(res.body.message).to.be.equal("VALIDATION_ERROR");
				expect(res.body.errors).to.include.some.property("type", "REQUIRE_FIELD");
				done();
			});
		});
		it("should not allow to create profile_admin if profile_id field is empty", function(done){
			request.post(url + "/users/profile_admin")
			.set('access-token', superUserToken)
			.send({profile_id : ""})
			.end(function(err, res){
				expect(res.status).to.be.equal(422);
				expect(res.body.message).to.be.equal("VALIDATION_ERROR");
				expect(res.body.errors).to.include.some.property("type", "REQUIRE_FIELD");
				done();
			});
		});
		it("should not allow to create profile_admin if profile_id field is wrong", function(done){
			request.post(url + "/users/profile_admin")
			.set('access-token', superUserToken)
			.send({profile_id : 999})
			.end(function(err, res){
				expect(res.status).to.be.equal(422);
				expect(res.body.message).to.be.equal("VALIDATION_ERROR");
				expect(res.body.errors).to.include.some.property("type", "WRONG_VALUE");
				done();
			});
		});
		describe("Profile is exisitng ", function(){
			var profileId;
			before(function(done){
				request.post(url + "/profiles")
				.set('access-token', superUserToken)
				.send({firmname : "moja firma która ma jakąś nazwę jakiej nie pamiętam, ale jest długa"})
				.end(function(err, res){
					profileId = res.body.id;
					done();
				});
			});
			it("should allow to create profile_admin when all data send", function(done){
				request.post(url + "/users/profile_admin")
				.set('access-token', superUserToken)
				.send({profile_id : profileId})
				.send({firstname : "Adam"})
				.send({lastname : "Kowalski"})
				.send({email : "kowalski@kowalski.email"})
				.send({phone : "+48701633386"})
				.end(function(err, res){
					expect(res.status).to.be.equal(200);
					expect(res.body.id).to.be.above(0);
					expect(res.body.password).to.be.a("string");
					expect(res.body.login).to.be.a("string");
					done();
				});
			});
			it("should not allow to create profile_admin when not send phone", function(done){
				request.post(url + "/users/profile_admin")
				.set('access-token', superUserToken)
				.send({profile_id : profileId})
				.send({firstname : "Adam"})
				.send({lastname : "Kowalski"})
				.send({email : "kowalski@kowalski.email"})
				.end(function(err, res){
					expect(res.status).to.be.equal(422);
					expect(res.body.message).to.be.equal("VALIDATION_ERROR");
					expect(res.body.errors).to.include.some.property("type", "REQUIRE_FIELD");
					done();
				});
			});
			it("should not allow to create profile_admin when wrong phone number send", function(done){
				request.post(url + "/users/profile_admin")
				.set('access-token', superUserToken)
				.send({profile_id : profileId})
				.send({firstname : "Adam"})
				.send({lastname : "Kowalski"})
				.send({email : "kowalski@kowalski.email"})
				.send({phone : "+487016386"})
				.end(function(err, res){
					expect(res.status).to.be.equal(422);
					expect(res.body.message).to.be.equal("VALIDATION_ERROR");
					expect(res.body.errors).to.include.some.property("type", "REQUIRE_FIELD");
					done();
				});
			});
			it("should not allow to create profile_admin when wrong email send", function(done){
				request.post(url + "/users/profile_admin")
				.set('access-token', superUserToken)
				.send({profile_id : profileId})
				.send({firstname : "Adam"})
				.send({lastname : "Kowalski"})
				.send({email : "kowalskikowalski.email"})
				.send({phone : "+48701611386"})
				.end(function(err, res){
					expect(res.status).to.be.equal(422);
					expect(res.body.message).to.be.equal("VALIDATION_ERROR");
					expect(res.body.errors).to.include.some.property("type", "FIELD_VALIDATION_FAILED");
					done();
				});
			});
			it("should allow to create profile_admin when no email send", function(done){
				request.post(url + "/users/profile_admin")
				.set('access-token', superUserToken)
				.send({profile_id : profileId})
				.send({firstname : "Adam"})
				.send({lastname : "Kowalski"})
				.send({phone : "+48701611386"})
				.end(function(err, res){
					expect(res.status).to.be.equal(200);
					expect(res.body.id).to.be.above(0);
					expect(res.body.password).to.be.a("string");
					expect(res.body.login).to.be.a("string");
					done();
				});
			});
			it("should not allow to create profile_admin when user with this phone exisit and is profile_admin", function(done){
				request.post(url + "/users/profile_admin")
				.set('access-token', superUserToken)
				.send({profile_id : profileId})
				.send({firstname : "Adam"})
				.send({lastname : "Kowalski"})
				.send({email : "kowalski@kowalski.email"})
				.send({phone : "+48791611386"})
				.end(function(err, res){
					request.post(url + "/users/profile_admin")
					.set('access-token', superUserToken)
					.send({profile_id : profileId})
					.send({firstname : "Adam"})
					.send({lastname : "Kowalski"})
					.send({email : "kowalski@kowalski.email"})
					.send({phone : "+48791611386"})
					.end(function(err, res){
						expect(res.status).to.be.equal(422);
						expect(res.body.message).to.be.equal("PROCESS_ERROR");
						expect(res.body.type).to.be.equal("DUPLICATE_USER");
						done();
					});
				});
			});
			//TODO: test gdy profil jest nieaktywny to nie można dodać użytkownika. Najpierw funkcja blokowania profilu
			//TODO: test dodania dla usera nie będącego adminem funkcji admina
			//TOGO: test nie dodania dla nieadmina opcji admina jeśli jest zablokowany
		});
	});
	describe("ProfileAdmin exists ", function(){
		var superUserToken, profileId, profileAdminId, password, login;
		before(function(done){
			request.post(url + "/tokens")
			.send({ login: config.adminAuth.login, password: config.adminAuth.pass, type : "super"})
			.end(function(err, res){
				superUserToken = res.body.token;
				request.post(url + "/profiles")
				.set('access-token', superUserToken)
				.send({firmname : "moja firma która ma jakąś nazwę jakiej nie pamiętam, ale jest długa"})
				.end(function(err, res){
					profileId = res.body.id;
					it("should allow to create profile_admin when all data send", function(done){
						request.post(url + "/users/profile_admin")
						.set('access-token', superUserToken)
						.send({profile_id : profileId})
						.send({firstname : "Adam"})
						.send({lastname : "Kowalski"})
						.send({email : "kowalski@kowalski.email"})
						.send({phone : "+48701633386"})
						.end(function(err, res){
							profileAdminId = res.body.id;
							password = res.body.password;
							login = res.body.login;
							done();
						});
					});
				});
			});
		});
		it("should not allow login when credentials are correct but super flag is set", function(done){
			request.post(url + "/tokens")
			.send({ login: login, password: password, type : "super"})
			.end(function(err, res){
				expect(res.status).to.be.equal(422);
				expect(res.body.message).to.be.equal("INCORRECT_LOGIN_PASSWORD");
				done();
			});
		});
		it("should not allow when existing login is invalid", function(done){
			request.post(url + "/tokens")
			.send({ login: "fsfssaffas", password: password})
			.end(function(err, res){
				expect(res.status).to.be.equal(422);
				expect(res.body.message).to.be.equal("INCORRECT_LOGIN_PASSWORD");
				done();
			});
		});
		it("should not allow when existing password is invalid", function(done){
			request.post(url + "/tokens")
			.send({ login: login, password: "fsffassfwe"})
			.end(function(err, res){
				expect(res.status).to.be.equal(422);
				expect(res.body.message).to.be.equal("INCORRECT_LOGIN_PASSWORD");
				done();
			});
		});
		it("should login when credentials are ok", function(done){
			request.post(url + "/tokens")
			.send({ login: login, password: password})
			.end(function(err, res){
				expect(res.status).to.be.equal(200);
				expect(res.body.token).to.be.a("string");
				done();
			});
		});
		describe("ProfileAdmin is logged ", function(){
			var profileAdminToken;
			before(function(done){
				request.post(url + "/tokens")
				.send({ login: login, password: password})
				.end(function(err, res){
					expect(res.status).to.be.equal(200);
					expect(res.body.token).to.be.a("string");
					profileAdminToken = res.body.token;
					done();
				});
			});

		});
	});
	after(function(done){
		runningServer.close();
		debug("Test Server stop");
		done();
	});
});