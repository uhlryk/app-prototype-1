//ok
var serverBuilder = require("../../app/server.js");
var config = require("../../config/local_test.js");
var chai = require("chai");
chai.use(require('chai-things'));
var expect = chai.expect;
var debug = require('debug')('test');
var request = require('superagent');
var url = 'http://localhost:' + config.app.port;

describe("Project change status and set paid date test: ", function(){
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
		secondProfileId,leaderLogin, leaderPassword, projectId, leaderToken;
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
									done();
								});
							});
						});
					});
				});
			});
		});
		it("should not superadmin set paid date to project when paid_date is wrong", function(done){
			request.post(url + "/projects/paymant")
			.set('access-token', superUserToken)
			.send({"project_id":projectId})
			.send({"paid_date": "2014--01"})
			.end(function(err, res){
				expect(res.status).to.be.equal(422);
				expect(res.body.message).to.be.equal("VALIDATION_ERROR");
				expect(res.body.errors).to.include.some.property("type", "INVALID_FIELD");
				done();
			});
		});
		it("should not superadmin set paid date to project when paid_date is not send", function(done){
			request.post(url + "/projects/paymant")
			.set('access-token', superUserToken)
			.send({"project_id":projectId})
			.end(function(err, res){
				expect(res.status).to.be.equal(422);
				expect(res.body.message).to.be.equal("VALIDATION_ERROR");
				expect(res.body.errors).to.include.some.property("type", "INVALID_FIELD");
				done();
			});
		});
		it("should superadmin change status to project", function(done){
			request.post(url + "/projects/status")
			.set('access-token', superUserToken)
			.send({"project_id":projectId})
			.send({"status": "ACTIVE"})
			.end(function(err, res){
				expect(res.status).to.be.equal(200);
				expect(res.body.id).to.be.above(0);
				done();
			});
		});
		it("should not superadmin change status project when status is wrong", function(done){
			request.post(url + "/projects/status")
			.set('access-token', superUserToken)
			.send({"project_id":projectId})
			.send({"status": "SOME_STATUS"})
			.end(function(err, res){
				expect(res.status).to.be.equal(422);
				expect(res.body.message).to.be.equal("VALIDATION_ERROR");
				expect(res.body.errors).to.include.some.property("type", "FIELD_VALIDATION_FAILED");
				done();
			});
		});
		it("should not superadmin change status project when project not exist", function(done){
			request.post(url + "/projects/status")
			.set('access-token', superUserToken)
			.send({"project_id":"999"})
			.send({"status": "ACTIVE"})
			.end(function(err, res){
				expect(res.status).to.be.equal(422);
				expect(res.body.message).to.be.equal("PROCESS_ERROR");
				expect(res.body.type).to.be.equal("INVALID_PROJECT");
				done();
			});
		});
		it("should superadmin set paid date to project", function(done){
			request.post(url + "/projects/paymant")
			.set('access-token', superUserToken)
			.send({"project_id":projectId})
			.send({"paid_date": "2014-03-01"})
			.end(function(err, res){
				expect(res.status).to.be.equal(200);
				expect(res.body.id).to.be.above(0);
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
			it("should not set paid date to project- super admin only", function(done){
				request.post(url + "/projects/paymant")
				.set('access-token', leaderToken)
				.send({"project_id":projectId})
				.send({"paid_date": "2014-03-01"})
				.end(function(err, res){
					expect(res.status).to.be.equal(401);
					expect(res.body.message).to.be.equal("NOT_AUTHORIZED");
					done();
				});
			});
			it("should not change status to project- super admin only", function(done){
				request.post(url + "/projects/status")
				.set('access-token', leaderToken)
				.send({"project_id":projectId})
				.send({"status": "ACTIVE"})
				.end(function(err, res){
					expect(res.status).to.be.equal(401);
					expect(res.body.message).to.be.equal("NOT_AUTHORIZED");
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