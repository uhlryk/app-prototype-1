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
	describe("project leader permission test:", function(){
		var projectFirst;
		var leaderFirst;
		var projectSecond;
		var profileFirst;
		var profileSecond;
		before(function(done){
			profileFirst = buildData.profiles[buildData.profileList[0]];
			profileSecond = buildData.profiles[buildData.profileList[1]];
			projectFirst = buildData.projects[buildData.modes.BUILD[0]];
			leaderFirst = buildData.users[projectFirst.leaderId];
			projectSecond = buildData.projects[buildData.modes.BUILD[1]];
			done();
		});
		it("should not return 401 auth error, when creating investor in leaders project", function(done){
			request.post(url + "/users/investor/create")
			.set('access-token', leaderFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.not.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when creating investor in not leaders project", function(done){
			request.post(url + "/users/investor/create")
			.set('access-token', leaderFirst.token)
			.send({"project_id": projectSecond.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should not return 401 auth error, when accept investor in leaders project", function(done){
			request.post(url + "/users/investor/accept")
			.set('access-token', leaderFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.not.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when accept investor in not leaders project", function(done){
			request.post(url + "/users/investor/accept")
			.set('access-token', leaderFirst.token)
			.send({"project_id": projectSecond.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});

		it("should not return 401 auth error, when creating coworker in leaders project", function(done){
			request.post(url + "/users/coworker/create")
			.set('access-token', leaderFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.not.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when creating coworker in not leaders project", function(done){
			request.post(url + "/users/coworker/create")
			.set('access-token', leaderFirst.token)
			.send({"project_id": projectSecond.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should not return 401 auth error, when accept coworker in leaders project", function(done){
			request.post(url + "/users/coworker/accept")
			.set('access-token', leaderFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.not.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when accept coworker in not leaders project", function(done){
			request.post(url + "/users/coworker/accept")
			.set('access-token', leaderFirst.token)
			.send({"project_id": projectSecond.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});

		it("should not return 401 auth error, when creating inspector in leaders project", function(done){
			request.post(url + "/users/inspector/create")
			.set('access-token', leaderFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.not.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when creating inspector in not leaders project", function(done){
			request.post(url + "/users/inspector/create")
			.set('access-token', leaderFirst.token)
			.send({"project_id": projectSecond.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should not return 401 auth error, when accept inspector in leaders project", function(done){
			request.post(url + "/users/inspector/accept")
			.set('access-token', leaderFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.not.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when accept inspector in not leaders project", function(done){
			request.post(url + "/users/inspector/accept")
			.set('access-token', leaderFirst.token)
			.send({"project_id": projectSecond.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});

		it("should not return 401 auth error, when creating designer in leaders project", function(done){
			request.post(url + "/users/designer/create")
			.set('access-token', leaderFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.not.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when creating designer in not leaders project", function(done){
			request.post(url + "/users/designer/create")
			.set('access-token', leaderFirst.token)
			.send({"project_id": projectSecond.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should not return 401 auth error, when accept designer in leaders project", function(done){
			request.post(url + "/users/designer/accept")
			.set('access-token', leaderFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.not.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when accept designer in not leaders project", function(done){
			request.post(url + "/users/designer/accept")
			.set('access-token', leaderFirst.token)
			.send({"project_id": projectSecond.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});

		it("should not return 401 auth error, when creating subcontractor in leaders project", function(done){
			request.post(url + "/users/subcontractor/create")
			.set('access-token', leaderFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.not.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when creating subcontractor in not leaders project", function(done){
			request.post(url + "/users/subcontractor/create")
			.set('access-token', leaderFirst.token)
			.send({"project_id": projectSecond.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should not return 401 auth error, when accept subcontractor in leaders project", function(done){
			request.post(url + "/users/subcontractor/accept")
			.set('access-token', leaderFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.not.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when accept subcontractor in not leaders project", function(done){
			request.post(url + "/users/subcontractor/accept")
			.set('access-token', leaderFirst.token)
			.send({"project_id": projectSecond.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
	});

	describe("profile admin permission test:", function(){
		var projectFirst;
		var adminFirst;
		var projectSecond;
		var profileFirst;
		var profileSecond;
		before(function(done){
			profileFirst = buildData.profiles[buildData.profileList[0]];
			profileSecond = buildData.profiles[buildData.profileList[1]];
			projectFirst = buildData.projects[profileFirst.projectList[0]];
			adminFirst = buildData.users[profileFirst.adminList[0]];
			projectSecond = buildData.projects[profileSecond.projectList[0]];
			done();
		});
		it("should return 401 auth error, when creating investor", function(done){
			request.post(url + "/users/investor/create")
			.set('access-token', adminFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when accept investor", function(done){
			request.post(url + "/users/investor/create")
			.set('access-token', adminFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should not return 401 auth error, when proposes investor", function(done){
			request.post(url + "/users/investor/proposition")
			.set('access-token', adminFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.not.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when proposes investor in not admin project", function(done){
			request.post(url + "/users/investor/proposition")
			.set('access-token', adminFirst.token)
			.send({"project_id": projectSecond.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});

		it("should return 401 auth error, when creating coworker", function(done){
			request.post(url + "/users/coworker/create")
			.set('access-token', adminFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when accept coworker", function(done){
			request.post(url + "/users/coworker/create")
			.set('access-token', adminFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should not return 401 auth error, when proposes coworker", function(done){
			request.post(url + "/users/coworker/proposition")
			.set('access-token', adminFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.not.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when proposes coworker in not admin project", function(done){
			request.post(url + "/users/coworker/proposition")
			.set('access-token', adminFirst.token)
			.send({"project_id": projectSecond.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});

		it("should return 401 auth error, when creating inspector", function(done){
			request.post(url + "/users/inspector/create")
			.set('access-token', adminFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when accept inspector", function(done){
			request.post(url + "/users/inspector/create")
			.set('access-token', adminFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should not return 401 auth error, when proposes inspector", function(done){
			request.post(url + "/users/inspector/proposition")
			.set('access-token', adminFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.not.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when proposes inspector in not admin project", function(done){
			request.post(url + "/users/inspector/proposition")
			.set('access-token', adminFirst.token)
			.send({"project_id": projectSecond.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});

		it("should return 401 auth error, when creating designer", function(done){
			request.post(url + "/users/designer/create")
			.set('access-token', adminFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when accept designer", function(done){
			request.post(url + "/users/designer/create")
			.set('access-token', adminFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should not return 401 auth error, when proposes designer", function(done){
			request.post(url + "/users/designer/proposition")
			.set('access-token', adminFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.not.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when proposes designer in not admin project", function(done){
			request.post(url + "/users/designer/proposition")
			.set('access-token', adminFirst.token)
			.send({"project_id": projectSecond.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});

		it("should NOT return 401 auth error, when creating subcontractor", function(done){
			request.post(url + "/users/subcontractor/create")
			.set('access-token', adminFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.not.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when creating subcontractor in not admin project", function(done){
			request.post(url + "/users/subcontractor/create")
			.set('access-token', adminFirst.token)
			.send({"project_id": projectSecond.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should NOT return 401 auth error, when accept subcontractor", function(done){
			request.post(url + "/users/subcontractor/accept")
			.set('access-token', adminFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.not.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when accept subcontractor in not admin project", function(done){
			request.post(url + "/users/subcontractor/accept")
			.set('access-token', adminFirst.token)
			.send({"project_id": projectSecond.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should not return 401 auth error, when proposes subcontractor", function(done){
			request.post(url + "/users/subcontractor/proposition")
			.set('access-token', adminFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.not.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when proposes subcontractor in not admin project", function(done){
			request.post(url + "/users/subcontractor/proposition")
			.set('access-token', adminFirst.token)
			.send({"project_id": projectSecond.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
	});

	describe("coworker permission test:", function(){
		var projectFirst;
		var coworkerFirst;
		var projectSecond;
		var profileFirst;
		var profileSecond;
		before(function(done){
			profileFirst = buildData.profiles[buildData.profileList[0]];
			profileSecond = buildData.profiles[buildData.profileList[1]];
			projectFirst = buildData.projects[profileFirst.projectList[0]];
			projectFirst.userList.every(function(id){
				var user = buildData.users[id];
				if(user.role === "COWORKER"){
					coworkerFirst = user;
					return false;
				}
				return true;
			});
			projectSecond = buildData.projects[profileSecond.projectList[0]];
			done();
		});
		it("should return 401 auth error, when creating investor", function(done){
			request.post(url + "/users/investor/create")
			.set('access-token', coworkerFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when accept investor", function(done){
			request.post(url + "/users/investor/create")
			.set('access-token', coworkerFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should not return 401 auth error, when proposes investor", function(done){
			request.post(url + "/users/investor/proposition")
			.set('access-token', coworkerFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.not.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when proposes investor in not admin project", function(done){
			request.post(url + "/users/investor/proposition")
			.set('access-token', coworkerFirst.token)
			.send({"project_id": projectSecond.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});

		it("should return 401 auth error, when creating coworker", function(done){
			request.post(url + "/users/coworker/create")
			.set('access-token', coworkerFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when accept coworker", function(done){
			request.post(url + "/users/coworker/create")
			.set('access-token', coworkerFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should not return 401 auth error, when proposes coworker", function(done){
			request.post(url + "/users/coworker/proposition")
			.set('access-token', coworkerFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.not.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when proposes coworker in not admin project", function(done){
			request.post(url + "/users/coworker/proposition")
			.set('access-token', coworkerFirst.token)
			.send({"project_id": projectSecond.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});

		it("should return 401 auth error, when creating inspector", function(done){
			request.post(url + "/users/inspector/create")
			.set('access-token', coworkerFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when accept inspector", function(done){
			request.post(url + "/users/inspector/create")
			.set('access-token', coworkerFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should not return 401 auth error, when proposes inspector", function(done){
			request.post(url + "/users/inspector/proposition")
			.set('access-token', coworkerFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.not.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when proposes inspector in not admin project", function(done){
			request.post(url + "/users/inspector/proposition")
			.set('access-token', coworkerFirst.token)
			.send({"project_id": projectSecond.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});

		it("should return 401 auth error, when creating designer", function(done){
			request.post(url + "/users/designer/create")
			.set('access-token', coworkerFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when accept designer", function(done){
			request.post(url + "/users/designer/create")
			.set('access-token', coworkerFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should not return 401 auth error, when proposes designer", function(done){
			request.post(url + "/users/designer/proposition")
			.set('access-token', coworkerFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.not.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when proposes designer in not admin project", function(done){
			request.post(url + "/users/designer/proposition")
			.set('access-token', coworkerFirst.token)
			.send({"project_id": projectSecond.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});

		it("should NOT return 401 auth error, when creating subcontractor", function(done){
			request.post(url + "/users/subcontractor/create")
			.set('access-token', coworkerFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.not.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when creating subcontractor in not admin project", function(done){
			request.post(url + "/users/subcontractor/create")
			.set('access-token', coworkerFirst.token)
			.send({"project_id": projectSecond.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should NOT return 401 auth error, when accept subcontractor", function(done){
			request.post(url + "/users/subcontractor/accept")
			.set('access-token', coworkerFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.not.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when accept subcontractor in not admin project", function(done){
			request.post(url + "/users/subcontractor/accept")
			.set('access-token', coworkerFirst.token)
			.send({"project_id": projectSecond.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should not return 401 auth error, when proposes subcontractor", function(done){
			request.post(url + "/users/subcontractor/proposition")
			.set('access-token', coworkerFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.not.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when proposes subcontractor in not admin project", function(done){
			request.post(url + "/users/subcontractor/proposition")
			.set('access-token', coworkerFirst.token)
			.send({"project_id": projectSecond.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
	});

	describe("investor permission test:", function(){
		var projectFirst;
		var investorFirst;
		var projectSecond;
		var profileFirst;
		var profileSecond;
		before(function(done){
			profileFirst = buildData.profiles[buildData.profileList[0]];
			profileSecond = buildData.profiles[buildData.profileList[1]];
			projectFirst = buildData.projects[buildData.modes.BUILD[0]];
			projectFirst.userList.every(function(id){
				var user = buildData.users[id];
				if(user.role === "INVESTOR"){
					investorFirst = user;
					return false;
				}
				return true;
			});
			projectSecond = buildData.projects[buildData.modes.BUILD[1]];
			done();
		});
		it("should return 401 auth error, when creating investor", function(done){
			request.post(url + "/users/investor/create")
			.set('access-token', investorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when accept investor", function(done){
			request.post(url + "/users/investor/accept")
			.set('access-token', investorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should not return 401 auth error, when proposes investor", function(done){
			request.post(url + "/users/investor/proposition")
			.set('access-token', investorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.not.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when proposes investor in not investor project", function(done){
			request.post(url + "/users/investor/proposition")
			.set('access-token', investorFirst.token)
			.send({"project_id": projectSecond.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});

		it("should return 401 auth error, when creating coworker", function(done){
			request.post(url + "/users/coworker/create")
			.set('access-token', investorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when accept coworker", function(done){
			request.post(url + "/users/coworker/accept")
			.set('access-token', investorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when proposes coworker", function(done){
			request.post(url + "/users/coworker/proposition")
			.set('access-token', investorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});

		it("should return 401 auth error, when creating inspector", function(done){
			request.post(url + "/users/inspector/create")
			.set('access-token', investorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when accept inspector", function(done){
			request.post(url + "/users/inspector/accept")
			.set('access-token', investorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should not return 401 auth error, when proposes inspector", function(done){
			request.post(url + "/users/inspector/proposition")
			.set('access-token', investorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.not.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when proposes inspector in not investor project", function(done){
			request.post(url + "/users/inspector/proposition")
			.set('access-token', investorFirst.token)
			.send({"project_id": projectSecond.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});

		it("should return 401 auth error, when creating designer", function(done){
			request.post(url + "/users/designer/create")
			.set('access-token', investorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when accept designer", function(done){
			request.post(url + "/users/designer/accept")
			.set('access-token', investorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should not return 401 auth error, when proposes designer", function(done){
			request.post(url + "/users/designer/proposition")
			.set('access-token', investorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.not.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when proposes designer in not investor project", function(done){
			request.post(url + "/users/designer/proposition")
			.set('access-token', investorFirst.token)
			.send({"project_id": projectSecond.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});

		it("should return 401 auth error, when creating subcontractor", function(done){
			request.post(url + "/users/subcontractor/create")
			.set('access-token', investorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when accept subcontractor", function(done){
			request.post(url + "/users/subcontractor/accept")
			.set('access-token', investorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should not return 401 auth error, when proposes subcontractor", function(done){
			request.post(url + "/users/subcontractor/proposition")
			.set('access-token', investorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.not.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when proposes subcontractor in not investor project", function(done){
			request.post(url + "/users/subcontractor/proposition")
			.set('access-token', investorFirst.token)
			.send({"project_id": projectSecond.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
	});

	describe("inspector permission test:", function(){
		var projectFirst;
		var inspectorFirst;
		var projectSecond;
		var profileFirst;
		var profileSecond;
		before(function(done){
			profileFirst = buildData.profiles[buildData.profileList[0]];
			profileSecond = buildData.profiles[buildData.profileList[1]];
			projectFirst = buildData.projects[buildData.modes.BUILD[0]];
			projectFirst.userList.every(function(id){
				var user = buildData.users[id];
				if(user.role === "INSPECTOR"){
					inspectorFirst = user;
					return false;
				}
				return true;
			});
			projectSecond = buildData.projects[buildData.modes.BUILD[1]];
			done();
		});
		it("should return 401 auth error, when creating investor", function(done){
			request.post(url + "/users/investor/create")
			.set('access-token', inspectorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when accept investor", function(done){
			request.post(url + "/users/investor/accept")
			.set('access-token', inspectorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when proposes investor", function(done){
			request.post(url + "/users/investor/proposition")
			.set('access-token', inspectorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});

		it("should return 401 auth error, when creating coworker", function(done){
			request.post(url + "/users/coworker/create")
			.set('access-token', inspectorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when accept coworker", function(done){
			request.post(url + "/users/coworker/accept")
			.set('access-token', inspectorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when proposes coworker", function(done){
			request.post(url + "/users/coworker/proposition")
			.set('access-token', inspectorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});

		it("should return 401 auth error, when creating inspector", function(done){
			request.post(url + "/users/inspector/create")
			.set('access-token', inspectorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when accept inspector", function(done){
			request.post(url + "/users/inspector/accept")
			.set('access-token', inspectorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should not return 401 auth error, when proposes inspector", function(done){
			request.post(url + "/users/inspector/proposition")
			.set('access-token', inspectorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.not.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when proposes inspector in not investor project", function(done){
			request.post(url + "/users/inspector/proposition")
			.set('access-token', inspectorFirst.token)
			.send({"project_id": projectSecond.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});

		it("should return 401 auth error, when creating designer", function(done){
			request.post(url + "/users/designer/create")
			.set('access-token', inspectorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when accept designer", function(done){
			request.post(url + "/users/designer/accept")
			.set('access-token', inspectorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should not return 401 auth error, when proposes designer", function(done){
			request.post(url + "/users/designer/proposition")
			.set('access-token', inspectorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.not.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when proposes designer in not investor project", function(done){
			request.post(url + "/users/designer/proposition")
			.set('access-token', inspectorFirst.token)
			.send({"project_id": projectSecond.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});

		it("should return 401 auth error, when creating subcontractor", function(done){
			request.post(url + "/users/subcontractor/create")
			.set('access-token', inspectorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when accept subcontractor", function(done){
			request.post(url + "/users/subcontractor/accept")
			.set('access-token', inspectorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when proposes subcontractor", function(done){
			request.post(url + "/users/subcontractor/proposition")
			.set('access-token', inspectorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
	});

	describe("designer permission test:", function(){
		var projectFirst;
		var designerFirst;
		var projectSecond;
		var profileFirst;
		var profileSecond;
		before(function(done){
			profileFirst = buildData.profiles[buildData.profileList[0]];
			profileSecond = buildData.profiles[buildData.profileList[1]];
			projectFirst = buildData.projects[buildData.modes.BUILD[0]];
			projectFirst.userList.every(function(id){
				var user = buildData.users[id];
				if(user.role === "DESIGNER"){
					designerFirst = user;
					return false;
				}
				return true;
			});
			projectSecond = buildData.projects[buildData.modes.BUILD[1]];
			done();
		});
		it("should return 401 auth error, when creating investor", function(done){
			request.post(url + "/users/investor/create")
			.set('access-token', designerFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when accept investor", function(done){
			request.post(url + "/users/investor/accept")
			.set('access-token', designerFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when proposes investor", function(done){
			request.post(url + "/users/investor/proposition")
			.set('access-token', designerFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});

		it("should return 401 auth error, when creating coworker", function(done){
			request.post(url + "/users/coworker/create")
			.set('access-token', designerFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when accept coworker", function(done){
			request.post(url + "/users/coworker/accept")
			.set('access-token', designerFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when proposes coworker", function(done){
			request.post(url + "/users/coworker/proposition")
			.set('access-token', designerFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});

		it("should return 401 auth error, when creating inspector", function(done){
			request.post(url + "/users/inspector/create")
			.set('access-token', designerFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when accept inspector", function(done){
			request.post(url + "/users/inspector/accept")
			.set('access-token', designerFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when proposes inspector", function(done){
			request.post(url + "/users/inspector/proposition")
			.set('access-token', designerFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});

		it("should return 401 auth error, when creating designer", function(done){
			request.post(url + "/users/designer/create")
			.set('access-token', designerFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when accept designer", function(done){
			request.post(url + "/users/designer/accept")
			.set('access-token', designerFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should not return 401 auth error, when proposes designer", function(done){
			request.post(url + "/users/designer/proposition")
			.set('access-token', designerFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.not.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when proposes designer in not investor project", function(done){
			request.post(url + "/users/designer/proposition")
			.set('access-token', designerFirst.token)
			.send({"project_id": projectSecond.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});

		it("should return 401 auth error, when creating subcontractor", function(done){
			request.post(url + "/users/subcontractor/create")
			.set('access-token', designerFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when accept subcontractor", function(done){
			request.post(url + "/users/subcontractor/accept")
			.set('access-token', designerFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when proposes subcontractor", function(done){
			request.post(url + "/users/subcontractor/proposition")
			.set('access-token', designerFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
	});

	describe("subcontractor permission test:", function(){
		var projectFirst;
		var subcontractorFirst;
		var subcontractorSecond;
		var projectSecond;
		var profileFirst;
		var profileSecond;
		before(function(done){
			profileFirst = buildData.profiles[buildData.profileList[0]];
			profileSecond = buildData.profiles[buildData.profileList[1]];
			projectFirst = buildData.projects[buildData.modes.BUILD[0]];
			projectFirst.userList.every(function(id){
				var user = buildData.users[id];
				if(user.role === "SUBCONTRACTOR"){
					subcontractorFirst = user;
					return false;
				}
				return true;
			});
			projectFirst.userList.every(function(id){
				var user = buildData.users[id];
				if(user.role === "SUBCONTRACTOR" && user.firmname !== subcontractorFirst.firmname){
					subcontractorSecond = user;
					return false;
				}
				return true;
			});
			projectSecond = buildData.projects[buildData.modes.BUILD[1]];
			done();
		});
		it("should return 401 auth error, when creating investor", function(done){
			request.post(url + "/users/investor/create")
			.set('access-token', subcontractorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when accept investor", function(done){
			request.post(url + "/users/investor/accept")
			.set('access-token', subcontractorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when proposes investor", function(done){
			request.post(url + "/users/investor/proposition")
			.set('access-token', subcontractorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});

		it("should return 401 auth error, when creating coworker", function(done){
			request.post(url + "/users/coworker/create")
			.set('access-token', subcontractorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when accept coworker", function(done){
			request.post(url + "/users/coworker/accept")
			.set('access-token', subcontractorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when proposes coworker", function(done){
			request.post(url + "/users/coworker/proposition")
			.set('access-token', subcontractorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});

		it("should return 401 auth error, when creating inspector", function(done){
			request.post(url + "/users/inspector/create")
			.set('access-token', subcontractorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when accept inspector", function(done){
			request.post(url + "/users/inspector/accept")
			.set('access-token', subcontractorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when proposes inspector", function(done){
			request.post(url + "/users/inspector/proposition")
			.set('access-token', subcontractorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});

		it("should return 401 auth error, when creating designer", function(done){
			request.post(url + "/users/designer/create")
			.set('access-token', subcontractorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when accept designer", function(done){
			request.post(url + "/users/designer/accept")
			.set('access-token', subcontractorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when proposes designer", function(done){
			request.post(url + "/users/designer/proposition")
			.set('access-token', subcontractorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});

		it("should return 401 auth error, when creating subcontractor", function(done){
			request.post(url + "/users/subcontractor/create")
			.set('access-token', subcontractorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when accept subcontractor", function(done){
			request.post(url + "/users/subcontractor/accept")
			.set('access-token', subcontractorFirst.token)
			.send({"project_id": projectFirst.id})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should NOT return 401 auth error, when proposes subcontractor of same firmname", function(done){
			request.post(url + "/users/subcontractor/proposition")
			.set('access-token', subcontractorFirst.token)
			.send({"project_id": projectFirst.id})
			.send({"firmname": subcontractorFirst.firmname})
			.end(function(err, res){
				expect(res.status).to.not.be.equal(401);
				done();
			});
		});
		it("should return 401 auth error, when proposes subcontractor of not same firmname", function(done){
			request.post(url + "/users/subcontractor/proposition")
			.set('access-token', subcontractorFirst.token)
			.send({"project_id": projectFirst.id})
			.send({"firmname": subcontractorSecond.firmname})
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
	});

	after(function(done){
		server.close();
		done();
	});
});