/*jslint node: true */
"use strict";
var config = require("./config/config.js");
var server = require('./app/server.js');
server(config)
.then(function(server){
//tu ewentualne jakieś odpalenia gdy sukces
});
