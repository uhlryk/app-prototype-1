/**
 * Lider projektu zmienia tryb projektu z budowa na serwis
 * Wskazujemy też nowego lidera lub informujemy że obecny jest liderem
 * wysyłamy postem
 * project_id
 * warranty liczba określająca liczbę miesięcy jakie trwa gwarancja
 * is_new_leader jeśli true to musimy podać przynajmniej telefon nowego lidera
 *
 */

var express = require('express');
var router = new express.Router();
var generatePassword = require('password-generator');
var phone = require('phone');

router.post("/mode/service", function(req, res){
	if(req.user === null)return res.sendData(401, {message : "NO_TOKEN"});
	if(req.user.type === "SUPER")return res.sendData(403, {message : "NO_AUTHORIZATION"});
	req.checkBody('project_id', 'INVALID_FIELD').isId();
	var projectId = req.body.project_id;
	req.checkBody('warranty', 'REQUIRE_FIELD').isInt();
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
		warranty : req.body.warranty,
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