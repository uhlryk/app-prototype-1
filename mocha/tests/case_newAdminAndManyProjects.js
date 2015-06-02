//ok
var serverBuilder = require("../../app/server.js");
var config = require("../../config/local_test.js");
var chai = require("chai");
chai.use(require('chai-things'));
var expect = chai.expect;
var debug = require('debug')('test');
var request = require('superagent');
var url = 'http://localhost:' + config.app.port;

// describe("Create project test: ", function(){
// 	var server;
// 	var helper = require("../helper.js")(server, url);
// 	var builder;
// 	before(function(done){
// 		server = serverBuilder(config, function(){
// 			builder = require("../builder.js")(server, url);
// 			builder({
// 				profile:5,
// 				admin : 5
// 			}, function(){
// 				done();
// 			});
// 		});
// 	});
// 	it("should run", function(done){
// 		done();
// 	});
// 	after(function(done){
// 		server.close();
// 		done();
// 	});
// });