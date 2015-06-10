//ok
var serverBuilder = require("../../app/server.js");
var config = require("../../config/local_test.js");
var chai = require("chai");
chai.use(require('chai-things'));
var expect = chai.expect;
var debug = require('debug')('test');
var request = require('superagent');
var url = 'http://localhost:' + config.app.port;

	//sprawdzamy uprawnienia, nie musimy wysyłać konkretnych danych. Ważne jest czy otrzmany błąd jest 401 czy inny. 401 znaczy że brak uprawnień
	//inny błąd znaczy że dany user ma dostęp do danej metody
describe("Create project test: ", function(){
	var server;
	var helper = require("../helper.js")(server, url);
	var builder;
	var buildData;
	before(function(done){
		server = serverBuilder(config, function(){
			builder = require("../builder.js")(server, url);
			builder({
				profile:2,
				admin : 1,
				buildProject: 2,
				investor : 2,
				coworker :2,
				inspector : 2,
				designer : 2,
				subcontractor_1: 2,
				subcontractor_2 : 2
			}, function(result){
				buildData = result;
				done();
			});
		});
	});
	describe("add photo permission test:", function(){
		var projectFirst;
		var leaderFirst;
		var adminFirst;
		var investorFirst;
		var inspectorFirst;
		var designerFirst;
		var subcontractorFirst;
		var projectSecond;
		var profileFirst;
		var profileSecond;
		before(function(done){
			profileFirst = buildData.profiles[buildData.profileList[0]];
			profileSecond = buildData.profiles[buildData.profileList[1]];
			projectFirst = buildData.projects[profileFirst.projectList[0]];
			projectSecond = buildData.projects[profileSecond.projectList[0]];
			leaderFirst = buildData.users[projectFirst.leaderId];
			adminFirst = buildData.users[profileFirst.adminList[0]];
			projectFirst.userList.every(function(id){
				var user = buildData.users[id];
				if(user.role === "INVESTOR"){
					investorFirst = user;
					return false;
				}
				return true;
			});
			projectFirst.userList.every(function(id){
				var user = buildData.users[id];
				if(user.role === "INSPECTOR"){
					inspectorFirst = user;
					return false;
				}
				return true;
			});
			projectFirst.userList.every(function(id){
				var user = buildData.users[id];
				if(user.role === "DESIGNER"){
					designerFirst = user;
					return false;
				}
				return true;
			});
			projectFirst.userList.every(function(id){
				var user = buildData.users[id];
				if(user.role === "SUBCONTRACTOR"){
					subcontractorFirst = user;
					return false;
				}
				return true;
			});
			done();
		});
		describe("Project leader permission test:", function(){
			it("should not return 401 auth error, when adding photo in own project", function(done){
				request.post(url + "/photos")
				.set('access-token', leaderFirst.token)
				.field("project_id",projectFirst.id)
				.attach("photo","mocha/attachements/normalImage.jpg")
				.end(function(err, res){
					expect(res.status).to.not.be.equal(401);
					done();
				});
			});
			it("should return 401 auth error, when adding photo in other project", function(done){
				request.post(url + "/photos")
				.set('access-token', leaderFirst.token)
				.field("project_id",projectSecond.id)
				.attach("photo","mocha/attachements/normalImage.jpg")
				.end(function(err, res){
					expect(res.status).to.be.equal(401);
					done();
				});
			});
		});
		describe("Profile Admin permission test:", function(){
			it("should not return 401 auth error, when adding photo in own project", function(done){
				request.post(url + "/photos")
				.set('access-token', adminFirst.token)
				.field("project_id",projectFirst.id)
				.attach("photo","mocha/attachements/normalImage.jpg")
				.end(function(err, res){
					expect(res.status).to.not.be.equal(401);
					done();
				});
			});
			it("should return 401 auth error, when adding photo in other project", function(done){
				request.post(url + "/photos")
				.set('access-token', adminFirst.token)
				.field("project_id",projectSecond.id)
				.attach("photo","mocha/attachements/normalImage.jpg")
				.end(function(err, res){
					expect(res.status).to.be.equal(401);
					done();
				});
			});
		});
		describe("Investor permission test:", function(){
			it("should not return 401 auth error, when adding photo in own project", function(done){
				request.post(url + "/photos")
				.set('access-token', investorFirst.token)
				.field("project_id",projectFirst.id)
				.attach("photo","mocha/attachements/normalImage.jpg")
				.end(function(err, res){
					expect(res.status).to.not.be.equal(401);
					done();
				});
			});
			it("should return 401 auth error, when adding photo in other project", function(done){
				request.post(url + "/photos")
				.set('access-token', investorFirst.token)
				.field("project_id",projectSecond.id)
				.attach("photo","mocha/attachements/normalImage.jpg")
				.end(function(err, res){
					expect(res.status).to.be.equal(401);
					done();
				});
			});
		});
		describe("Inspector permission test:", function(){
			it("should not return 401 auth error, when adding photo in own project", function(done){
				request.post(url + "/photos")
				.set('access-token', inspectorFirst.token)
				.field("project_id",projectFirst.id)
				.attach("photo","mocha/attachements/normalImage.jpg")
				.end(function(err, res){
					expect(res.status).to.not.be.equal(401);
					done();
				});
			});
			it("should return 401 auth error, when adding photo in other project", function(done){
				request.post(url + "/photos")
				.set('access-token', inspectorFirst.token)
				.field("project_id",projectSecond.id)
				.attach("photo","mocha/attachements/normalImage.jpg")
				.end(function(err, res){
					expect(res.status).to.be.equal(401);
					done();
				});
			});
		});
		describe("Designer permission test:", function(){
			it("should not return 401 auth error, when adding photo in own project", function(done){
				request.post(url + "/photos")
				.set('access-token', designerFirst.token)
				.field("project_id",projectFirst.id)
				.attach("photo","mocha/attachements/normalImage.jpg")
				.end(function(err, res){
					expect(res.status).to.not.be.equal(401);
					done();
				});
			});
			it("should return 401 auth error, when adding photo in other project", function(done){
				request.post(url + "/photos")
				.set('access-token', designerFirst.token)
				.field("project_id",projectSecond.id)
				.attach("photo","mocha/attachements/normalImage.jpg")
				.end(function(err, res){
					expect(res.status).to.be.equal(401);
					done();
				});
			});
		});
		describe("subcontractor permission test:", function(){
			it("should not return 401 auth error, when adding photo in own project", function(done){
				request.post(url + "/photos")
				.set('access-token', subcontractorFirst.token)
				.field("project_id",projectFirst.id)
				.attach("photo","mocha/attachements/normalImage.jpg")
				.end(function(err, res){
					expect(res.status).to.not.be.equal(401);
					done();
				});
			});
			it("should return 401 auth error, when adding photo in other project", function(done){
				request.post(url + "/photos")
				.set('access-token', subcontractorFirst.token)
				.field("project_id",projectSecond.id)
				.attach("photo","mocha/attachements/normalImage.jpg")
				.end(function(err, res){
					expect(res.status).to.be.equal(401);
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