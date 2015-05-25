var serverBuilder = require("../../app/server.js");
var config = require("../../config/local_test.js");
var chai = require("chai");
chai.use(require('chai-things'));
var expect = chai.expect;
var debug = require('debug')('test');
var request = require('superagent');
var url = 'http://localhost:' + config.app.port;

describe("Create project test: ", function(){
	var server;
	var helper = require("../helper.js")(server, url);

	before(function(done){
		server = serverBuilder(config, done);
	});
	describe("Not logged user", function(){
		it("should not allow to create project", function(done){
			request.post(url + "/projects")
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				expect(res.body.message).to.be.equal("NO_TOKEN");
				done();
			});
		});
	});
	/**
	 * mamy dwa profile i w jednym jest profileAdmin
	 */
	describe("ProfileAdmin is logged (and secondary profile)", function(){
		var superUserToken, profileId, profileAdminPassword, profileAdminLogin, profileAdminToken, secondProfileId;
		before(function(done){
			helper.loginAdmin(config.adminAuth.login, config.adminAuth.pass, function(token){
				superUserToken = token;
				helper.createProfile(superUserToken, "Moja firma 112", function(id){
					profileId = id;
					helper.createProfileAdmin(superUserToken, profileId, "+48801633386", function(login, password){
						profileAdminLogin = login;
						var smsData = server.getSmsDebug(login);
						profileAdminPassword = smsData.password;
						helper.loginUser(profileAdminLogin, profileAdminPassword, function(token){
							profileAdminToken = token;
							helper.createProfile(superUserToken, "Moja firma 113", function(id){
								secondProfileId = id;
								done();
							});
						});
					});
				});
			});
		});
		it("should create new project by profileAdmin", function(done){
			request.post(url + "/projects")
			.set('access-token', profileAdminToken)
			.send({name : "projekt o nazwie 1"})
			.send({test : "ALa ma Kota"})
			.send({package : "BASIC"})
			.send({profile_id : profileId})
			.send({phone : "+48791991111"})
			.end(function(err, res){
				expect(res.status).to.be.equal(200);
				expect(res.body.login).to.be.a("string");
				var smsData = server.getSmsDebug(res.body.login);
				expect(smsData.password).to.be.a("string");
				expect(res.body.id).to.be.above(0);
				done();
			});
		});
		it("should not create new project by profileAdmin if no phonenumber", function(done){
			request.post(url + "/projects")
			.set('access-token', profileAdminToken)
			.send({name : "projekt o nazwie 1"})
			.send({package : "BASIC"})
			.send({profile_id : profileId})
			.end(function(err, res){
				expect(res.status).to.be.equal(422);
				expect(res.body.message).to.be.equal("VALIDATION_ERROR");
				expect(res.body.errors).to.include.some.property("type", "REQUIRE_FIELD");
				done();
			});
		});
		it("should not create new project by profileAdmin if no profile_id", function(done){
			request.post(url + "/projects")
			.set('access-token', profileAdminToken)
			.send({name : "projekt o nazwie 1"})
			.send({package : "BASIC"})
			.send({phone : "+48791111112"})
			.end(function(err, res){
				expect(res.status).to.be.equal(422);
				expect(res.body.message).to.be.equal("VALIDATION_ERROR");
				expect(res.body.errors).to.include.some.property("type", "INVALID_FIELD");
				done();
			});
		});
		it("should not create new project by profileAdmin if profile_id is not exist", function(done){
			request.post(url + "/projects")
			.set('access-token', profileAdminToken)
			.send({name : "projekt o nazwie 1"})
			.send({package : "BASIC"})
			.send({profile_id : 999})
			.send({phone : "+48791111113"})
			.end(function(err, res){
				expect(res.status).to.be.equal(422);
				expect(res.body.message).to.be.equal("PROCESS_ERROR");
				expect(res.body.type).to.be.equal("EMPTY_PROFILE");
				done();
			});
		});
		it("should not create new project by profileAdmin if profile_id is wrong", function(done){
			request.post(url + "/projects")
			.set('access-token', profileAdminToken)
			.send({name : "projekt o nazwie 1"})
			.send({package : "BASIC"})
			.send({profile_id : "AAA"})
			.send({phone : "+48791111113"})
			.end(function(err, res){
				expect(res.status).to.be.equal(422);
				expect(res.body.message).to.be.equal("VALIDATION_ERROR");
				expect(res.body.errors).to.include.some.property("type", "INVALID_FIELD");
				done();
			});
		});
		it("should not create new project by profileAdmin if no package", function(done){
			request.post(url + "/projects")
			.set('access-token', profileAdminToken)
			.send({name : "projekt o nazwie 1"})
			.send({profile_id : profileId})
			.send({phone : "+48791111114"})
			.end(function(err, res){
				expect(res.status).to.be.equal(422);
				expect(res.body.message).to.be.equal("VALIDATION_ERROR");
				expect(res.body.errors).to.include.some.property("type", "REQUIRE_FIELD");
				done();
			});
		});
		it("should not create new project by profileAdmin if wrong package", function(done){
			request.post(url + "/projects")
			.set('access-token', profileAdminToken)
			.send({name : "projekt o nazwie 1"})
			.send({profile_id : profileId})
			.send({package : "BASIC1"})
			.send({phone : "+48791111115"})
			.end(function(err, res){
				expect(res.status).to.be.equal(422);
				expect(res.body.message).to.be.equal("VALIDATION_ERROR");
				expect(res.body.errors).to.include.some.property("type", "FIELD_VALIDATION_FAILED");
				done();
			});
		});
		it("should create new project by profileAdmin and add existing user as leader", function(done){
			request.post(url + "/projects")
			.set('access-token', profileAdminToken)
			.send({name : "projekt o nazwie 2"})
			.send({package : "BASIC"})
			.send({profile_id : profileId})
			.send({phone : "+48791111116"})
			.end(function(err, res){
				expect(res.status).to.be.equal(200);
				expect(res.body.login).to.be.a("string");
				var smsData = server.getSmsDebug(res.body.login);
				expect(smsData.password).to.be.a("string");
				expect(res.body.id).to.be.above(0);
				done();
			});
		});
		describe("Project and leader are created", function(){
			var leaderLogin, leaderPassword, projectId, leaderToken;
			before(function(done){
				helper.createProject(profileAdminToken, profileId, 'BASIC', "projekt testowy", "+48791111111", function(login, id){
					leaderLogin = login;
					projectId = id;
					var smsData = server.getSmsDebug(login);
					leaderPassword = smsData.password;
					done();
				});
			});
			it("should login when credentials are ok", function(done){
				request.post(url + "/tokens")
				.send({ login: leaderLogin, password: leaderPassword})
				.end(function(err, res){
					expect(res.status).to.be.equal(200);
					expect(res.body.token).to.be.a("string");
					done();
				});
			});
			it("should not configure project by not login user", function(done){
				request.post(url + "/projects/configure")
				.send({"project_id": projectId})
				.end(function(err, res){
					expect(res.status).to.be.equal(401);
					expect(res.body.message).to.be.equal("NO_TOKEN");
					done();
				});
			});
			it("should not configure project by admin", function(done){
				request.post(url + "/projects/configure")
				.set('access-token', superUserToken)
				.send({"project_id": projectId})
				.end(function(err, res){
					expect(res.status).to.be.equal(403);
					expect(res.body.message).to.be.equal("NO_AUTHORIZATION");
					done();
				});
			});
// todo: mamy kilku adminów i jeden próbuje inicjować projekt innego
			describe("Leader is login, configure projekt", function(){
				before(function(done){
					helper.loginUser(leaderLogin, leaderPassword, function(token){
						leaderToken = token;
						done();
					});
				});
				it("should not configure project if there is no start_date and finish_date send", function(done){
					request.post(url + "/projects/configure")
					.set('access-token', leaderToken)
					.send({"project_id": "999"})
					.end(function(err, res){
						expect(res.status).to.be.equal(422);
						expect(res.body.message).to.be.equal("VALIDATION_ERROR");
						expect(res.body.errors).to.include.some.property("type", "INVALID_FIELD");
						done();
					});
				});
				it("should not configure project if project not exist", function(done){
					request.post(url + "/projects/configure")
					.set('access-token', leaderToken)
					.send({"project_id": "999"})
					.send({"start_date": "2013-03-01"})
					.send({"finish_date": "2013-05-01"})
					.end(function(err, res){
						expect(res.status).to.be.equal(422);
						expect(res.body.message).to.be.equal("PROCESS_ERROR");
						expect(res.body.type).to.be.equal("WRONG_VALUE");
						done();
					});
				});
				it("should configure project and make it active", function(done){
					request.post(url + "/projects/configure")
					.set('access-token', leaderToken)
					.send({"project_id":projectId})
					.send({"start_date": "2013-03-01"})
					.send({"finish_date": "2013-05-01"})
					.send({"investor_firmname": "inwestor testowy"})
					.end(function(err, res){
						expect(res.status).to.be.equal(200);
						expect(res.body.id).to.be.above(0);
						done();
					});
				});
				it("should not configure project if it is Active", function(done){
					request.post(url + "/projects/configure")
					.set('access-token', leaderToken)
					.send({"project_id":projectId})
					.send({"start_date": "2013-03-01"})
					.send({"finish_date": "2013-05-01"})
					.send({"investor_firmname": "inwestor testowy"})
					.end(function(err, res){
						request.post(url + "/projects/configure")
						.set('access-token', leaderToken)
						.send({"project_id":projectId})
						.send({"start_date": "2013-04-01"})
						.send({"finish_date": "2013-06-01"})
						.send({"investor_firmname": "inwestor testowy"})
						.end(function(err, res){
							expect(res.status).to.be.equal(422);
							expect(res.body.message).to.be.equal("PROCESS_ERROR");
							expect(res.body.type).to.be.equal("INVALID_PROJECT");
							done();
						});
					});
				});
			});
		});
	});

	after(function(done){
		server.close();
		done();
	});
});