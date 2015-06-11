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
var deleteFolderRecursive = function(path) {
	if( fs.existsSync(path) ) {
		fs.readdirSync(path).forEach(function(file,index){
			var curPath = path + "/" + file;
			if(fs.lstatSync(curPath).isDirectory()) { // recurse
				deleteFolderRecursive(curPath);
			} else { // delete file
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
	}
};
	//sprawdzamy uprawnienia, nie musimy wysyłać konkretnych danych. Ważne jest czy otrzmany błąd jest 401 czy inny. 401 znaczy że brak uprawnień
	//inny błąd znaczy że dany user ma dostęp do danej metody
describe("Create map test: ", function(){
	var server;
	var helper = require("../helper.js")(server, url);
	var builder;
	var buildData;
	before(function(done){
		server = serverBuilder(config, function(){
			deleteFolderRecursive("./tmp");
			fs.mkdirSync('./tmp');
			deleteFolderRecursive("./public/maps");
			fs.mkdirSync('./public/maps');

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
	describe("Create test:", function(){
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
		it("should not allow when no map", function(done){
			request.post(url + "/maps")
			.set('access-token', leaderFirst.token)
			.field("project_id",projectFirst.id)
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should not allow when different map field", function(done){
			request.post(url + "/maps")
			.set('access-token', leaderFirst.token)
			.field("project_id",projectFirst.id)
			.attach("document_other","mocha/attachements/document.pdf")
			.end(function(err, res){
				expect(res.status).to.be.equal(422);
				expect(res.body.message).to.be.equal("VALIDATION_ERROR");
				expect(res.body.errors).to.include.some.property("type", "REQUIRE_FIELD");
				done();
			});
		});
		it("should not add maps when project not exist", function(done){
			request.post(url + "/maps")
			.set('access-token', leaderFirst.token)
			.field("project_id", 999)
			.attach("document","mocha/attachements/document.pdf")
			.end(function(err, res){
				expect(res.status).to.be.equal(401);
				done();
			});
		});
		it("should not add maps with wrong mime type", function(done){
			request.post(url + "/maps")
			.set('access-token', leaderFirst.token)
			.field("project_id",projectFirst.id)
			.attach("document","mocha/attachements/normalImage.jpg")
			.end(function(err, res){
				expect(res.status).to.be.equal(422);
				expect(res.body.message).to.be.equal("VALIDATION_ERROR");
				expect(res.body.errors).to.include.some.property("type", "REQUIRE_FIELD");
				done();
			});
		});
		it("should add maps by leader", function(done){
			request.post(url + "/maps")
			.set('access-token', leaderFirst.token)
			.field("project_id",projectFirst.id)
			.attach("document","mocha/attachements/document.pdf")
			.end(function(err, res){
				expect(res.status).to.be.equal(200);
				expect(res.body.mapId).to.be.above(0);
				done();
			});
		});
	});
	after(function(done){
		server.close();
		done();
	});
});