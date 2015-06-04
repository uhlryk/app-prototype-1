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
describe("Leader test: ", function(){
	var server;
	var helper = require("../helper.js")(server, url);
	before(function(done){
		server = serverBuilder(config, done);
	});
	describe("Project and leader are created", function(){
		var superUserToken, profileId, profileAdminLogin, profileAdminToken, leaderLogin, leaderPassword, projectId, leaderToken;
		before(function(done){
			helper.loginAdmin(config.adminAuth.login, config.adminAuth.pass, function(token){
				superUserToken = token;
				helper.createProfile(superUserToken, "Moja firma 112", function(id){
					profileId = id;
					helper.createProfileAdmin(superUserToken, profileId, "+48801633386", function(id, login){
						profileAdminLogin = login;
						var smsData = server.getSmsDebug(login);
						helper.loginUser(profileAdminLogin, smsData.password, function(token){
							profileAdminToken = token;
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
		it("should not allow create profile", function(done){
			request.post(url + "/profiles")
			.set('access-token', leaderToken)
			.send({firmname : "moja firma która ma jakąś nazwę jakiej nie pamiętam, ale jest długa"})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				expect(res.body.message).to.be.equal("NOT_AUTHORIZED");
				done();
			});
		});
		it("should not allow create project", function(done){
			request.post(url + "/projects")
			.set('access-token', leaderToken)
			.send({name : "projekt o nazwie 1"})
			.send({package : "BASIC"})
			.send({profile_id : profileId})
			.send({phone : "+48791111191"})
			.send({firmname : "FirmaA"})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				expect(res.body.message).to.be.equal("NOT_AUTHORIZED");
				done();
			});
		});
		it("should create second project to this leader", function(done){
			request.post(url + "/projects")
			.set('access-token', profileAdminToken)
			.send({name : "projekt o nazwie 2"})
			.send({package : "BASIC"})
			.send({profile_id : profileId})
			.send({phone : "+48791111111"})
			.send({firmname : "FirmaA"})
			.end(function(err, res){
				expect(res.status).to.be.equal(200);
				expect(res.body.login).to.be.a("string");
				var smsData = server.getSmsDebug(res.body.login);
				expect(smsData.password).to.be.a("string");
				expect(res.body.projectId).to.be.above(0);
				expect(res.body.accountId).to.be.above(0);
				helper.loginUser(leaderLogin, leaderPassword, function(token){
					request.get(url + "/")
					.set('access-token',token)
					.end(function(err, res){
						expect(res.status).to.be.equal(200);
						done();
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