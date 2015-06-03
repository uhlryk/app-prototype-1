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

router.post("/mode/service", RuleAccess.isAllowed(), function(req, res){
	req.sanitize("is_new_leader").toBoolean();
	if(req.body.is_new_leader){
		if(!req.validate(['project_id', 'firmname', 'warranty_date', 'phone']))return;
	} else {
		if(!req.validate(['project_id', 'firmname', 'warranty_date']))return;
	}

	req.app.get("actions").projects.setServiceMode({
		projectId : req.body.project_id,
		warranty_date : req.body.warranty_date,
		isNewLeader : req.body.is_new_leader,
		//tu dane dla lidera
		firmname : req.body.firmname,
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