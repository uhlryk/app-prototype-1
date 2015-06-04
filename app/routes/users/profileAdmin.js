/*jslint node: true */
"use strict";
/**
 * sprawdza czy istnieje konto, jeśli nie istnieje to tworzy je,
 * dla danego konta dodaje funkcję administratora profilu
 *	wymagane są tylko pola: phone, profile_id
 *
 * return
 * kod:200
 * id - id Account.id
 * login - Account.phone login
 *
 */

var express = require('express');
var router = new express.Router();
var RuleAccess = require('ruleaccess');
var generatePassword = require('password-generator');
var phone = require('phone');

router.post("/profile_admin/", RuleAccess.isAllowed(), function(req, res, next){
	if(!req.validate(['profile_id', 'firmname', 'phone']))return;
	req.app.get("actions").projectAccounts.createProfileAdmin({
		firstname : req.body.firstname,
		lastname : req.body.lastname,
		firmname: req.body.firmname,
		email : req.body.email,
		phone : req.body.phone,
		password : generatePassword(12, true),
		profileId : req.body.profile_id,
	},false)
	.then(function(account){
		if(account.operation === 'CREATE_NEW' || account.operation === 'ACTIVE_PROPOSITION'){
			req.app.get('sms').send(account.model.phone, {
				firstname : account.model.firstname,
				lastname : account.model.lastname,
				AccountId : account.model.id,
				password : account.password,
				phone : account.model.phone,
			}, function(err, message){
				if(err){
					//todo: zwrócić jakis błąd gdy sms nie wyjdzie
				}
				return res.sendData(200, {id: account.model.id, login: account.model.phone});
			});
		} else {
			return res.sendData(200, {id: account.model.id, login: account.model.phone});
		}
	})
	.catch(function(err){
		return res.sendValidationError(err);
	});
});
module.exports = router;