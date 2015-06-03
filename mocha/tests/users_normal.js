//ok
var serverBuilder = require("../../app/server.js");
var config = require("../../config/local_test.js");
var chai = require("chai");
chai.use(require('chai-things'));
var expect = chai.expect;
var debug = require('debug')('test');
var request = require('superagent');
var url = 'http://localhost:' + config.app.port;

var roles = ["coworker", "investor", "designer", "inspector","subcontractor"];
roles.forEach(function(role){
	describe("Create " + role + " test: ", function(){
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
			it("should not create " + role + " when project is't exist", function(done){
				request.post(url + "/users/" + role + "/create")
				.set('access-token', leaderToken)
				.send({"project_id": "999"})
				.send({firstname : "Adam"})
				.send({lastname : "Kowalski"})
				.send({phone : "+48701611386"})
				.send({firmname : "FirmaA"})
				.end(function(err, res){
					expect(res.status).to.be.equal(401);
					expect(res.body.message).to.be.equal("NOT_AUTHORIZED");
					done();
				});
			});
			it("should not create " + role + " when owner is not logged", function(done){
				request.post(url + "/users/" + role + "/create")
				.send({"project_id": projectId})
				.send({firstname : "Adam"})
				.send({lastname : "Kowalski"})
				.send({phone : "+48701611386"})
				.send({firmname : "FirmaA"})
				.end(function(err, res){
					expect(res.status).to.be.equal(401);
					expect(res.body.message).to.be.equal("NOT_AUTHORIZED");
					done();
				});
			});
			it("should not create " + role + " when owner is't leader", function(done){
				request.post(url + "/users/" + role + "/create")
				.set('access-token', profileAdminToken)
				.send({"project_id": projectId})
				.send({firstname : "Adam"})
				.send({lastname : "Kowalski"})
				.send({phone : "+48701611386"})
				.send({firmname : "FirmaA"})
				.end(function(err, res){
					expect(res.status).to.be.equal(401);
					expect(res.body.message).to.be.equal("NOT_AUTHORIZED");
					done();
				});
			});
			it("should not create " + role + " when phone is't send", function(done){
				request.post(url + "/users/" + role + "/create")
				.set('access-token', leaderToken)
				.send({"project_id": projectId})
				.send({firstname : "Adam"})
				.send({lastname : "Kowalski"})
				.send({firmname : "FirmaA"})
				.end(function(err, res){
					expect(res.status).to.be.equal(422);
					expect(res.body.message).to.be.equal("VALIDATION_ERROR");
					expect(res.body.errors).to.include.some.property("type", "REQUIRE_FIELD");
					done();
				});
			});
			it("should not create " + role + " when firmname is't send", function(done){
				request.post(url + "/users/" + role + "/create")
				.set('access-token', leaderToken)
				.send({"project_id": projectId})
				.send({firstname : "Adam"})
				.send({lastname : "Kowalski"})
				.send({phone : "+48701611386"})
				.end(function(err, res){
					expect(res.status).to.be.equal(422);
					expect(res.body.message).to.be.equal("VALIDATION_ERROR");
					expect(res.body.errors).to.include.some.property("type", "REQUIRE_FIELD");
					done();
				});
			});
			it("should allow to create " + role + " when only phone", function(done){
				request.post(url + "/users/" + role + "/create")
				.set('access-token', leaderToken)
				.send({"project_id": projectId})
				.send({phone : "+48701011386"})
				.send({firmname : "FirmaA"})
				.end(function(err, res){
					expect(res.status).to.be.equal(200);
					expect(res.body.login).to.be.a("string");
					var smsData = server.getSmsDebug(res.body.login);
					expect(smsData.password).to.be.a("string");
					expect(smsData.accountId).to.be.above(0);
					done();
				});
			});

			it("should not propose " + role + " when project is't exist", function(done){
				request.post(url + "/users/" + role + "/proposition")
				.set('access-token', profileAdminToken)
				.send({"project_id": "999"})
				.send({firstname : "Adam"})
				.send({lastname : "Kowalski"})
				.send({phone : "+48702611386"})
				.send({firmname : "FirmaA"})
				.end(function(err, res){
					expect(res.status).to.be.equal(401);
					expect(res.body.message).to.be.equal("NOT_AUTHORIZED");
					done();
				});
			});
			it("should not propose " + role + " when owner is not logged", function(done){
				request.post(url + "/users/" + role + "/proposition")
				.send({"project_id": projectId})
				.send({firstname : "Adam"})
				.send({lastname : "Kowalski"})
				.send({phone : "+48702611386"})
				.send({firmname : "FirmaA"})
				.end(function(err, res){
					expect(res.status).to.be.equal(401);
					expect(res.body.message).to.be.equal("NOT_AUTHORIZED");
					done();
				});
			});

			it("should not propose " + role + " when phone is't send", function(done){
				request.post(url + "/users/" + role + "/proposition")
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
			it("should allow to propose " + role + "", function(done){
				request.post(url + "/users/" + role + "/proposition")
				.set('access-token', profileAdminToken)
				.send({"project_id": projectId})
				.send({phone : "+48702011386"})
				.send({firmname : "FirmaA"})
				.end(function(err, res){
					expect(res.status).to.be.equal(200);
					expect(res.body.login).to.be.a("string");
					expect(res.body.id).to.be.above(0);
					// var smsData = server.getSmsDebug(res.body.login);
					// expect(smsData.password).to.be.a("string");
					done();
				});
			});

			describe("" + role + " proposition is ready", function(){
				var coworkerRoleId;
				before(function(done){
					request.post(url + "/users/" + role + "/proposition")
					.set('access-token', profileAdminToken)
					.send({"project_id": projectId})
					.send({phone : "+48702011386"})
					.send({firmname : "FirmaA"})
					.end(function(err, res){
						expect(res.status).to.be.equal(200);
						expect(res.body.login).to.be.a("string");
						expect(res.body.id).to.be.above(0);
						coworkerRoleId = res.body.id;
						done();
					});
				});
				it("should not accept " + role + " when role is't exist", function(done){
					request.post(url + "/users/" + role + "/accept")
					.set('access-token', leaderToken)
					.send({"role_id": "999"})
					.send({"project_id": projectId})
					.end(function(err, res){
						expect(res.status).to.be.equal(422);
						expect(res.body.message).to.be.equal("PROCESS_ERROR");
						expect(res.body.type).to.be.equal("INVALID_PROJECT_ROLE");
						done();
					});
				});
				it("should not accept " + role + " when project is't exist", function(done){
					request.post(url + "/users/" + role + "/accept")
					.set('access-token', leaderToken)
					.send({"role_id": coworkerRoleId})
					.send({"project_id": "999"})
					.end(function(err, res){
						expect(res.status).to.be.equal(401);
						expect(res.body.message).to.be.equal("NOT_AUTHORIZED");
						done();
					});
				});
				it("should not accept " + role + " when owner is not logged", function(done){
					request.post(url + "/users/" + role + "/accept")
					.send({"role_id": coworkerRoleId})
					.send({"project_id": projectId})
					.end(function(err, res){
						expect(res.status).to.be.equal(401);
						expect(res.body.message).to.be.equal("NOT_AUTHORIZED");
						done();
					});
				});
				it("should not accept " + role + " when owner is't leader", function(done){
					request.post(url + "/users/" + role + "/accept")
					.set('access-token', profileAdminToken)
					.send({"role_id": coworkerRoleId})
					.send({"project_id": projectId})
					.end(function(err, res){
						expect(res.status).to.be.equal(401);
						expect(res.body.message).to.be.equal("NOT_AUTHORIZED");
						done();
					});
				});
				it("should not accept " + role + " when coworkerId is't send", function(done){
					request.post(url + "/users/" + role + "/accept")
					.set('access-token', leaderToken)
					.send({"project_id": projectId})
					.end(function(err, res){
						expect(res.status).to.be.equal(422);
						expect(res.body.message).to.be.equal("VALIDATION_ERROR");
						expect(res.body.errors).to.include.some.property("type", "REQUIRE_FIELD");
						done();
					});
				});
				it("should not accept " + role + " when coworkerId is wrong", function(done){
					request.post(url + "/users/" + role + "/accept")
					.set('access-token', leaderToken)
					.send({"role_id": "fsdsfds"})
					.send({"project_id": projectId})
					.end(function(err, res){
						expect(res.status).to.be.equal(422);
						expect(res.body.message).to.be.equal("VALIDATION_ERROR");
						expect(res.body.errors).to.include.some.property("type", "REQUIRE_FIELD");
						done();
					});
				});
				it("should allow to accept " + role, function(done){
					request.post(url + "/users/" + role + "/accept")
					.set('access-token', leaderToken)
					.send({"role_id": coworkerRoleId})
					.send({"project_id": projectId})
					.end(function(err, res){
						expect(res.status).to.be.equal(200);
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
});
			// it("should not propose " + role + " when owner is't profileadmin or " + role + "", function(done){
			// 	request.post(url + "/users/" + role + "/proposition")
			// 	.set('access-token', leaderToken)
			// 	.send({"project_id": projectId})
			// 	.send({firstname : "Adam"})
			// 	.send({lastname : "Kowalski"})
			// 	.send({phone : "+48702611386"})
			// 	.end(function(err, res){
			// 		expect(res.status).to.be.equal(401);
			// 		expect(res.body.message).to.be.equal("NOT_AUTHORIZED");
			// 		done();
			// 	});
			// });
//TODO: brakuje bardziej specjalistycznych testów gdzie sprawdzamy czy dana rola może dodawać czy proponować
//np profile admin może zatwierdzać subcontractorów, a insspektor może głaszać inspektorów czy projektantów
//ale projektant może zgłosić tylko innego projektanta