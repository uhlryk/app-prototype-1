/*jslint node: true */
"use strict";
var config = require("./config/config.js");
var serverBuilder = require('./app/server.js');
var server = serverBuilder(config, function(){

});
