//ok
var serverBuilder = require("../../app/server.js");
var config = require("../../config/local_test.js");
var chai = require("chai");
chai.use(require('chai-things'));
var expect = chai.expect;
var debug = require('debug')('test');
var request = require('superagent');
var url = 'http://localhost:' + config.app.port;

describe("Create coworker test: ", function(){
	var server;
	var helper = require("../helper.js")(server, url);

	before(function(done){
		server = serverBuilder(config, done);
	});
	describe("ProfileAdmin is logged (and secondary profile)", function(){
		var superUserToken, profileId, profileAdminPassword, profileAdminLogin, profileAdminToken,
		secondProfileId,leaderLogin, leaderPassword, projectId, leaderToken;
		before(function(done){
			helper.loginAdmin(config.adminAuth.login, config.adminAuth.pass, function(token){
				superUserToken = token;
				helper.createProfile(superUserToken, "Moja firma 112", function(id){
					profileId = id;
					helper.createProfileAdmin(superUserToken, profileId, "+48801633386", function(login){
						profileAdminLogin = login;
						var smsData = server.getSmsDebug(login);
						profileAdminPassword = smsData.password;
						helper.loginUser(profileAdminLogin, profileAdminPassword, function(token){
							profileAdminToken = token;
							helper.createProfile(superUserToken, "Moja firma 113", function(id){
								secondProfileId = id;
								helper.createProject(profileAdminToken, profileId, 'BASIC', "projekt testowy", "+48791111111", function(login, id){
									leaderLogin = login;
									projectId = id;
									var smsData = server.getSmsDebug(login);
									leaderPassword = smsData.password;
									helper.loginUser(leaderLogin, leaderPassword, function(token){
										leaderToken = token;
										helper.setProjectBuildMode(leaderToken, projectId, function(token){
											done();
										});
									});
								});
							});
						});
					});
				});
			});
		});
		it("should not create coworker when project is't exist", function(done){
			request.post(url + "/users/coworker/create")
			.set('access-token', leaderToken)
			.send({"project_id": "999"})
			.send({firstname : "Adam"})
			.send({lastname : "Kowalski"})
			.send({phone : "+48701611386"})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				expect(res.body.message).to.be.equal("NOT_AUTHORIZED");
				done();
			});
		});
		it("should not create coworker when owner is not logged", function(done){
			request.post(url + "/users/coworker/create")
			.send({"project_id": projectId})
			.send({firstname : "Adam"})
			.send({lastname : "Kowalski"})
			.send({phone : "+48701611386"})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				expect(res.body.message).to.be.equal("NOT_AUTHORIZED");
				done();
			});
		});
		it("should not create coworker when owner is't leader", function(done){
			request.post(url + "/users/coworker/create")
			.set('access-token', profileAdminToken)
			.send({"project_id": projectId})
			.send({firstname : "Adam"})
			.send({lastname : "Kowalski"})
			.send({phone : "+48701611386"})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				expect(res.body.message).to.be.equal("NOT_AUTHORIZED");
				done();
			});
		});
		it("should not create coworker when phone is't send", function(done){
			request.post(url + "/users/coworker/create")
			.set('access-token', leaderToken)
			.send({"project_id": projectId})
			.send({firstname : "Adam"})
			.send({lastname : "Kowalski"})
			.end(function(err, res){
				expect(res.status).to.be.equal(422);
				expect(res.body.message).to.be.equal("VALIDATION_ERROR");
				expect(res.body.errors).to.include.some.property("type", "REQUIRE_FIELD");
				done();
			});
		});
		it("should allow to create coworker when only phone", function(done){
			request.post(url + "/users/coworker/create")
			.set('access-token', leaderToken)
			.send({profile_id : projectId})
			.send({phone : "+48701011386"})
			.end(function(err, res){
				expect(res.status).to.be.equal(200);
				expect(res.body.id).to.be.above(0);
				expect(res.body.login).to.be.a("string");
				var smsData = server.getSmsDebug(res.body.login);
				expect(smsData.password).to.be.a("string");
				done();
			});
		});

		it("should not propose coworker when project is't exist", function(done){
			request.post(url + "/users/coworker/proposition")
			.set('access-token', profileAdminToken)
			.send({"project_id": "999"})
			.send({firstname : "Adam"})
			.send({lastname : "Kowalski"})
			.send({phone : "+48702611386"})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				expect(res.body.message).to.be.equal("NOT_AUTHORIZED");
				done();
			});
		});
		it("should not propose coworker when owner is not logged", function(done){
			request.post(url + "/users/coworker/proposition")
			.send({"project_id": projectId})
			.send({firstname : "Adam"})
			.send({lastname : "Kowalski"})
			.send({phone : "+48702611386"})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				expect(res.body.message).to.be.equal("NOT_AUTHORIZED");
				done();
			});
		});
		it("should not propose coworker when owner is't profileadmin or coworker", function(done){
			request.post(url + "/users/coworker/proposition")
			.set('access-token', leaderToken)
			.send({"project_id": projectId})
			.send({firstname : "Adam"})
			.send({lastname : "Kowalski"})
			.send({phone : "+48702611386"})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				expect(res.body.message).to.be.equal("NOT_AUTHORIZED");
				done();
			});
		});
		it("should not propose coworker when phone is't send", function(done){
			request.post(url + "/users/coworker/proposition")
			.set('access-token', profileAdminToken)
			.send({"project_id": projectId})
			.send({firstname : "Adam"})
			.send({lastname : "Kowalski"})
			.end(function(err, res){
				expect(res.status).to.be.equal(422);
				expect(res.body.message).to.be.equal("VALIDATION_ERROR");
				expect(res.body.errors).to.include.some.property("type", "REQUIRE_FIELD");
				done();
			});
		});
		it("should allow to propose coworker", function(done){
			request.post(url + "/users/coworker/proposition")
			.set('access-token', profileAdminToken)
			.send({profile_id : projectId})
			.send({phone : "+48702011386"})
			.end(function(err, res){
				expect(res.status).to.be.equal(200);
				expect(res.body.id).to.be.above(0);
				expect(res.body.login).to.be.a("string");
				var smsData = server.getSmsDebug(res.body.login);
				expect(smsData.password).to.be.a("string");
				done();
			});
		});

		describe("coworker proposition is ready", function(){
			var coworkerId;
			before(function(done){
				request.post(url + "/users/coworker/proposition")
				.set('access-token', profileAdminToken)
				.send({profile_id : projectId})
				.send({phone : "+48702011386"})
				.end(function(err, res){
					expect(res.status).to.be.equal(200);
					expect(res.body.id).to.be.above(0);
					expect(res.body.login).to.be.a("string");
					var smsData = server.getSmsDebug(res.body.login);
					expect(smsData.password).to.be.a("string");
					coworkerId = res.body.id;
					done();
				});
			});
			it("should not accept coworker when project is't exist", function(done){
				request.post(url + "/users/coworker/accept/"+coworkerId)
				.set('access-token', leaderToken)
				.send({"project_id": "999"})
				.end(function(err, res){
					expect(res.status).to.be.equal(401);
					expect(res.body.message).to.be.equal("NOT_AUTHORIZED");
					done();
				});
			});
			it("should not accept coworker when owner is not logged", function(done){
				request.post(url + "/users/coworker/accept/"+coworkerId)
				.send({"project_id": projectId})
				.end(function(err, res){
					expect(res.status).to.be.equal(401);
					expect(res.body.message).to.be.equal("NOT_AUTHORIZED");
					done();
				});
			});
			it("should not accept coworker when owner is't leader", function(done){
				request.post(url + "/users/coworker/accept/"+coworkerId)
				.set('access-token', profileAdminToken)
				.send({"project_id": projectId})
				.end(function(err, res){
					expect(res.status).to.be.equal(401);
					expect(res.body.message).to.be.equal("NOT_AUTHORIZED");
					done();
				});
			});
			it("should not accept coworker when coworkerId is't send", function(done){
				request.post(url + "/users/coworker/accept/")
				.set('access-token', leaderToken)
				.send({"project_id": projectId})
				.end(function(err, res){
					expect(res.status).to.be.equal(422);
					expect(res.body.message).to.be.equal("VALIDATION_ERROR");
					expect(res.body.errors).to.include.some.property("type", "REQUIRE_FIELD");
				});
			});
			it("should not accept coworker when coworkerId is wrong", function(done){
				request.post(url + "/users/coworker/accept/dsf")
				.set('access-token', leaderToken)
				.send({"project_id": projectId})
				.end(function(err, res){
					expect(res.status).to.be.equal(422);
					expect(res.body.message).to.be.equal("VALIDATION_ERROR");
					expect(res.body.errors).to.include.some.property("type", "REQUIRE_FIELD");
				});
			});
			it("should allow to accept coworker", function(done){
				request.post(url + "/users/coworker/accept/"+coworkerId)
				.set('access-token', leaderToken)
				.send({profile_id : projectId})
				.end(function(err, res){
					expect(res.status).to.be.equal(200);
					expect(res.body.id).to.be.above(0);
					done();
				});
			});
		});
	});
	after(function(done){
		server.close();
		done();
	});
});