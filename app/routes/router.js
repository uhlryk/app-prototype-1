/*jslint node: true */
"use strict";
var express = require('express');
var router = new express.Router();
router.options("*", function(req, res, next){
		console.log("wejscie dla options");
		res.sendStatus(200);
	});
router.use(function(req, res, next){
	var token = req.headers['access-token'];
	req.user = null;
	if(token){
		// console.log(token);
		req.app.get("actions").tokens.find({
			token : token
		})
		.then(function(data){
			if(data === null){
				return res.sendData(401, {message : "TOKEN_INVALID"});
			} else {
				req.user = data;
				req.setUserData(data);
				return next();
			}
		})
		.catch(function (err) {
			return res.sendValidationError(err);
		});
	} else {
		return next();
	}
});
router.get("/", function(req, res){
	res.status(200).send(req.app.get("config").app.name + " running");
});
router.use(require("./token.js"));
router.use(require("./profile.js"));
router.use(require("./user.js"));
router.use(require("./project.js"));
router.use(require("./photo.js"));
// gdy nie znaleziono routa catch 404 and forward to error handler fallback
router.use(function (req, res, next) {
		var err = new Error('Not Found');
		err.status = 404;
		next(err);
});
module.exports = router;