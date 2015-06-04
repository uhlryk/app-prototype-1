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
describe("Create profile admin test: ", function(){
	var server;
	var helper = require("../helper.js")(server, url);
	before(function(done){
		server = serverBuilder(config, done);
	});
	describe("Not logged user", function(){
		it("should not allow to create profile_admin", function(done){
			request.post(url + "/users/profile_admin")
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
			.send({firmname : "firma1"})
			.send({phone : "+48791633380"})
			.send({firmname : "FirmaA"})
			.end(function(err, res){
				expect(res.status).to.be.equal(422);
				expect(res.body.message).to.be.equal("PROCESS_ERROR");
				expect(res.body.type).to.be.equal("FOREIGN_KEY_CONSTRAINT");
				done();
			});
		});
		describe("Profile is exisitng ", function(){
			var profileId;
			before(function(done){
				helper.createProfile(superUserToken, "Moja firma 111", function(id){
					profileId = id;
					done();
				});
			});
			it("should allow to create profile_admin when all data send", function(done){
				request.post(url + "/users/profile_admin")
				.set('access-token', superUserToken)
				.send({profile_id : profileId})
				.send({firstname : "Adam"})
				.send({firmname : "firma1"})
				.send({lastname : "Kowalski"})
				.send({email : "kowalski@kowalski.email"})
				.send({phone : "+48701633386"})
				.send({firmname : "FirmaA"})
				.end(function(err, res){
					expect(res.status).to.be.equal(200);
					expect(res.body.login).to.be.a("string");
					var smsData = server.getSmsDebug(res.body.login);
					expect(smsData.password).to.be.a("string");
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
				.send({firmname : "FirmaA"})
				.end(function(err, res){
					expect(res.status).to.be.equal(422);
					expect(res.body.message).to.be.equal("VALIDATION_ERROR");
					expect(res.body.errors).to.include.some.property("type", "REQUIRE_FIELD");
					done();
				});
			});
			it("should not allow to create profile_admin when not send firmname", function(done){
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
			it("should not allow to create profile_admin when wrong phone number send", function(done){
				request.post(url + "/users/profile_admin")
				.set('access-token', superUserToken)
				.send({profile_id : profileId})
				.send({firstname : "Adam"})
				.send({lastname : "Kowalski"})
				.send({email : "kowalski@kowalski.email"})
				.send({phone : "+487016386"})
				.send({firmname : "FirmaA"})
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
				.send({firmname : "FirmaA"})
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
				.send({firmname : "firma1"})
				.send({firstname : "Adam"})
				.send({lastname : "Kowalski"})
				.send({phone : "+48701611386"})
				.send({firmname : "FirmaA"})
				.end(function(err, res){
					expect(res.status).to.be.equal(200);
					expect(res.body.login).to.be.a("string");
					var smsData = server.getSmsDebug(res.body.login);
					expect(smsData.password).to.be.a("string");
					done();
				});
			});
			it("should allow to create profile_admin when only phone & firmname", function(done){
				request.post(url + "/users/profile_admin")
				.set('access-token', superUserToken)
				.send({profile_id : profileId})
				.send({firmname : "firma1"})
				.send({phone : "+48701011386"})
				.send({firmname : "FirmaA"})
				.end(function(err, res){
					expect(res.status).to.be.equal(200);
					expect(res.body.login).to.be.a("string");
					var smsData = server.getSmsDebug(res.body.login);
					expect(smsData.password).to.be.a("string");
					done();
				});
			});
			it("should not allow to create profile_admin when user with this phone exisit and is profile_admin", function(done){
				request.post(url + "/users/profile_admin")
				.set('access-token', superUserToken)
				.send({profile_id : profileId})
				.send({firstname : "Adam"})
				.send({lastname : "Kowalski"})
				.send({firmname : "firma1"})
				.send({email : "kowalski@kowalski.email"})
				.send({phone : "+48791611386"})
				.send({firmname : "FirmaA"})
				.end(function(err, res){
					request.post(url + "/users/profile_admin")
					.set('access-token', superUserToken)
					.send({profile_id : profileId})
					.send({firstname : "Adam"})
					.send({lastname : "Kowalski"})
					.send({firmname : "firma1"})
					.send({email : "kowalski@kowalski.email"})
					.send({phone : "+48791611386"})
					.send({firmname : "FirmaA"})
					.end(function(err, res){
						expect(res.status).to.be.equal(422);
						expect(res.body.message).to.be.equal("PROCESS_ERROR");
						expect(res.body.type).to.be.equal("ROLE_ERROR");
						done();
					});
				});
			});
			//TODO: test gdy profil jest nieaktywny to nie można dodać użytkownika. Najpierw funkcja blokowania profilu
			//TODO: test dodania dla usera nie będącego adminem funkcji admina
			//TODO: test nie dodania dla nieadmina opcji admina jeśli jest zablokowany
		});
	});
	describe("ProfileAdmin exists ", function(){
		var superUserToken, profileId, profileAdminPassword, profileAdminLogin;
		before(function(done){
			helper.loginAdmin(config.adminAuth.login, config.adminAuth.pass, function(token){
				superUserToken = token;
				helper.createProfile(superUserToken, "Moja firma 112", function(id){
					profileId = id;
					helper.createProfileAdmin(superUserToken, profileId, "+48801633386", function(id, login){
						profileAdminLogin = login;
						var smsData = server.getSmsDebug(login);
						profileAdminPassword = smsData.password;
						done();
					});
				});
			});
		});
		it("should not allow login when credentials are correct but super flag is set", function(done){
			request.post(url + "/tokens")
			.send({ login: profileAdminLogin, password: profileAdminPassword, type : "super"})
			.end(function(err, res){
				expect(res.status).to.be.equal(422);
				expect(res.body.message).to.be.equal("INCORRECT_LOGIN_PASSWORD");
				done();
			});
		});
		it("should not allow login when login is invalid", function(done){
			request.post(url + "/tokens")
			.send({ login: "fsfssaffas", password: profileAdminPassword})
			.end(function(err, res){
				expect(res.status).to.be.equal(422);
				expect(res.body.message).to.be.equal("INCORRECT_LOGIN_PASSWORD");
				done();
			});
		});
		it("should not allow login when password is invalid", function(done){
			request.post(url + "/tokens")
			.send({ login: profileAdminLogin, password: "fsddffassfwe"})
			.end(function(err, res){
				expect(res.status).to.be.equal(422);
				expect(res.body.message).to.be.equal("INCORRECT_LOGIN_PASSWORD");
				done();
			});
		});
		it("should login when credentials are ok", function(done){
			request.post(url + "/tokens")
			.send({ login: profileAdminLogin, password: profileAdminPassword})
			.end(function(err, res){
				expect(res.status).to.be.equal(200);
				expect(res.body.token).to.be.a("string");
				done();
			});
		});
		describe("ProfileAdmin is logged and second profile exist", function(){
			var profileAdminToken, secondProfileId;
			before(function(done){
				helper.loginUser(profileAdminLogin, profileAdminPassword, function(token){
					profileAdminToken = token;
					helper.createProfile(superUserToken, "Moja firma 113", function(id){
						secondProfileId = id;
						done();
					});
				});
			});
			it("ProfileAdmin should not allow to add new profile admin, to other profile", function(done){
				request.post(url + "/users/profile_admin")
				.set('access-token', profileAdminToken)
				.send({profile_id : secondProfileId})
				.send({phone : "+48701011316"})
				.send({firmname : "firmaA"})
				.end(function(err, res){
					expect(res.status).to.be.equal(401);
					expect(res.body.message).to.be.equal("NOT_AUTHORIZED");
					done();
				});
			});
			it("should allow to add new profile admin, to same profile", function(done){
				request.post(url + "/users/profile_admin")
				.set('access-token', profileAdminToken)
				.send({profile_id : profileId})
				.send({phone : "+48701011326"})
				.send({firmname : "firmaA"})
				.end(function(err, res){
					expect(res.status).to.be.equal(200);
					expect(res.body.login).to.be.a("string");
					var smsData = server.getSmsDebug(res.body.login);
					expect(smsData.password).to.be.a("string");
					done();
				});
			});
		});
//todo gdy profileadmina chce dodać ktoś kto nie jest profileadminem i gdy nie istnieje dany profil
//todo gdy profileadmina chce dodać ktoś kto nie jest profileadminem i gdy istnieje dany profil
	});
	after(function(done){
		server.close();
		done();
	});
});