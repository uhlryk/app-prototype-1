/*jslint node: true */
"use strict";
/**
 *	obsługuje wszystkie odwołania /users/
 *	tworzy administratora profilu
 */

var express = require('express');
var router = new express.Router();
var generatePassword = require('password-generator');
var phone = require('phone');

router.post("/profile_admin/", function(req, res, next){
	if(req.user === null)return res.sendData(401, {message : "NO_TOKEN"});
	var profileId = Number(req.body.profile_id);//do jakiego profilu firmy jest ten user - zastosowanie tylko dla profile_admin
	if(Number.isNaN(profileId) || profileId <=0 )return res.sendValidationError({name : "AwValidationError", errors :[{type : "REQUIRE_FIELD", field:"profile_id"}]});
	var phoneValid = phone(req.body.phone);
	if(phoneValid[0] === null){
		return res.sendValidationError({name : "AwValidationError", errors :[{type : "WRONG_PHONE", field:"phone"}]});
	}
	req.app.get("actions").profiles.find({//zwracamy listę która zawiera id profili i dla każdego profilu listę id profile_admin
		profileAttributes : ['id'],
		accountAttributes : ['id'],
		profileId : profileId
	}, function(err, profileModel){
		if(err !== null){
			return res.sendValidationError(err);
		}
		if(profileModel === null){//znaczy że nie mamy takiego profilu
			return res.sendValidationError({name : "AwValidationError", errors :[{type : "WRONG_VALUE", field:"profile_id"}]});
		}
		if(req.user.type === "USER"){
			return res.sendData(404, {message : "NOT_IMPLEMENTED"});
			//TODO: dodać obsługę USER type
			//sprawdzamy czy użytkownik jest też administratorem profilu, bo tylko wtedy może dodać kolejnego
			//wystarczy sprawdzić czy jego req.user.AccountId znajduje sie na liście profileFromList
		}
		//tworzymy usera
		req.app.get("actions").accounts.createProfileAdmin({
			firstname : req.body.firstname,
			lastname : req.body.lastname,
			email : req.body.email,
			phone : phoneValid[0],
			password : generatePassword(12, true),
			ProfileId : profileId,
		}, function(err, accountData){
			if(err !== null){
				// console.log(err);
				return res.sendValidationError(err);
			}
			return res.sendData(200, {id: accountData.AccountId, password: accountData.password, login : accountData.phone});
			//TODO: wysyłka smsa

		});
	});
});
module.exports = router;