/*jslint node: true */
"use strict";
var express = require('express');
var router = new express.Router();

router.use(function(req, res, next) {
	//sprawdzamy jakieś globalne uprawnienia
	next();
});

router.get("/", function(req, res){
	res.status(200).send(req.app.get("config").app.name + " running");
});
router.use("/tokens", require("./tokens/router.js"));

// gdy nie znaleziono routa catch 404 and forward to error handler fallback
router.use(function (req, res, next) {
		var err = new Error('Not Found');
		err.status = 404;
		next(err);
});
module.exports = router;