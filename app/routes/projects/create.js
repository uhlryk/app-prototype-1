/**
 * tworzy projekt, jedynie profile admin może to zrobić
 * wysyłamy postem
 * profile_id
 * name
 * package
 * phone
 * firstname
 * lastname
 * email
 * phone
 */

var express = require('express');
var router = new express.Router();
var RuleAccess = require('ruleaccess');
var generatePassword = require('password-generator');
var phone = require('phone');

router.post("/", RuleAccess.isAllowed(), function(req, res){
	req.checkBody('profile_id', 'INVALID_FIELD').isId();
	req.sanitize('profile_id').toInt();
	req.sanitize("phone").normalizePhone();
	req.checkBody('phone', 'REQUIRE_FIELD').notEmpty();
	var profileId = req.body.profile_id;
	var login = req.body.phone;
	var errors = req.validationErrors();
	if (errors) {
		return res.sendValidationError({name : "ExpressValidationError", errors :errors});
	}
	req.app.get("actions").projects.create({
		//dane dla projektu
		name : req.body.name,
		package : req.body.package,
		ProfileId : profileId,
		//tu dane dla lidera
		firstname : req.body.firstname,
		lastname : req.body.lastname,
		email : req.body.email,
		phone : login,
		password : generatePassword(12, true),
	})
	.then(function(data){
		if(data.sendSMS){
			req.app.get('sms').send(data.phone, {
				firstname : data.firstname,
				lastname : data.lastname,
				AccountId : data.id,
				password : data.password,
				phone : data.phone,
			}, function(err, message){
				if(err){
					//todo: zwrócić jakis błąd gdy sms nie wyjdzie
				}
				return res.sendData(200, {login: data.phone, id: data.ProjectId});
			});
		} else {
			return res.sendData(200, {login: data.phone, id: data.ProjectId});
		}
	})
	.catch(function(err){
		return res.sendValidationError(err);
	});
});

module.exports = router;