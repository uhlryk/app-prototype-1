/*jslint node: true */
"use strict";
/**
 * sprawdza czy istnieje konto, jeśli nie istnieje to tworzy je,
 * dla danego konta dodaje funkcję administratora profilu
 *	wymagane są tylko pola: phone, profile_id
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
	req.app.get("actions").profiles.findShort(profileId,
	function(err, profileModel){
		if(err !== null){
			console.log(err);
			return res.sendValidationError(err);
		}
		if(req.user.type === "USER"){
			if(profileModel.Accounts.indexOf(req.user.AccountId) === -1){//znaczy że dany admin nie administruje profilem dla którego chce zrobić nowego admina
				return res.sendValidationError({name : "AwProccessError", type : "WRONG_VALUE"});
			}
			//znaczy że dany admin ma uprawnienia do dodania admina do tego profilu
		}
		req.app.get("actions").accounts.createProfileAdmin({
			firstname : req.body.firstname,
			lastname : req.body.lastname,
			email : req.body.email,
			phone : phoneValid[0],
			password : generatePassword(12, true),
			ProfileId : profileId,
		}, function(err, accountData){
			if(err !== null){
				return res.sendValidationError(err);
			}
			if(accountData.sendSMS){
				req.app.get('sms').send(accountData.phone, {
					type : "NEW_USER_CREATE",//NEW_USER_PROPOSITION, CHANGE_USER, OLD_USER
					firstname : accountData.firstname,
					lastname : accountData.lastname,
					AccountId : accountData.id,
					password : accountData.password,
					phone : accountData.phone,
				}, function(err, message){
					if(err){
						//todo: zwrócić jakis błąd gdy sms nie wyjdzie
					}
					return res.sendData(200, {login: accountData.phone});
				});
			} else {
				return res.sendData(200, {login: accountData.phone});
			}
		});
	});
});
module.exports = router;