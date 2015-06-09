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
		before(function(done){
			profileFirst = buildData.profiles[buildData.profileList[0]];
			projectFirst = buildData.projects[profileFirst.projectList[0]];
			leaderFirst = buildData.users[projectFirst.leaderId];
			done();
		});
		it("should adding photo", function(done){
			request.post(url + "/photos")
			.set('access-token', leaderFirst.token)
			.field("project_id",projectFirst.id)
			.attach("image","mocha/attachements/normalImage.jpg")
			.end(function(err, res){
				expect(res.status).to.be.equal(200);
				done();
			});
		});
	});
	after(function(done){
		server.close();
		done();
	});
});