var serverBuilder = require("../../app/server.js");
var config = require("../../config/local_test.js");
var chai = require("chai");
chai.use(require('chai-things'));
var expect = chai.expect;
var debug = require('debug')('test');
var request = require('superagent');
var url = 'http://localhost:' + config.app.port;
var helper = require("../helper.js")(url);

describe("Create project test: ", function(){
	var server;
	before(function(done){
		server = serverBuilder(config, done);
	});
	describe("ProfileAdmin is logged (and secondary profile)", function(){
		var superUserToken, profileId, profileAdminPassword, profileAdminLogin, profileAdminToken, secondProfileId;
		before(function(done){
			helper.loginAdmin(config.adminAuth.login, config.adminAuth.pass, function(token){
				superUserToken = token;
				helper.createProfile(superUserToken, "Moja firma 112", function(id){
					profileId = id;
					helper.createProfileAdmin(superUserToken, profileId, "+48801633386", function(login, password){
						profileAdminPassword = password;
						profileAdminLogin = login;
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



	});
	after(function(done){
		server.close();
		done();
	});
});