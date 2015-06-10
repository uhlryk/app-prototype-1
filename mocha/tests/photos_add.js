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
				profile:1,
				admin : 1,
				buildProject: 1,
				subcontractor_1: 1,
			}, function(result){
				buildData = result;
				done();
			});
		});
	});
	describe("project leader permission test:", function(){
		var projectFirst;
		var leaderFirst;
		var profileFirst;
		var subcontractorFirst;
		before(function(done){
			profileFirst = buildData.profiles[buildData.profileList[0]];
			projectFirst = buildData.projects[profileFirst.projectList[0]];
			leaderFirst = buildData.users[projectFirst.leaderId];
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
		it("should not allow when no photo", function(done){
			request.post(url + "/photos")
			.set('access-token', leaderFirst.token)
			.field("project_id",projectFirst.id)
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should not allow when different photo", function(done){
			request.post(url + "/photos")
			.set('access-token', leaderFirst.token)
			.field("project_id",projectFirst.id)
			.attach("photo_other","mocha/attachements/toBigImage.png")
			.end(function(err, res){
				expect(res.body.message).to.be.equal("VALIDATION_ERROR");
				expect(res.body.errors).to.include.some.property("type", "REQUIRE_FIELD");
				done();
			});
		});
		it("should not add to big photo", function(done){
			request.post(url + "/photos")
			.set('access-token', leaderFirst.token)
			.field("project_id",projectFirst.id)
			.attach("photo","mocha/attachements/toBigImage.png")
			.end(function(err, res){
				expect(res.body.message).to.be.equal("VALIDATION_ERROR");
				expect(res.body.errors).to.include.some.property("type", "SIZE_LARGE");
				done();
			});
		});
		it("should not add photo when no category", function(done){
			request.post(url + "/photos")
			.set('access-token', leaderFirst.token)
			.field("project_id",projectFirst.id)
			.attach("photo","mocha/attachements/normalImage.jpg")
			.end(function(err, res){
				expect(res.body.message).to.be.equal("VALIDATION_ERROR");
				expect(res.body.errors).to.include.some.property("type", "REQUIRE_FIELD");
				done();
			});
		});
		it("should not add photo when project not exist", function(done){
			request.post(url + "/photos")
			.set('access-token', leaderFirst.token)
			.field("project_id", 999)
			.attach("photo","mocha/attachements/normalImage.jpg")
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should not add photo when category is wrong", function(done){
			request.post(url + "/photos")
			.set('access-token', leaderFirst.token)
			.field("project_id", projectFirst.id)
			.field("category","SOMETHING_DUMMY")
			.attach("photo","mocha/attachements/normalImage.jpg")
			.end(function(err, res){
				expect(res.status).to.be.equal(422);
				expect(res.body.message).to.be.equal("PROCESS_ERROR");
				done();
			});
		});
		it("should add photo by leader", function(done){
			request.post(url + "/photos")
			.set('access-token', leaderFirst.token)
			.field("project_id",projectFirst.id)
			.field("category","WAY_OF_MAKING")
			.attach("photo","mocha/attachements/normalImage.jpg")
			.end(function(err, res){
				expect(res.status).to.be.equal(200);
				expect(res.body.photoId).to.be.above(0);
				done();
			});
		});
		it("should add photo by subcontractor", function(done){
			request.post(url + "/photos")
			.set('access-token', subcontractorFirst.token)
			.field("project_id",projectFirst.id)
			.field("category","WAY_OF_MAKING")
			.attach("photo","mocha/attachements/normalImage.jpg")
			.end(function(err, res){
				expect(res.status).to.be.equal(200);
				expect(res.body.photoId).to.be.above(0);
				done();
			});
		});
	});
	after(function(done){
		server.close();
		done();
	});
});