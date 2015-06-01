/**
 * Lider projektu zmienia tryb projektu z budowa na serwis
 * Wskazujemy też nowego lidera lub informujemy że obecny jest liderem
 * wysyłamy postem
 * project_id
 * warranty_date liczba określająca liczbę miesięcy jakie trwa gwarancja
 * is_new_leader jeśli true to musimy podać przynajmniej telefon nowego lidera
 *
 */

var express = require('express');
var router = new express.Router();
var RuleAccess = require('ruleaccess');
var generatePassword = require('password-generator');
var phone = require('phone');

router.post("/mode/service", RuleAccess.isAllowed("PROJECT/SET_MODE_SERVICE"), function(req, res){
	req.checkBody('project_id', 'INVALID_FIELD').isId();
	req.sanitize('project_id').toInt();
	var projectId = req.body.project_id;
	req.checkBody('warranty_date', 'INVALID_FIELD').isDate();
	req.sanitize('warranty_date').toDate();
	req.sanitize("is_new_leader").toBoolean();
	var isNewLeader = req.body.is_new_leader;
	if(isNewLeader){
		req.sanitize("phone").normalizePhone();
		req.checkBody('phone', 'REQUIRE_FIELD').notEmpty();
	}
	var errors = req.validationErrors();
	if (errors) {
		return res.sendValidationError({name : "ExpressValidationError", errors :errors});
	}
	req.app.get("actions").projects.setServiceMode({
		projectId : projectId,
		warranty_date : req.body.warranty_date,
		isNewLeader : isNewLeader,
		//tu dane dla lidera
		firstname : req.body.firstname,
		lastname : req.body.lastname,
		email : req.body.email,
		phone : req.body.phone,
		password : generatePassword(12, true),
	})
	.then(function(data){
		if(data.accountOperation === 'CREATE_NEW' || data.accountOperation === 'ACTIVE_PROPOSITION'){
			//wysyłamy sms
			return res.sendData(200);
		} else {
			return res.sendData(200);
		}
	})
	.catch(function (err) {
		return res.sendValidationError(err);
	});
});

module.exports = router;