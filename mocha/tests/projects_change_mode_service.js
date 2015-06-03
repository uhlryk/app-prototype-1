var serverBuilder = require("../../app/server.js");
var config = require("../../config/local_test.js");
var chai = require("chai");
chai.use(require('chai-things'));
var expect = chai.expect;
var debug = require('debug')('test');
var request = require('superagent');
var url = 'http://localhost:' + config.app.port;

describe("project Change mode to service test: ", function(){
	var server;
	var helper = require("../helper.js")(server, url);

	before(function(done){
		server = serverBuilder(config, done);
	});
	/**
	 * mamy dwa profile i w jednym jest profileAdmin
	 */
	describe("ProfileAdmin is logged (and secondary profile)", function(){
		var superUserToken, profileId, profileAdminPassword, profileAdminLogin, profileAdminToken,
		secondProfileId, leaderLogin, leaderPassword, projectId, leaderToken;
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
								helper.createProject(profileAdminToken, profileId, 'BASIC', "projekt testowy", "+48791111111", function(login, id){
									leaderLogin = login;
									projectId = id;
									var smsData = server.getSmsDebug(login);
									leaderPassword = smsData.password;
									helper.loginUser(leaderLogin, leaderPassword, function(token){
										leaderToken = token;
										done();
									});
								});
							});
						});
					});
				});
			});
		});
		it("should not change mode from BUILD to SERVICE when project not exists", function(done){
			request.post(url + "/projects/mode/service")
			.set('access-token', leaderToken)
			.send({"project_id":999})
			.send({"warranty_date": "2015-03-01"})
			.send({"is_new_leader": true})
			.send({phone : "+48791881116"})
			.send({firmname : "FirmaA"})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				expect(res.body.message).to.be.equal("NOT_AUTHORIZED");
				done();
			});
		});
		it("should not change mode from BUILD to SERVICE when is_new_leader but not phone", function(done){
			request.post(url + "/projects/mode/service")
			.set('access-token', leaderToken)
			.send({"project_id":projectId})
			.send({"warranty_date": "2015-03-01"})
			.send({"is_new_leader": true})
			.send({firmname : "FirmaA"})
			.end(function(err, res){
				expect(res.status).to.be.equal(422);
				expect(res.body.message).to.be.equal("VALIDATION_ERROR");
				expect(res.body.errors).to.include.some.property("type", "REQUIRE_FIELD");
				done();
			});
		});
		it("should not change mode from BUILD to SERVICE when is_new_leader but not firmname", function(done){
			request.post(url + "/projects/mode/service")
			.set('access-token', leaderToken)
			.send({"project_id":projectId})
			.send({"warranty_date": "2015-03-01"})
			.send({"is_new_leader": true})
			.send({phone : "+48791881112"})
			.end(function(err, res){
				expect(res.status).to.be.equal(422);
				expect(res.body.message).to.be.equal("VALIDATION_ERROR");
				expect(res.body.errors).to.include.some.property("type", "REQUIRE_FIELD");
				done();
			});
		});
		it("should not change mode from BUILD to SERVICE when is_new_leader but wrong phone", function(done){
			request.post(url + "/projects/mode/service")
			.set('access-token', leaderToken)
			.send({"project_id":projectId})
			.send({"warranty_date": "2015-03-01"})
			.send({"is_new_leader": true})
			.send({phone : "+48781116"})
			.send({firmname : "FirmaA"})
			.end(function(err, res){
				expect(res.status).to.be.equal(422);
				expect(res.body.message).to.be.equal("VALIDATION_ERROR");
				expect(res.body.errors).to.include.some.property("type", "REQUIRE_FIELD");
				done();
			});
		});
		it("should not change mode from BUILD to SERVICE when project is not configure", function(done){
			request.post(url + "/projects/mode/service")
			.set('access-token', leaderToken)
			.send({"project_id":projectId})
			.send({"warranty_date": "2015-03-01"})
			.send({"is_new_leader": true})
			.send({phone : "+48791881116"})
			.send({firmname : "FirmaA"})
			.end(function(err, res){
				expect(res.status).to.be.equal(422);
				expect(res.body.message).to.be.equal("PROCESS_ERROR");
				expect(res.body.type).to.be.equal("INVALID_PROJECT");
				done();
			});
		});
		describe("project is Configure", function(){
			before(function(done){
				request.post(url + "/projects/mode/build")
				.set('access-token', leaderToken)
				.send({"project_id":projectId})
				.send({"start_date": "2013-03-01"})
				.send({"finish_date": "2013-05-01"})
				.send({"investor_firmname": "inwestor testowy"})
				.end(function(err, res){
					done();
				});
			});
			it("should change mode from BUILD to SERVICE when is_new_leader and phone", function(done){
				request.post(url + "/projects/mode/service")
				.set('access-token', leaderToken)
				.send({"project_id":projectId})
				.send({"warranty_date": "2015-03-01"})
				.send({"is_new_leader": true})
				.send({phone : "+48791881116"})
				.send({firmname : "FirmaA"})
				.end(function(err, res){
					expect(res.status).to.be.equal(200);
					done();
				});
			});
		});
		describe("project is DISABLE", function(){
			before(function(done){
				request.post(url + "/projects/status")
				.set('access-token', superUserToken)
				.send({"project_id":projectId})
				.send({"status": "DISABLE"})
				.end(function(err, res){
					done();
				});
			});
			after(function(done){
				request.post(url + "/projects/status")
				.set('access-token', superUserToken)
				.send({"project_id":projectId})
				.send({"status": "ACTIVE"})
				.end(function(err, res){
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