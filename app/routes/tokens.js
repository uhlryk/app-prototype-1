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

router.get("/tokens/:token", function(req, res, next){
	var token = req.params.token;
	req.app.get("actions").tokens.find({
		token : token
	}, function(err, data){
		if(err !== null){
			return next(err);
		}
		if(data === null){
			return res.sendData(200, {status : "INVALID"});
		} else {
			return res.sendData(200, {status : "VALID"});
		}
	});
});
router.post("/tokens/", function(req, res, next){
	var tokenType = req.body.type;
	var login = req.body.login;
	var password = req.body.password;
	if(tokenType === "super"){//logowanie super admina
		if(login === req.app.get("config").adminAuth.login && password === req.app.get("config").adminAuth.pass){
			var token = uuid.v1();
			req.app.get("actions").tokens.create({
				token:uuid.v1(),
				AccountId:null,
				type:'SUPER',
				data: ""
			}, function(err, data){
				if(err !== null){
					return next(err);
				}
				return res.sendData(200, {token : data.token});
				// return res.sendData({token : data.token});
			});
		} else {
			// return res.sendData(422, "INCORRECT_LOGIN_PASSWORD");
			return res.sendData(422, {message : "INCORRECT_LOGIN_PASSWORD"});
		}
	} else {//logowanie pozostałych userów

	}

	// var role = "admin";
	// if(login === req.config.adminAuth.login && password === req.config.adminAuth.pass){
	// 	token = uuid.v1();
	// 	var data = {
	// 		token : token,
	// 		role : role,
	// 		username : "administrator"
	// 	};
	// 	req.redis.set('t_' + token, JSON.stringify(data), function(error, result) {
	// 			if (error) {
	// 				return res.sendStatus(500);
	// 			} else {
	// 				return res.json(data);
	// 			}
	// 	});
	// }else{
	// 	return res.status(422).send("INCORRECT_LOGIN_PASSWORD");
	// }
});
module.exports = router;
