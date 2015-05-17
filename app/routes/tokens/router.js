/*jslint node: true */
"use strict";
/**
 *	obsługuje wszystkie odwołania /authentications/
 */

var express = require('express');
var router = new express.Router();
//lub router.get("/", function(req, res){...});
router.route("/")
	.get(function(req, res){
		res.status(200);
		res.json({ok:"okk"});
	});
module.exports = router;
