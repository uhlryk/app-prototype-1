/*jslint node: true */
"use strict";
module.exports = function(config, callback) {
	var express = require('express');
	var path = require('path');
	var bodyParser = require("body-parser");
	var logger = require('morgan');
	var favicon = require('serve-favicon');
	var http = require("http");
	var debug = require('debug')('server');
	var validationErrorParser = require("./libs/validationErrorParser");
	var smsManager = require("./libs/smsManager");
	var expressValidator = require('express-validator');
	var app = express();
	app.use(favicon(__dirname + '/../public/favicon.ico'));
	app.use(logger('dev', {
		skip: function (req, res) { return config.log.mute; }
	}));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({extended: true}));
	app.use(expressValidator({
		customValidators: require("./libs/validatorList.js").validators,
		customSanitizers : require("./libs/validatorList.js").sanitizers,
	}));
	app.use(function (req, res, next) {
		res.header('Access-Control-Allow-Origin', "*");
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
		res.header('Access-Control-Allow-Headers', 'Content-Type, Access-Token, Accept, Origin, X-Requested-With');
		next();
	});
	app.use(function(req, res, next){
		res.sendData = function(status, jsonData){
			if(jsonData){
				res.status(status).json(jsonData);
			} else {
				res.sendStatus(status);
			}
		};
		res.sendValidationError = function(validationError){
			res.status(422).json(validationErrorParser(validationError));
		};
		next();
	});
	var models = require("./models/index")(config.db);
	var actions = require("./actions")({
		models : models
	});
	app.set('sms', smsManager(config.app.sms));
	app.set('config', config);
	app.set('models', models);
	app.set('actions', actions);
	app.set('port', config.app.port);
	/**
	 * router
	 */
	app.use(require("./routes/router"));

	var server = http.createServer(app);

	if(config.app.sms === false){
		server.getSmsDebug = app.get('sms').get;
	}

	server.on('error', onError);
	server.on('listening', onListening);
	server.on('close', onClose);
	// error handlers
	// development error handler
	// will print stacktrace
	if (config.app.env === 'development') {
		app.use(function (err, req, res, next) {
			debug(err);
			res.sendData(err.status || 500, {
				message: err.message,
				error: err
			});
		});
	}
	// production error handler
	// no stacktraces leaked to user
	app.use(function (err, req, res, next) {
		debug(err);
		res.sendData(err.status || 500, {
			message: err.message,
			error: {}
		});
	});
	function onError(error) {
		if (error.syscall !== 'listen') {
			throw error;
		}
		switch (error.code) {
			case 'EACCES':
			console.error(' requires elevated privileges');
			process.exit(1);
			break;
			case 'EADDRINUSE':
			console.error(' is already in use');
			process.exit(1);
			break;
			default:
			throw error;
		}
	}
	function onClose() {
		debug("Server Stopped");
	}
	/**
	* Event listener for HTTP server "listening" event.
	*/
	function onListening() {
		var addr = server.address();
		var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
		debug('Listening on ' + bind);
	}
	/**
	* przed odpaleniem serwera chcemy warunkowo wyczyścić bazę danych (przy tworzeniu bazy jest to wskazane)
	* następnie zsynchronizać i utworzyć tabele. Jest to proces asynchroniczny. Który chcę odpalić przed serwerem
	* Dlatego użyte tu są promise drop>sync>runserver>return promice> w pliku odpalającym mamy .then
	*/
	models.sequelize
	.drop().then(function (){
		return models.sequelize.sync();
	})
	.then(function (){
		debug("start mode : " + process.env.NODE_ENV);
		server.listen(app.get("port"));
		callback();
	});
	return server;
};