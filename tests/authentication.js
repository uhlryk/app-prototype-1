var server = require("../app/server.js");
var config = require("../config/local_test.js");
var expect = require("chai").expect;
var debug = require('debug')('test');

describe("Authentications", function(){
	var runningServer;
	before(function(done){
		server(config)
		.then(function(server){
			runningServer = server;
			debug("Test Server running");
			done();
		});
	});
	after(function(done){
		runningServer.close();
		debug("Test Server stop");
		done();
	});
});