/*jslint node: true */
"use strict";
/**
 *	obsługuje wszystkie odwołania /tokens/
 *	powiązane z otrzymaniem smodzielnego tokena
 *	do tego używane są zasoby Account
 */
var express = require('express');
var uuid = require('node-uuid');
var bcrypt = require('bcrypt');
var router = new express.Router();

router.get("/tokens/:token/", function(req, res, next){
	var token = req.params.token;
	req.app.get("actions").tokens.find({
		token : token
	})
	.then(function(data){
		if(data === null){
			return res.sendData(200, {status : "INVALID"});
		} else {
			return res.sendData(200, {status : "VALID"});
		}
	})
	.catch(function (err) {
		// console.log(err);
		return res.sendValidationError(err);
	});
});
router.post("/tokens/", function(req, res, next){
	var tokenType = req.body.type;
	var login = req.body.login;//nie walidujemy telefonu na tym poziomie, ponieważ to już nie telefon a login, więc ma się zgadzać
	var password = req.body.password;
	if(tokenType === "super"){//logowanie super admina
		if(login === req.app.get("config").adminAuth.login && password === req.app.get("config").adminAuth.pass){
			req.app.get("actions").tokens.create({
				token:uuid.v1(),
				accountId:null,
				type:'SUPER',
				data: ""
			})
			.then(function(data){
				return res.sendData(200, {token : data.model.token});
			})
			.catch(function (err) {
				return res.sendValidationError(err);
			});
		} else {
			//TODO: zmienić na sendValidationError i pomyśleć nad zmianą kodu
			return res.sendData(422, {message : "INCORRECT_LOGIN_PASSWORD"});
		}
	} else {//logowanie pozostałych userów
		req.app.get("actions").accounts.find({
			phone : login
		}, false)
		.then(function(data){
			if(data === null){
				//TODO: zmienić na sendValidationError i pomyśleć nad zmianą kodu
				return res.sendData(422, {message : "INCORRECT_LOGIN_PASSWORD"});
			}
			if(bcrypt.compareSync(password, data.password)){
				req.app.get("actions").tokens.create({
					token:uuid.v1(),
					accountId:data.id,
					data: ""
				})
				.then(function(data){
					return res.sendData(200, {token : data.model.token});
				})
				.catch(function (err) {
					return res.sendValidationError(err);
				});
			}else{
					//TODO: zmienić na sendValidationError i pomyśleć nad zmianą kodu
				return res.sendData(422, {message : "INCORRECT_LOGIN_PASSWORD"});
			}
		})
		.catch(function (err) {
			return res.sendValidationError(err);
		});
	}
});
module.exports = router;
