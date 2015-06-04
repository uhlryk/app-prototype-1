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
describe("Create and accept normal user test: ", function(){
	var server;
	var helper = require("../helper.js")(server, url);
	before(function(done){
		server = serverBuilder(config, done);
	});
	describe("Project leader and profileAdmin are logged", function(){
		var superUserToken, profileId, profileAdminLogin, profileAdminToken, leaderLogin, projectId, leaderToken;
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
								helper.loginUser(leaderLogin, smsData.password, function(token){
									leaderToken = token;
								});
							});
						});
					});
				});
			});
		});
		// describe("Project Leader test", function(){
		// 	it("should create new", function(done){

		// 	});
		// });
	});
	after(function(done){
		server.close();
		done();
	});
});