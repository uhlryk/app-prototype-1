//ok
var serverBuilder = require("../../app/server.js");
var config = require("../../config/local_test.js");
var fs = require("fs");
var chai = require("chai");
chai.use(require('chai-things'));
var expect = chai.expect;
var debug = require('debug')('test');
var request = require('superagent');
var url = 'http://localhost:' + config.app.port;
// var io = require('socket.io-client');
// var ioOptions ={
//   transports: ['websocket'],
//   'force new connection': true
// };

	//sprawdzamy uprawnienia, nie musimy wysyłać konkretnych danych. Ważne jest czy otrzmany błąd jest 401 czy inny. 401 znaczy że brak uprawnień
	//inny błąd znaczy że dany user ma dostęp do danej metody
describe("Message test: ", function(){
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
	describe("Send private test:", function(){
		var projectFirst;
		var projectSecond;
		var leaderFirst;
		var leaderSecond;
		var profileFirst;
		var profileSecond;
		var subcontractorFirst;
		var adminFirst;
		var coworkerFirst;
		var investorFirst;
		var inspectorFirst;
		var designerFirst;
		var subcontractorFirstA;
		var subcontractorFirstB;
		before(function(done){
			profileFirst = buildData.profiles[buildData.profileList[0]];
			profileSecond = buildData.profiles[buildData.profileList[1]];
			projectFirst = buildData.projects[profileFirst.projectList[0]];
			projectSecond = buildData.projects[profileSecond.projectList[0]];
			leaderFirst = buildData.users[projectFirst.leaderId];
			leaderSecond = buildData.users[projectSecond.leaderId];
			adminFirst = buildData.users[profileFirst.adminList[0]];
			projectFirst.userList.every(function(id){
				var user = buildData.users[id];
				if(user.role === "COWORKER"){
					coworkerFirst = user;
					return false;
				}
				return true;
			});
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
					subcontractorFirstA = user;
					return false;
				}
				return true;
			});
			projectFirst.userList.every(function(id){
				var user = buildData.users[id];
				if(user.role === "SUBCONTRACTOR" && user.firmname !== subcontractorFirstA.firmname){
					subcontractorFirstB = user;
					return false;
				}
				return true;
			});
			done();
		});
		it("should not allow when message author is not in project (project not exist)", function(done){
				request.post(url + "/messages/private")
				.set('access-token', leaderFirst.token)
				.field("project_id",999)

				.end(function(err, res){
					expect(res.status).to.be.equal(401);
					done();
				});
		});
		it("should not allow when author is in project but is not set recipient", function(done){
				request.post(url + "/messages/private")
				.set('access-token', leaderFirst.token)
				.send({project_id:projectFirst.id})
				.end(function(err, res){
					expect(res.status).to.be.equal(422);
					expect(res.body.message).to.be.equal("VALIDATION_ERROR");
					expect(res.body.errors).to.include.some.property("type", "INVALID_FIELD");
					done();
				});
		});
		it("should not allow when recipient is message author(same user cant add himself)", function(done){
				request.post(url + "/messages/private")
				.set('access-token', leaderFirst.token)
				.send({project_id:projectFirst.id})
				.send({account_id:leaderFirst.id})
				.end(function(err, res){
					expect(res.status).to.be.equal(422);
					expect(res.body.message).to.be.equal("PROCESS_ERROR");
					expect(res.body.type).to.be.equal("OWNER_RECIPIENT");
					done();
				});
		});
		it("should not allow when recipient is not in project", function(done){
				request.post(url + "/messages/private")
				.set('access-token', leaderFirst.token)
				.send({project_id:projectFirst.id})
				.send({account_id:leaderSecond.id})
				.end(function(err, res){
					expect(res.status).to.be.equal(422);
					expect(res.body.message).to.be.equal("PROCESS_ERROR");
					expect(res.body.type).to.be.equal("NO_PROJECT");
					done();
				});
		});
		it("should not allow when recipient and author roles are incorrect", function(done){
				request.post(url + "/messages/private")
				.set('access-token', subcontractorFirstA.token)
				.send({project_id:projectFirst.id})
				.send({account_id:designerFirst.id})
				.end(function(err, res){
					expect(res.status).to.be.equal(422);
					expect(res.body.message).to.be.equal("PROCESS_ERROR");
					expect(res.body.type).to.be.equal("ROLE_ADD_ROLE");
					done();
				});
		});
		it("should not allow when recipient and author roles are incorrect (check subcontractors with not equal firmnames)", function(done){
				request.post(url + "/messages/private")
				.set('access-token', subcontractorFirstA.token)
				.send({project_id:projectFirst.id})
				.send({account_id:subcontractorFirstB.id})
				.end(function(err, res){
					expect(res.status).to.be.equal(422);
					expect(res.body.message).to.be.equal("PROCESS_ERROR");
					expect(res.body.type).to.be.equal("ROLE_ADD_ROLE");
					done();
				});
		});
		it("should  allow when everything is ok (test without photos)", function(done){
				request.post(url + "/messages/private")
				.set('access-token', subcontractorFirstA.token)
				.send({project_id:projectFirst.id})
				.send({account_id:leaderFirst.id})
				.send({content:"jakas wiadomość"})
				.end(function(err, res){
					expect(res.status).to.be.equal(200);
					expect(res.body.groupId).to.be.above(0);
					done();
				});
		});
		it("should add photo inspector and send it by private message to designer", function(done){
			request.post(url + "/photos")
			.set('access-token', inspectorFirst.token)
			.field("project_id",projectFirst.id)
			.field("category","WAY_OF_MAKING")
			.attach("photo","mocha/attachements/normalImage.jpg")
			.end(function(err, res){
				var photoId = res.body.photoId;
				request.post(url + "/messages/private")
				.set('access-token', inspectorFirst.token)
				.send({project_id:projectFirst.id})
				.send({account_id:designerFirst.id})
				.send({content:"jakas wiadomość"})
				.send({photo:[photoId]})
				.end(function(err, res){
					expect(res.status).to.be.equal(200);
					expect(res.body.groupId).to.be.above(0);
					done();
				});
			});
		});
		it("should  allow answer on message", function(done){
				request.post(url + "/messages/private")
				.set('access-token', subcontractorFirstB.token)
				.send({project_id:projectFirst.id})
				.send({account_id:leaderFirst.id})
				.send({content:"jakas wiadomośćA"})
				.end(function(err, res){
					var groupId = res.body.groupId;
					request.post(url + "/messages/private")
					.set('access-token', leaderFirst.token)
					.send({project_id:projectFirst.id})
					.send({account_id:subcontractorFirstB.id})
					.send({content:"jakas wiadomośćB"})
					.end(function(err, res){
						expect(res.status).to.be.equal(200);
						expect(res.body.groupId).to.be.above(0);
						expect(res.body.groupId).to.be.equal(groupId);
						done();
					});
				});
		});
		it("should  allow send message twice)", function(done){
				request.post(url + "/messages/private")
				.set('access-token', subcontractorFirstA.token)
				.send({project_id:projectFirst.id})
				.send({account_id:leaderFirst.id})
				.send({content:"jakas wiadomość"})
				.end(function(err, res){
					var groupId = res.body.groupId;
					request.post(url + "/messages/private")
					.set('access-token', subcontractorFirstA.token)
					.send({project_id:projectFirst.id})
					.send({account_id:leaderFirst.id})
					.send({content:"jakas wiadomość inna"})
					.end(function(err, res){
						expect(res.status).to.be.equal(200);
						expect(res.body.groupId).to.be.above(0);
						expect(res.body.groupId).to.be.equal(groupId);
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