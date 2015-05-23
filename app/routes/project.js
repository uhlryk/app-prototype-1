/*jslint node: true */
"use strict";
/**
 *	obsługuje wszystkie odwołania /projects/
 *	zasób powiązany z projektami
 */

var express = require('express');
var router = new express.Router();
var phone = require('phone');
var generatePassword = require('password-generator');

router.post("/projects", function(req, res){
	if(req.user === null)return res.sendData(401, {message : "NO_TOKEN"});
	if(req.user.type === "SUPER")return res.sendData(403, {message : "NO_AUTHORIZATION"});

	var profileId = Number(req.body.profile_id);//do jakiego profilu firmy jest ten user - zastosowanie tylko dla profile_admin
	if(Number.isNaN(profileId) || profileId <=0 )return res.sendValidationError({name : "AwValidationError", errors :[{type : "REQUIRE_FIELD", field:"profile_id"}]});
	var phoneValid = phone(req.body.phone);
	if(phoneValid[0] === null){
		return res.sendValidationError({name : "AwValidationError", errors :[{type : "WRONG_PHONE", field:"phone"}]});
	}

	req.app.get("actions").profiles.findShort(profileId,
	function(err, profileModel){
		if(err !== null){
			console.log(err);
			return res.sendValidationError(err);
		}
		if(profileModel.Accounts.indexOf(req.user.AccountId) === -1){//znaczy że dany admin nie administruje profilem dla którego chce zrobić nowego admina
			return res.sendValidationError({name : "AwProccessError", type : "WRONG_VALUE"});
		}
		//wiemy że mamy do czynienia z adminem danego profilu
		req.app.get("actions").projects.create({
			//dane dla projektu
			name : req.body.name,
			package : req.body.package,
			ProfileId : profileId,
			//tu dane dla lidera
			firstname : req.body.firstname,
			lastname : req.body.lastname,
			email : req.body.email,
			phone : phoneValid[0],
			password : generatePassword(12, true),
		}, function(err, data){
			if(err !== null){
				return res.sendValidationError(err);
			}
			return res.sendData(200, {type: data.type, id: data.ProjectId});
		});

	});

});
module.exports = router;