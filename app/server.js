/*jslint node: true */
"use strict";
module.exports = function(config) {
		var express = require('express');
		var path = require('path');
		var bodyParser = require("body-parser");
		var logger = require('morgan');
		var favicon = require('serve-favicon');
		var http = require("http");
		var debug = require('debug')('server');
		var app = express();
		app.use(favicon(__dirname + '/../public/favicon.ico'));
		app.use(logger('dev'));
		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({extended: true}));
		app.use(function (req, res, next) {
				res.header('Access-Control-Allow-Origin', "*");
				res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
				res.header('Access-Control-Allow-Headers', 'Content-Type, Access-Token, Accept, Origin, X-Requested-With');
				next();
		});
		var models = require("./models/index")(config.db);
		app.set('config', config);
		app.set('models', models);
		app.set('port', config.app.port);
		app.use(require("./routes/router"));

		//tworzymy serwer
		var server = http.createServer(app);
		server.on('error', onError);
		server.on('listening', onListening);
		server.on('close', onClose);
// error handlers
// development error handler
// will print stacktrace
		if (config.app.env === 'development') {
				app.use(function (err, req, res, next) {
						res.status(err.status || 500);
						res.json({
								message: err.message,
								error: err
						});
				});
		}
// production error handler
// no stacktraces leaked to user
		app.use(function (err, req, res, next) {
				res.status(err.status || 500);
				res.json({
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
		return models.sequelize
		.drop().then(function (){
			return models.sequelize.sync();
		})
		.then(function (){
			debug("start mode : " + process.env.NODE_ENV);
			return server.listen(app.get("port"));
		});
};