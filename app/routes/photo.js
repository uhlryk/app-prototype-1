/*jslint node: true */
"use strict";
/**
 *	obsługuje zdjęcia projektów
 */

var express = require('express');
var router = new express.Router();
var multer  = require('multer');
var RuleAccess = require('ruleaccess');

router.post("/photos/", multer({ dest: './uploads/'}), RuleAccess.isAllowed(), function(req, res){
	console.log(req.files);
	return res.sendData(200);
});
module.exports = router;
