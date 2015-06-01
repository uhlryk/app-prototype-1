/*jslint node: true */
"use strict";
/**
 *	obsługuje wszystkie odwołania /profiles/
 *	zasób powiązany z profilamui firm
 */

var express = require('express');
var router = new express.Router();
var RuleAccess = require('ruleaccess');

router.post("/profiles", RuleAccess.isAllowed("PROFILE/CREATE"), function(req, res){
	req.app.get("actions").profiles.create({
		firmname : req.body.firmname,
		nip : req.body.nip,
		street_address : req.body.street_address,
		house_address : req.body.house_address,
		flat_address : req.body.flat_address,
		zipcode_address : req.body.zipcode_address,
		city_address : req.body.city_address,
	})
	.then(function(data){
		return res.sendData(200, {id: data.id, link : "/profiles/" + data.id});
	})
	.catch(function(err){
		return res.sendValidationError(err);
	});
});
module.exports = router;
