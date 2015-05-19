/*jslint node: true */
"use strict";
/**
 *	obsługuje wszystkie odwołania /profiles/
 *	zasób powiązany z profilamui firm
 */

var express = require('express');
var router = new express.Router();

router.post("/profiles", function(req, res){
	if(req.user === null || req.user.type !== "SUPER"){
		return res.sendStatus(401);
	}
	req.app.get("actions").profiles.createProfile({
		firmname : req.body.firmname,
		nip : req.body.nip,
		street_address : req.body.street_address,
		house_address : req.body.house_address,
		flat_address : req.body.flat_address,
		zipcode_address : req.body.zipcode_address,
		city_address : req.body.city_address,
	}, function(err, data){
		if(err !== null){
			console.log(err);
			return res.sendValidationError(err);
		}
		return res.sendData(200, {link : "/profiles/" + data.id});
	});
});
module.exports = router;
