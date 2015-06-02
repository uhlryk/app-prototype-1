/*jslint node: true */
"use strict";
/**
 * sprawdza czy istnieje konto, jeśli nie istnieje to tworzy je,
 * dla danego konta dodaje funkcję administratora profilu
 *	wymagane są tylko pola: phone, profile_id
 */

var express = require('express');
var router = new express.Router();
var RuleAccess = require('ruleaccess');
var generatePassword = require('password-generator');
var phone = require('phone');

router.post("/profile_admin", RuleAccess.isAllowed(), function(req, res, next){
	req.checkBody('profile_id', 'INVALID_FIELD').isId();
	req.sanitize('profile_id').toInt();
	var profileId = req.body.profile_id;
	req.sanitize("phone").normalizePhone();
	req.checkBody('phone', 'REQUIRE_FIELD').notEmpty();
	var errors = req.validationErrors();
	if (errors) {
		return res.sendValidationError({name : "ExpressValidationError", errors :errors});
	}
	req.app.get("actions").accounts.createProfileAdmin({
		firstname : req.body.firstname,
		lastname : req.body.lastname,
		email : req.body.email,
		phone : req.body.phone,
		password : generatePassword(12, true),
		ProfileId : profileId,
	})
	.then(function(accountData){
		if(accountData.sendSMS){
			req.app.get('sms').send(accountData.phone, {
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
	})
	.catch(function(err){
		return res.sendValidationError(err);
	});
});
module.exports = router;