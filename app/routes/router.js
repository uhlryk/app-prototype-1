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
		}, function(err, data){
			if(err !== null){
				return next(err);
			}
			if(data === null){
				return res.sendData(401, {message : "TOKEN_INVALID"});
			} else {
				req.user = {
					type:data.type,
					AccountId : data.AccountId,
					data : data.data
				};
				return next();
			}
		});
	} else {
		return next();
	}
});
router.get("/", function(req, res){
	res.status(200).send(req.app.get("config").app.name + " running");
});
router.use(require("./tokens.js"));
router.use(require("./profiles.js"));
router.use("/users", require("./users.js"));

// gdy nie znaleziono routa catch 404 and forward to error handler fallback
router.use(function (req, res, next) {
		var err = new Error('Not Found');
		err.status = 404;
		next(err);
});
module.exports = router;